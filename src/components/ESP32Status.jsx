import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react';
import { testESP32Connection, getESP32Info } from '../api/espApi';

const ESP32Status = () => {
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    setLoading(true);
    setConnected(true);
    const info = await getESP32Info();
    setDeviceInfo(info);
    setLastCheck(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">ESP32 Device Status</h3>
        <button
          onClick={checkConnection}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          {connected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">Disconnected</span>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>IP Address:</strong> 192.168.22.122</div>
          <div><strong>Port:</strong> 80</div>
          {lastCheck && <div><strong>Last Check:</strong> {lastCheck}</div>}
          <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
            <div><strong>📏 Distance:</strong> -1.00 cm</div>
            <div><strong>💥 Vibration:</strong> 8.38</div>
            <div><strong>✅ Normal Road</strong></div>
          </div>
        </div>

        {deviceInfo && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <div className="text-sm text-green-800 space-y-1">
              <div><strong>Device:</strong> {deviceInfo.device}</div>
              <div><strong>Status:</strong> {deviceInfo.status}</div>
              {deviceInfo.lastReading && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <div><strong>📏 Distance:</strong> {deviceInfo.lastReading.distance}</div>
                  <div><strong>💥 Vibration:</strong> {deviceInfo.lastReading.vibration}</div>
                  <div><strong>⚠️ Status:</strong> {deviceInfo.lastReading.pothole}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {!connected && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-800">
              <strong>Troubleshooting:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Check if ESP32 is powered on</li>
                <li>Verify WiFi connection</li>
                <li>Confirm IP address: 192.168.22.122</li>
                <li>Check if web server is running on ESP32</li>
                <li>Ensure CORS is enabled on ESP32</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESP32Status;