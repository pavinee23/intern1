'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { Key, BookOpen, Database, Activity, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

export default function DeveloperPage() {
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock MQTT Settings
  const [mqttSettings, setMqttSettings] = useState({
    host: 'broker.example.com',
    port: '1883',
    username: '',
    password: '••••••',
    topic: '',
    interval: '30'
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* My API Keys Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t('myAPIKeys')}
              </h2>
            </div>
            <a 
              href="#" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              {t('apiDocs')}
            </a>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-red-500 text-sm mb-4">
            {t('errorLoadingAPIKeys')}
          </p>
          
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors flex items-center gap-2">
            <span className="text-xl">+</span>
            {t('newAPIKey')}
          </button>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t('apiKey')}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded border border-gray-300 p-4 flex items-center justify-between">
            <code className="text-gray-800 text-sm font-mono">
              {t('noAPIKeyGenerated')}
            </code>
          </div>
        </div>
      </div>

      {/* Device Data Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t('deviceData')}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-sm">
            {t('deviceDataDescription')}
          </p>
        </div>
      </div>

      {/* MQTT Settings Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t('mqttSettings')}
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm flex items-center gap-1"
            >
              ✏️ {t('edit')}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* MQTT Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mqttHost')}
              </label>
              <input
                type="text"
                value={mqttSettings.host}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, host: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('port')}
              </label>
              <input
                type="text"
                value={mqttSettings.port}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, port: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interval')} (sec ≥ 30)
              </label>
              <input
                type="text"
                value={mqttSettings.interval}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, interval: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                value={mqttSettings.username}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                placeholder=""
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={mqttSettings.password}
                  disabled={!isEditing}
                  onChange={(e) => setMqttSettings({...mqttSettings, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('passwordHiddenNote')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            {/* Topic */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('topic')}
            </label>
            <input
              type="text"
              value={mqttSettings.topic}
              disabled={!isEditing}
              onChange={(e) => setMqttSettings({...mqttSettings, topic: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              placeholder=""
            />
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                {t('save')}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
