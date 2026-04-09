"""
T310 (LINBLE 4G Industrial Router + Serial Communication Server) MQTT Listener
===============================================================================
รับข้อมูลกระแสไฟ JSON จาก T310 แล้วบันทึกลง power_records table

Flow:  Energy Meter → RS485 → T310 → MQTT Broker → Listener (ไฟล์นี้) → MySQL

การตั้งค่า T310 web UI:
  - MQTT Server: <your broker IP>
  - MQTT Port: 1883
  - Topic: ksystem/meter/<device_id>/data   (ตั้งเองได้)
  - Payload Format: JSON
  - ตั้งชื่อ register ให้ตรงกับ FIELD_MAP ด้านล่าง
"""

import paho.mqtt.client as mqtt
import mysql.connector
import json
import logging
import os
import time
from datetime import datetime

# ─────────────────────────────────────────────
# การตั้งค่า — แก้ชุดนี้ให้ตรงกับ environment
# ─────────────────────────────────────────────

def _parse_env_file(path: str):
    """โหลดค่า env แบบง่ายๆ จากไฟล์ .env (ถ้าไฟล์มีอยู่)"""
    if not os.path.exists(path):
        return

    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")

                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        # ไม่ fail ทั้งโปรแกรมถ้าอ่านไฟล์ env ไม่ได้
        pass


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


# โหลด .env จาก root project และโฟลเดอร์ mqtt-services (ถ้ามี)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
_parse_env_file(os.path.join(PROJECT_ROOT, ".env"))
_parse_env_file(os.path.join(CURRENT_DIR, ".env"))

MQTT_BROKER   = os.getenv("T310_MQTT_BROKER", "localhost")
MQTT_PORT     = _env_int("T310_MQTT_PORT", 1883)
MQTT_USERNAME = os.getenv("T310_MQTT_USERNAME", "")  # ใส่ถ้า broker ต้องการ
MQTT_PASSWORD = os.getenv("T310_MQTT_PASSWORD", "")
# Topic ที่ T310 ส่งมา — ใช้ wildcard '+' เพื่อรับทุก device
MQTT_TOPIC    = os.getenv("T310_MQTT_TOPIC", "ksystem/meter/+/data")

DB_HOST       = os.getenv("T310_DB_HOST", os.getenv("MYSQL_HOST", "localhost"))
DB_USER       = os.getenv("T310_DB_USER", os.getenv("MYSQL_USER", "ksystem"))
DB_PASSWORD   = os.getenv("T310_DB_PASSWORD", os.getenv("MYSQL_PASSWORD", "Zera2026Admin"))
DB_NAME       = os.getenv("T310_DB_NAME", os.getenv("MYSQL_DATABASE", "ksystem"))

# ─────────────────────────────────────────────
# Field mapping: ชื่อ key ใน JSON payload ของ T310
# ปรับให้ตรงกับชื่อที่ตั้งใน T310 web UI
# ─────────────────────────────────────────────
FIELD_MAP = {
    # Voltage Line-to-Neutral (V)
    "voltage_l1": ["V1", "Va", "Ua", "voltage_a", "v1", "Voltage_A"],
    "voltage_l2": ["V2", "Vb", "Ub", "voltage_b", "v2", "Voltage_B"],
    "voltage_l3": ["V3", "Vc", "Uc", "voltage_c", "v3", "Voltage_C"],

    # Current (A)
    "current_l1": ["I1", "Ia", "current_a", "i1", "Current_A"],
    "current_l2": ["I2", "Ib", "current_b", "i2", "Current_B"],
    "current_l3": ["I3", "Ic", "current_c", "i3", "Current_C"],

    # Power
    "active_power":   ["P", "kW", "active_power", "Pt", "TotalP"],
    "reactive_power": ["Q", "kVAR", "reactive_power", "Qt", "TotalQ"],
    "apparent_power": ["S", "kVA", "apparent_power", "St", "TotalS"],

    # Power Quality
    "power_factor": ["PF", "pf", "power_factor", "CosPhi", "cos_phi"],
    "frequency":    ["F", "Freq", "frequency", "Hz"],
    "thd":          ["THD", "thd", "THD_I", "Thd"],

    # Energy
    "energy_kwh": ["kWh", "E", "Ep", "TotalEnergy", "energy", "KWH"],

    # Device identifier (อาจอยู่ใน payload หรืออ่านจาก topic)
    "device_id": ["device_id", "sn", "SN", "id", "mid"],
}

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        autocommit=False,
        connection_timeout=10,
    )


def extract_field(data: dict, field_key: str):
    """
    ดึง value จาก JSON โดยลองทุก alias ใน FIELD_MAP
    คืน None ถ้าไม่พบ
    """
    for alias in FIELD_MAP.get(field_key, []):
        if alias in data:
            val = data[alias]
            if val is None or val == "":
                return None
            try:
                return float(val)
            except (ValueError, TypeError):
                return None
    return None


def extract_device_id_from_topic(topic: str) -> str:
    """
    ดึง device_id จาก topic เช่น  ksystem/meter/METER001/data  →  'METER001'
    """
    parts = topic.split("/")
    # ตัวอย่าง: ksystem / meter / <device_id> / data
    if len(parts) >= 3:
        return parts[-2]
    return "unknown"


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("✅ เชื่อมต่อ MQTT Broker สำเร็จ")
        client.subscribe(MQTT_TOPIC)
        logger.info(f"📡 Subscribe topic: {MQTT_TOPIC}")
    else:
        codes = {
            1: "protocol version refused",
            2: "client ID rejected",
            3: "server unavailable",
            4: "bad username/password",
            5: "not authorised",
        }
        logger.error(f"❌ เชื่อมต่อล้มเหลว: {codes.get(rc, f'rc={rc}')}")


def on_disconnect(client, userdata, rc):
    if rc != 0:
        logger.warning("⚠️  MQTT หลุด — รอเชื่อมต่อใหม่...")


def on_message(client, userdata, msg):
    topic   = msg.topic
    payload = msg.payload.decode("utf-8", errors="replace")

    logger.debug(f"📨 [{topic}] {payload}")

    # ── Parse JSON ──────────────────────────────────
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        logger.warning(f"⚠️  JSON ไม่ถูกต้อง topic={topic}: {payload[:120]}")
        return

    # ── Device ID ───────────────────────────────────
    device_id = extract_field(data, "device_id")
    if device_id is None:
        device_id = extract_device_id_from_topic(topic)
    else:
        device_id = str(int(device_id)) if isinstance(device_id, float) else str(device_id)

    # ── ดึงค่าไฟ ────────────────────────────────────
    voltage_l1 = extract_field(data, "voltage_l1")
    voltage_l2 = extract_field(data, "voltage_l2")
    voltage_l3 = extract_field(data, "voltage_l3")
    current_l1 = extract_field(data, "current_l1")
    current_l2 = extract_field(data, "current_l2")
    current_l3 = extract_field(data, "current_l3")
    active_p   = extract_field(data, "active_power")
    reactive_p = extract_field(data, "reactive_power")
    apparent_p = extract_field(data, "apparent_power")
    power_factor = extract_field(data, "power_factor")
    frequency  = extract_field(data, "frequency")
    thd        = extract_field(data, "thd")
    energy_kwh = extract_field(data, "energy_kwh")

    # T310 อาจส่ง power เป็น W — แปลงเป็น kW ถ้าค่าสูงผิดปกติ
    def maybe_to_kw(val):
        if val is None:
            return None
        return round(val / 1000, 3) if val > 1000 else round(val, 3)

    active_p_kw   = maybe_to_kw(active_p)
    reactive_p_kw = maybe_to_kw(reactive_p)
    apparent_p_kw = maybe_to_kw(apparent_p)

    # ── Timestamp ────────────────────────────────────
    # ใช้เวลาจาก payload ถ้ามี field ts/timestamp/time
    ts_val = data.get("ts") or data.get("timestamp") or data.get("time")
    if ts_val:
        try:
            ts = datetime.fromtimestamp(float(ts_val)) if str(ts_val).isdigit() else datetime.fromisoformat(str(ts_val))
            record_time = ts.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            record_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    else:
        record_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    logger.info(
        f"[{device_id}] V={voltage_l1}/{voltage_l2}/{voltage_l3} V | "
        f"I={current_l1}/{current_l2}/{current_l3} A | "
        f"P={active_p_kw} kW | PF={power_factor} | F={frequency} Hz"
    )

    # ── บันทึกลง DB ──────────────────────────────────
    db = userdata.get("db")
    cursor = userdata.get("cursor")

    try:
        # ตรวจว่า device มีในตาราง devices หรือเปล่า
        cursor.execute(
            "SELECT deviceID FROM devices WHERE deviceID = %s LIMIT 1",
            (device_id,)
        )
        if cursor.fetchone() is None:
            logger.warning(f"⚠️  device_id='{device_id}' ไม่มีในตาราง devices — ข้ามการบันทึก")
            return

        cursor.execute("""
            INSERT INTO power_records
              (device_id, record_time,
               before_L1, before_L2, before_L3,
               metrics_L1, metrics_L2, metrics_L3,
               metrics_P, metrics_Q, metrics_S,
               metrics_PF, metrics_F, metrics_THD,
               metrics_kWh)
            VALUES
              (%s, %s,
               %s, %s, %s,
               %s, %s, %s,
               %s, %s, %s,
               %s, %s, %s,
               %s)
        """, (
            device_id, record_time,
            voltage_l1, voltage_l2, voltage_l3,  # before_L1/L2/L3 = voltage
            current_l1, current_l2, current_l3,  # metrics_L1/L2/L3 = current (A)
            active_p_kw, reactive_p_kw, apparent_p_kw,
            power_factor, frequency, thd,
            energy_kwh,
        ))
        db.commit()
        logger.info(f"✅ บันทึกสำเร็จ device={device_id} | time={record_time}")

    except mysql.connector.Error as e:
        logger.error(f"❌ DB Error: {e}")
        try:
            db.rollback()
        except Exception:
            pass
        # reconnect ถ้า connection หลุด
        try:
            userdata["db"] = get_db_connection()
            userdata["cursor"] = userdata["db"].cursor()
            logger.info("🔄 เชื่อมต่อ DB ใหม่สำเร็จ")
        except Exception as re:
            logger.error(f"❌ Reconnect DB ล้มเหลว: {re}")
    except Exception as e:
        logger.error(f"❌ ข้อผิดพลาด: {e}")


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def main():
    logger.info("🚀 เริ่ม T310 MQTT Listener")

    # DB connection
    db = get_db_connection()
    cursor = db.cursor()
    userdata = {"db": db, "cursor": cursor}

    # MQTT client
    client = mqtt.Client(client_id="t310_ksystem_listener", userdata=userdata)
    client.on_connect    = on_connect
    client.on_message    = on_message
    client.on_disconnect = on_disconnect

    if MQTT_USERNAME:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            client.loop_forever()
        except KeyboardInterrupt:
            logger.info("⛔ หยุดโดยผู้ใช้")
            break
        except Exception as e:
            logger.error(f"❌ Connection error: {e} — รอ 10 วินาทีแล้วลองใหม่")
            time.sleep(10)

    cursor.close()
    db.close()
    client.disconnect()


if __name__ == "__main__":
    main()
