-- Add fields for credit purchase: due_date, exempt_amount, wht_rate, wht_amount
-- and is_exempt on items. Run once on the database.
-- Created: 2026-03-25

ALTER TABLE acc_purchase_orders
  ADD COLUMN IF NOT EXISTS due_date DATE NULL COMMENT 'วันครบกำหนดชำระ' AFTER doc_date,
  ADD COLUMN IF NOT EXISTS exempt_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'ราคาสินค้ายกเว้นภาษี' AFTER vat_amount,
  ADD COLUMN IF NOT EXISTS wht_rate DECIMAL(5,2) DEFAULT 0 COMMENT 'อัตราหัก ณ ที่จ่าย (%)' AFTER exempt_amount,
  ADD COLUMN IF NOT EXISTS wht_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'จำนวนหัก ณ ที่จ่าย' AFTER wht_rate;

ALTER TABLE acc_purchase_order_items
  ADD COLUMN IF NOT EXISTS is_exempt TINYINT(1) DEFAULT 0 COMMENT 'ยกเว้นภาษีมูลค่าเพิ่ม' AFTER amount;
