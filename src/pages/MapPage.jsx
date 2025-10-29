import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { RefreshCw, BarChart3, Shield, MapPin, Plus } from 'lucide-react';
import L from 'leaflet';
import { fetchPotholeData } from '../api/espApi';
import AdminPanel from '../components/AdminPanel';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { potholeStore } from '../store/potholeStore';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different severity levels
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const severityIcons = {
  low: createCustomIcon('#10b981'),    // green
  medium: createCustomIcon('#f59e0b'), // orange
  high: createCustomIcon('#ef4444')   // red
};

// Map click handler component
const MapClickHandler = ({ addMode, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (addMode) {
        onMapClick(e);
      }
    },
  });
  return null;
};

const MapPage = () => {
  const [potholes, setPotholes] = useState(potholeStore.getData());
  const [pendingPotholes, setPendingPotholes] = useState(potholeStore.getPendingPotholes());
  const [loading, setLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPothole, setNewPothole] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPotholeId, setVerifyPotholeId] = useState(null);
  const [verifyEmail, setVerifyEmail] = useState('');

  const loadPotholeData = async () => {
    setLoading(true);
    setTimeout(() => {
      // Refresh with current store data without losing pending reports
      setPotholes(potholeStore.getData());
      setPendingPotholes(potholeStore.getPendingPotholes());
      setLoading(false);
      toast.success('Data refreshed');
    }, 500);
  };

  useEffect(() => {
    const unsubscribe = potholeStore.subscribe(() => {
      setPotholes(potholeStore.getData());
      setPendingPotholes(potholeStore.getPendingPotholes());
    });
    return unsubscribe;
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminPanel(true);
      setShowPasswordModal(false);
      setAdminPassword('');
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid admin password');
    }
  };

  const handleUpdatePothole = (id, newStatus) => {
    potholeStore.updatePothole(id, { status: newStatus });
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (map) {
            map.setView([latitude, longitude], 15);
          }
          toast.success('Location found and pinned on map!');
        },
        (error) => {
          toast.error('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleMapClick = async (e) => {
    if (!addMode) return;
    
    const { lat, lng } = e.latlng;
    
    // Get better location name using reverse geocoding
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();
      
      let locationName = 'Unknown Location';
      
      if (data.address) {
        // Try to get the best available location name
        locationName = data.address.road || 
                      data.address.neighbourhood || 
                      data.address.suburb || 
                      data.address.village || 
                      data.address.town || 
                      data.address.city || 
                      data.address.state_district || 
                      data.display_name.split(',')[0];
      }
      
      setNewPothole({
        latitude: lat,
        longitude: lng,
        location: locationName,
        depth: '',
        severity: 'low'
      });
      setShowAddModal(true);
      setAddMode(false);
    } catch (error) {
      setNewPothole({
        latitude: lat,
        longitude: lng,
        location: 'Unknown Location',
        depth: '',
        severity: 'low'
      });
      setShowAddModal(true);
      setAddMode(false);
    }
  };

  const handleAddPothole = () => {
    if (!newPothole.depth) return;
    
    const depth = parseFloat(newPothole.depth);
    let severity = 'low';
    if (depth > 6) severity = 'high';
    else if (depth > 3) severity = 'medium';
    
    const newId = `P${String(potholes.length + 1).padStart(3, '0')}`;
    
    const pothole = {
      id: newId,
      location: newPothole.location,
      latitude: newPothole.latitude,
      longitude: newPothole.longitude,
      depth: depth,
      severity: severity,
      timestamp: new Date().toISOString(),
      status: 'pending',
      reportedBy: 'Map User',
      reporterEmail: 'map@system.com',
      estimatedCost: depth > 6 ? 5000 : depth > 3 ? 3000 : 1500
    };
    
    potholeStore.addPendingPothole(pothole);
    setShowAddModal(false);
    setNewPothole(null);
    toast.success('Pothole reported! Needs 5 confirmations to be verified.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Pothole Map — Coimbatore</h1>
            <p className="text-gray-600">Real-time pothole detection and monitoring</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <button
              onClick={loadPotholeData}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <Link to="/analytics">
              <button className="btn-secondary flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </Link>
            
            <button
              onClick={handleMyLocation}
              className="btn-secondary flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>My Location</span>
            </button>
            
            <button
              onClick={() => setAddMode(!addMode)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                addMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{addMode ? 'Cancel Add' : 'Add Pothole'}</span>
            </button>
            
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[11.0168, 76.9558]}
              zoom={13}
              style={{ height: '100%', width: '100%', cursor: addMode ? 'crosshair' : 'grab' }}
              whenCreated={setMap}
            >
              <MapClickHandler addMode={addMode} onMapClick={handleMapClick} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {potholes.map((pothole) => (
                <Marker
                  key={pothole.id}
                  position={[pothole.latitude, pothole.longitude]}
                  icon={severityIcons[pothole.severity]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">Pothole ID: {pothole.id}</h3>
                      <p><strong>Location:</strong> {pothole.location}</p>
                      <p><strong>Depth:</strong> {pothole.depth} cm</p>
                      <p><strong>Severity:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                          pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)}
                        </span>
                      </p>
                      <p><strong>Detected:</strong> {new Date(pothole.timestamp).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {pendingPotholes.map((pothole) => (
                <Marker
                  key={`pending-${pothole.id}`}
                  position={[pothole.latitude, pothole.longitude]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #fbbf24; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2 text-yellow-600">Pending: {pothole.id}</h3>
                      <p><strong>Location:</strong> {pothole.location}</p>
                      <p><strong>Votes:</strong> {pothole.votes}/5</p>
                      <p><strong>Depth:</strong> {pothole.depth} cm</p>
                      <button
                        onClick={() => {
                          setVerifyPotholeId(pothole.id);
                          setShowVerifyModal(true);
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Confirm Pothole
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">Your Location</h3>
                      <p>Current position</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Low Severity (&lt;3 cm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>Medium Severity (3-6 cm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>High Severity (&gt;6 cm)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Pending Confirmation</span>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">Live Data Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depth (cm)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {potholes.map((pothole) => (
                  <tr key={pothole.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pothole.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pothole.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pothole.latitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pothole.longitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pothole.depth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                        pothole.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pothole.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pothole.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {pothole.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pothole.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Admin Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Admin Access</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter admin password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdminLogin}
                  className="btn-primary flex-1"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setAdminPassword('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Verify Pothole Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4 text-center">Verify Pothole Report</h3>
              <p className="text-gray-600 mb-4 text-center">
                Help us verify this pothole by providing your email address. This helps prevent false reports.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email address"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && verifyEmail) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (emailRegex.test(verifyEmail)) {
                        potholeStore.voteForPothole(verifyPotholeId, verifyEmail);
                        toast.success('Thank you for verifying this pothole!');
                        setShowVerifyModal(false);
                        setVerifyEmail('');
                        setVerifyPotholeId(null);
                      } else {
                        toast.error('Please enter a valid email address');
                      }
                    }
                  }}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (verifyEmail) {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (emailRegex.test(verifyEmail)) {
                        potholeStore.voteForPothole(verifyPotholeId, verifyEmail);
                        toast.success('Thank you for verifying this pothole!');
                        setShowVerifyModal(false);
                        setVerifyEmail('');
                        setVerifyPotholeId(null);
                      } else {
                        toast.error('Please enter a valid email address');
                      }
                    } else {
                      toast.error('Email address is required');
                    }
                  }}
                  className="btn-primary flex-1"
                >
                  Verify Pothole
                </button>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyEmail('');
                    setVerifyPotholeId(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your email will only be used for verification purposes and will not be shared.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Pothole Modal */}
        {showAddModal && newPothole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Add New Pothole</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newPothole.location}
                    onChange={(e) => setNewPothole({...newPothole, location: e.target.value})}
                    className="input-field"
                    placeholder="Location name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depth (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPothole.depth}
                    onChange={(e) => setNewPothole({...newPothole, depth: e.target.value})}
                    className="input-field"
                    placeholder="Enter depth in cm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordinates
                  </label>
                  <p className="text-sm text-gray-600">
                    {newPothole.latitude.toFixed(6)}, {newPothole.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddPothole}
                  disabled={!newPothole.depth}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Pothole
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPothole(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Admin Panel */}
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          potholes={potholes}
          onUpdatePothole={handleUpdatePothole}
        />
      </div>
    </div>
  );
};

export default MapPage;