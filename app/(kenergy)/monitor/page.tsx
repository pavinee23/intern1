"use client";

import { useState, useEffect } from "react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import { ChevronDown, Info, Download, TrendingUp, X, RefreshCw, Clock } from "lucide-react";
import MonitorCard from "@/components/MonitorCard";

interface Device {
  deviceID: string;
  deviceName: string;
  location: string;
}

interface MonitoringMetrics {
  voltageLL: number[];
  current: number[];
  power: number[];
  totalPower: number;
  reactivePower: number;
  apparentPower: number;
  frequency: number;
  powerFactor: number;
  energy: number;
  energySaved: number;
  co2Saved: number;
  beforeEnergy: number;
}

export default function MonitorPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [monitoringData, setMonitoringData] = useState<MonitoringMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Fetch monitoring data when device is selected
  useEffect(() => {
    if (selectedDevice) {
      fetchMonitoringData();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchMonitoringData, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      setDevicesLoading(true);
      const res = await fetch('/api/devices');
      const json = await res.json();

      if (json.success) {
        setDevices(json.devices || []);
        // Auto-select first device
        if (json.devices && json.devices.length > 0 && !selectedDevice) {
          setSelectedDevice(json.devices[0].deviceID);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  };

  const fetchMonitoringData = async () => {
    if (!selectedDevice) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/kenergy/device-monitoring?deviceId=${selectedDevice}`);
      const json = await res.json();

      if (json.success) {
        setMonitoringData(json.data.metrics);
        setLastUpdate(json.data.lastUpdate);
      } else {
        setError(json.error || 'Failed to load monitoring data');
        setMonitoringData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setMonitoringData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentDevice = devices.find(d => d.deviceID === selectedDevice);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('devicesMonitor') || 'Devices Monitor'}
          </h1>

          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date(lastUpdate).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm gap-4">
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition min-w-[250px]"
              disabled={devicesLoading}
            >
              <span className="text-sm font-medium text-primary">
                {currentDevice?.deviceName || (devicesLoading ? "Loading devices..." : "Select Device")}
              </span>
              <ChevronDown className="w-4 h-4 text-primary ml-auto" />
              {selectedDevice && !devicesLoading && (
                <X
                  className="w-4 h-4 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDevice("");
                    setMonitoringData(null);
                  }}
                />
              )}
            </button>

            {showDeviceDropdown && devices.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto">
                {devices.map((device) => (
                  <button
                    key={device.deviceID}
                    onClick={() => {
                      setSelectedDevice(device.deviceID);
                      setShowDeviceDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                      selectedDevice === device.deviceID ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{device.deviceName}</p>
                    <p className="text-xs text-gray-500">{device.location || 'No location'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchMonitoringData}
            disabled={!selectedDevice || loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{t('refresh') || 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !monitoringData && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading monitoring data...</p>
          </div>
        </div>
      )}

      {/* No Device Selected */}
      {!selectedDevice && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Please select a device to view monitoring data</p>
          </div>
        </div>
      )}

      {/* Monitoring Cards Grid */}
      {monitoringData && selectedDevice && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {/* Voltage LL */}
            <MonitorCard
              title="Voltage LL1"
              value={monitoringData.voltageLL[0]}
              unit="Volt"
              lastUpdate={lastUpdate}
              color="yellow"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LL2"
              value={monitoringData.voltageLL[1]}
              unit="Volt"
              lastUpdate={lastUpdate}
              color="gray"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LL3"
              value={monitoringData.voltageLL[2]}
              unit="Volt"
              lastUpdate={lastUpdate}
              color="gray"
              icon="voltage"
            />

            {/* Current */}
            <MonitorCard
              title="Current 1"
              value={monitoringData.current[0]}
              unit="Amp"
              lastUpdate={lastUpdate}
              color="gray"
              icon="current"
            />
            <MonitorCard
              title="Current 2"
              value={monitoringData.current[1]}
              unit="Amp"
              lastUpdate={lastUpdate}
              color="gray"
              icon="current"
            />
            <MonitorCard
              title="Current 3"
              value={monitoringData.current[2]}
              unit="Amp"
              lastUpdate={lastUpdate}
              color="gray"
              icon="current"
            />

            {/* Power per Phase */}
            <MonitorCard
              title="Power 1"
              value={monitoringData.power[0]}
              unit="kW"
              lastUpdate={lastUpdate}
              color="white"
              icon="power"
            />
            <MonitorCard
              title="Power 2"
              value={monitoringData.power[1]}
              unit="kW"
              lastUpdate={lastUpdate}
              color="white"
              icon="power"
            />
            <MonitorCard
              title="Power 3"
              value={monitoringData.power[2]}
              unit="kW"
              lastUpdate={lastUpdate}
              color="white"
              icon="power"
            />

            {/* Total Power */}
            <MonitorCard
              title="Total Power"
              value={monitoringData.totalPower}
              unit="kW"
              lastUpdate={lastUpdate}
              color="white"
              icon="total"
            />

            {/* Reactive Power */}
            <MonitorCard
              title="Reactive Power"
              value={monitoringData.reactivePower}
              unit="kVAr"
              lastUpdate={lastUpdate}
              color="white"
              icon="power"
            />

            {/* Apparent Power */}
            <MonitorCard
              title="Apparent Power"
              value={monitoringData.apparentPower}
              unit="kVA"
              lastUpdate={lastUpdate}
              color="white"
              icon="power"
            />

            {/* Frequency */}
            <MonitorCard
              title="Frequency"
              value={monitoringData.frequency}
              unit="Hz"
              lastUpdate={lastUpdate}
              color="white"
              icon="frequency"
            />

            {/* Power Factor */}
            <MonitorCard
              title="Power Factor"
              value={monitoringData.powerFactor}
              unit=""
              lastUpdate={lastUpdate}
              color="white"
              icon="pf"
            />

            {/* Energy */}
            <MonitorCard
              title="Energy"
              value={monitoringData.energy}
              unit="kWh"
              lastUpdate={lastUpdate}
              color="white"
              icon="energy"
            />

            {/* Energy Saved */}
            <MonitorCard
              title="Energy Saved"
              value={monitoringData.energySaved}
              unit="kWh"
              lastUpdate={lastUpdate}
              color="white"
              icon="energy"
            />

            {/* CO2 Saved */}
            <MonitorCard
              title="CO2 Saved"
              value={monitoringData.co2Saved}
              unit="kg"
              lastUpdate={lastUpdate}
              color="white"
              icon="energy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
