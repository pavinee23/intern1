"use client";

import { useState } from "react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import { ChevronDown, Info, Download, TrendingUp, X } from "lucide-react";
import MonitorCard from "@/components/MonitorCard";

// Device data by site
const devicesBySite = {
  thailand: [
    { id: "MSP-BKK-1001", name: "MSP-BKK-1001", location: "Bangkok Office" },
    { id: "MSP-CMI-2001", name: "MSP-CMI-2001", location: "Chiang Mai Branch" },
  ],
  korea: [
    { id: "MSP-SEL-3001", name: "MSP-SEL-3001", location: "Seoul HQ" },
  ],
};

// Mock device monitoring data
const monitoringData = {
  "MSP-BKK-1001": {
    voltageLL: [0.4, 0.2, 0.5],
    current: [2.1, 2.0, 2.1],
    power: [0.5, 0.5, 0.5],
    totalPower: 1.4,
    frequency: 50.0,
    totalPF: 1.0,
    voltageLN: [233.7, 233.8, 234.0],
    expEnergy: 0.0,
    impEnergy: 0.0,
    lastUpdate: "121:14:05 ago",
  },
  "MSP-CMI-2001": {
    voltageLL: [0.3, 0.2, 0.4],
    current: [1.8, 1.9, 2.0],
    power: [0.4, 0.4, 0.5],
    totalPower: 1.3,
    frequency: 49.9,
    totalPF: 0.98,
    voltageLN: [232.5, 233.0, 233.2],
    expEnergy: 0.0,
    impEnergy: 0.0,
    lastUpdate: "5:30:12 ago",
  },
  "MSP-SEL-3001": {
    voltageLL: [0.5, 0.3, 0.6],
    current: [2.3, 2.2, 2.4],
    power: [0.6, 0.6, 0.7],
    totalPower: 1.9,
    frequency: 60.0,
    totalPF: 0.95,
    voltageLN: [220.1, 220.5, 220.8],
    expEnergy: 0.5,
    impEnergy: 1.2,
    lastUpdate: "2:15:30 ago",
  },
};

export default function MonitorPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [startDate, setStartDate] = useState("2026-02-06");
  const [endDate, setEndDate] = useState("2026-02-07");

  const devices = devicesBySite[selectedSite];
  const currentDevice = selectedDevice || devices[0]?.id;
  const data = monitoringData[currentDevice as keyof typeof monitoringData];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Devices Monitor</h1>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm gap-4">
        <div className="flex items-center gap-3">
          {/* Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!setShowRoleDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium">{selectedRole}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Device Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition min-w-[200px]"
            >
              <span className="text-sm font-medium text-primary">
                {devices.find(d => d.id === currentDevice)?.name || "Select Device"}
              </span>
              <ChevronDown className="w-4 h-4 text-primary ml-auto" />
              {selectedDevice && (
                <X 
                  className="w-4 h-4 text-gray-400 hover:text-gray-600" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDevice("");
                  }}
                />
              )}
            </button>

            {showDeviceDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => {
                      setSelectedDevice(device.id);
                      setShowDeviceDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                  >
                    <p className="text-sm font-medium text-gray-800">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.location}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <span className="text-sm font-medium">Select data</span>
          </button>

          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-orange-600 transition">
            <span className="text-sm font-medium">Devices Overview</span>
          </button>
        </div>
      </div>

      {/* Monitoring Cards Grid */}
      {data && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            <MonitorCard
              title="Voltage LL1"
              value={data.voltageLL[0]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="yellow"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LL2"
              value={data.voltageLL[1]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="gray"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LL3"
              value={data.voltageLL[2]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="gray"
              icon="voltage"
            />
            <MonitorCard
              title="Current 1"
              value={data.current[0]}
              unit="Amp"
              lastUpdate={data.lastUpdate}
              color="gray"
              icon="current"
            />
            <MonitorCard
              title="Current 2"
              value={data.current[1]}
              unit="Amp"
              lastUpdate={data.lastUpdate}
              color="gray"
              icon="current"
            />
            <MonitorCard
              title="Current 3"
              value={data.current[2]}
              unit="Amp"
              lastUpdate={data.lastUpdate}
              color="gray"
              icon="current"
            />
            <MonitorCard
              title="Power1"
              value={data.power[0]}
              unit="kW"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="power"
            />
            <MonitorCard
              title="Power2"
              value={data.power[0]}
              unit="kW"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="power"
            />
            <MonitorCard
              title="Power3"
              value={data.power[1]}
              unit="kW"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="power"
            />
            <MonitorCard
              title="Total Power"
              value={data.totalPower}
              unit="kW"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="total"
            />
            <MonitorCard
              title="Frequency"
              value={data.frequency}
              unit="Hz"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="frequency"
            />
            <MonitorCard
              title="Total PF"
              value={data.totalPF}
              unit=""
              lastUpdate={data.lastUpdate}
              color="white"
              icon="pf"
            />
            <MonitorCard
              title="Voltage LN1"
              value={data.voltageLN[0]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LN2"
              value={data.voltageLN[1]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="voltage"
            />
            <MonitorCard
              title="Voltage LN3"
              value={data.voltageLN[2]}
              unit="Volt"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="voltage"
            />
            <MonitorCard
              title="EXP Energy"
              value={data.expEnergy}
              unit="kWh"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="energy"
            />
            <MonitorCard
              title="IMP Energy"
              value={data.impEnergy}
              unit="kWh"
              lastUpdate={data.lastUpdate}
              color="white"
              icon="energy"
            />
          </div>

          {/* Date Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
                <span className="text-sm">Select data</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center space-x-2">
                <span className="text-sm">⏱ Minute</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Show Limits</span>
              </label>

              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Plot</span>
              </button>

              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
