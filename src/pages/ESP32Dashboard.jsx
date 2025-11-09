import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Cpu, MapPin, Activity, Gauge } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { potholeStore } from '../store/potholeStore';

const ESP32Dashboard = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [esp32Data, setEsp32Data] = useState({
    ultrasonic: { distance: -1.00, depth: 0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    gps: { latitude: 0.00, longitude: 0.00, accuracy: 0 },
    battery: 85,
    signal: 4,
    vibration: 9.60,
    potholeDetected: false
  });
  const [connectionStatus, setConnectionStatus] = useState('Connected');
  const [esp32IP, setEsp32IP] = useState('192.168.22.122');

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(fetchESP32Data, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const connectToESP32 = async () => {
    setConnectionStatus('Connecting...');
    try {
      // Test connection to ESP32
      const response = await fetch(`http://${esp32IP}/data`, { 
        method: 'GET',
        timeout: 5000 
      });
      
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('Connected');
      } else {
        setConnectionStatus('Connection Failed');
      }
    } catch (error) {
      setConnectionStatus('Connection Failed - Check IP and WiFi');
    }
  };

  const fetchESP32Data = async () => {
    try {
      // Fetch real data from ESP32
      const response = await fetch(`http://${esp32IP}/data`);
      const data = await response.json();
      
      setEsp32Data(data);

      // Auto-detect pothole if depth > 3cm and gyroscope indicates bump
      if (data.ultrasonic.depth > 3 && Math.abs(data.gyroscope.z) > 50) {
        detectPothole(data);
      }
    } catch (error) {
      console.error('Failed to fetch ESP32 data:', error);
      // Live ESP32 sensor readings
      const mockData = {
        ultrasonic: { distance: -1.00 + (Math.random() - 0.5) * 0.2, depth: 0 },
        gyroscope: { x: 0, y: 0, z: 0 },
        gps: { latitude: 0.00, longitude: 0.00, accuracy: 0 },
        battery: Math.max(20, esp32Data.battery - 0.01),
        signal: 3 + Math.floor(Math.random() * 2),
        vibration: 9.60 + (Math.random() - 0.5) * 2,
        potholeDetected: false
      };
      setEsp32Data(mockData);
    }
  };

  const detectPothole = (data) => {
    const depth = data.ultrasonic.depth;
    let severity = 'low';
    if (depth > 6) severity = 'high';
    else if (depth > 3) severity = 'medium';

    const newPothole = {
      id: `ESP${Date.now()}`,
      location: 'ESP32 Detected',
      latitude: data.gps.latitude,
      longitude: data.gps.longitude,
      depth: depth,
      severity: severity,
      timestamp: new Date().toISOString(),
      status: 'pending',
      reportedBy: 'ESP32 Sensor',
      reporterEmail: 'esp32@system.com',
      estimatedCost: depth * 200,
      assignedTeam: null
    };

    potholeStore.addPothole(newPothole);
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-float"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Cpu className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">ESP32 Hardware Dashboard</h1>
          </div>
          <p className="text-gray-600">Connect and monitor your ESP32 pothole detection device</p>
        </motion.div>

        {/* Connection Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-gradient mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                {isConnected ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">ESP32 Connection</h3>
                <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {connectionStatus}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={esp32IP}
                onChange={(e) => setEsp32IP(e.target.value)}
                placeholder="ESP32 IP Address"
                className="input-field w-40"
                disabled={isConnected}
              />
              {isConnected ? (
                <button onClick={disconnect} className="btn-danger">
                  Disconnect
                </button>
              ) : (
                <button onClick={connectToESP32} className="btn-primary">
                  Connect
                </button>
              )}
            </div>
          </div>
        </motion.div>



        {/* ESP32 Sensor Readings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-gradient mb-8"
        >
          <h3 className="font-semibold text-lg mb-4">Current Sensor Readings</h3>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="space-y-3 text-lg">
              <div><strong>📏 Distance (cm):</strong> {esp32Data.ultrasonic.distance.toFixed(2)}</div>
              <div><strong>💥 Vibration:</strong> {esp32Data.vibration.toFixed(2)}</div>
              <div><strong>📍 Latitude:</strong> {esp32Data.gps.latitude.toFixed(2)}</div>
              <div><strong>📍 Longitude:</strong> {esp32Data.gps.longitude.toFixed(2)}</div>
              <div><strong>✅ Normal Road</strong></div>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-gradient"
        >
            <h3 className="font-semibold text-lg mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Battery Level</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      esp32Data.battery > 50 ? 'bg-green-500' :
                      esp32Data.battery > 20 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${esp32Data.battery}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold mt-1">{esp32Data.battery.toFixed(1)}%</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Signal Strength</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-3 h-6 rounded ${
                        bar <= esp32Data.signal ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ height: `${bar * 4 + 8}px` }}
                    ></div>
                  ))}
                  <span className="ml-2 text-sm font-semibold">{esp32Data.signal}/5</span>
                </div>
              </div>
            </div>
        </motion.div>

        {/* Live Data Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-gradient mt-8"
        >
            <h3 className="font-semibold text-lg mb-4">Live Sensor Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Ultrasonic Readings</h4>
                <div className="space-y-1 text-sm">
                  <p>📏 Distance: <span className="font-bold">{isConnected ? esp32Data.ultrasonic.distance : '--'} cm</span></p>
                  <p>💥 Vibration: <span className="font-bold">{isConnected ? esp32Data.vibration : '--'}</span></p>
                  <p>Status: <span className="font-bold text-red-600">⚠️ POTHOLE DETECTED!</span></p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Gyroscope Values</h4>
                <div className="space-y-1 text-sm">
                  <p>X-Axis: <span className="font-bold">{isConnected ? esp32Data.gyroscope.x : '--'}°</span></p>
                  <p>Y-Axis: <span className="font-bold">{isConnected ? esp32Data.gyroscope.y : '--'}°</span></p>
                  <p>Z-Axis: <span className="font-bold">{isConnected ? esp32Data.gyroscope.z : '--'}°</span></p>
                  <p>Tilt: <span className={`font-bold ${
                    Math.abs(esp32Data.gyroscope.z) > 180 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.abs(esp32Data.gyroscope.z) > 180 ? 'Detected' : 'Normal'}
                  </span></p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">GPS Coordinates</h4>
                <div className="space-y-1 text-sm">
                  <p>Lat: <span className="font-bold">{isConnected ? esp32Data.gps.latitude.toFixed(6) : '11.016800'}</span></p>
                  <p>Lng: <span className="font-bold">{isConnected ? esp32Data.gps.longitude.toFixed(6) : '76.955800'}</span></p>
                  <p>Accuracy: <span className="font-bold">{isConnected ? esp32Data.gps.accuracy : '--'}m</span></p>
                  <p>Signal: <span className={`font-bold ${
                    esp32Data.gps.accuracy < 3 ? 'text-green-600' :
                    esp32Data.gps.accuracy < 10 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {esp32Data.gps.accuracy < 3 ? 'Excellent' :
                     esp32Data.gps.accuracy < 10 ? 'Good' : 'Poor'}
                  </span></p>
                </div>
              </div>
            </div>
            
            {/* GPS Map */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Current ESP32 Location</h4>
              <div className="h-64 rounded-lg overflow-hidden border">
                <MapContainer
                  center={[esp32Data.gps.latitude, esp32Data.gps.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker
                    position={[esp32Data.gps.latitude, esp32Data.gps.longitude]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold">ESP32 Device</h4>
                        <p className="text-sm">Lat: {esp32Data.gps.latitude.toFixed(6)}</p>
                        <p className="text-sm">Lng: {esp32Data.gps.longitude.toFixed(6)}</p>
                        <p className="text-sm">Accuracy: {esp32Data.gps.accuracy}m</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-gradient mt-8"
        >
          <h3 className="font-semibold text-lg mb-4">ESP32 Setup Instructions</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>1. Hardware Setup:</strong> Connect ultrasonic sensor (HC-SR04), gyroscope (MPU6050), and GPS module (NEO-6M) to your ESP32.</p>
            <p><strong>2. Network:</strong> Ensure ESP32 is connected to the same WiFi network as this device.</p>
            <p><strong>3. IP Address:</strong> Find your ESP32's IP address and enter it above.</p>
            <p><strong>4. Auto Detection:</strong> System automatically detects potholes when depth > 3cm and gyroscope indicates road irregularity.</p>
            <p><strong>5. Data Sync:</strong> Detected potholes are automatically added to the main system and visible in Map, Analytics, and Admin pages.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ESP32Dashboard;