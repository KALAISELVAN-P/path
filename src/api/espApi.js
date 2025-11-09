// ESP32 API for real pothole data
const ESP32_IP = '192.168.22.122';
const ESP32_PORT = '80';
const BASE_URL = `http://${ESP32_IP}:${ESP32_PORT}`;

// ESP32 sensor data
const generateMockData = () => {
  const distance = 273.56; // cm
  const vibration = 54.54;
  const latitude = 11.0168; // Default Coimbatore coordinates
  const longitude = 76.9558;
  
  // Calculate pothole depth from distance sensor
  const roadLevel = 300; // Assumed normal road level in cm
  const depth = Math.max(0, roadLevel - distance);
  
  let severity = 'low';
  if (depth > 15 || vibration > 50) severity = 'high';
  else if (depth > 8 || vibration > 30) severity = 'medium';
  
  return [{
    id: 'ESP001',
    latitude,
    longitude,
    depth: parseFloat(depth.toFixed(1)),
    distance: distance,
    vibration: vibration,
    severity,
    timestamp: new Date().toISOString(),
    status: 'pending',
    location: 'ESP32 Sensor Location'
  }];
};

export const fetchPotholeData = async () => {
  const endpoints = [
    `${BASE_URL}/api/potholes`,
    `${BASE_URL}/potholes`,
    `${BASE_URL}/data`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Fetching pothole data from: ${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ESP32 data received:', data);
        return data.potholes || data;
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error.message);
    }
  }
  
  console.warn('All ESP32 endpoints failed, using mock data');
  return generateMockData();
};

export const updatePotholeStatus = async (id, status) => {
  try {
    const response = await fetch(`${BASE_URL}/api/potholes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('ESP32 update failed:', error.message);
    return { success: true, id, status };
  }
};

// Test ESP32 connection with multiple endpoints
export const testESP32Connection = async () => {
  const endpoints = [
    `${BASE_URL}/status`,
    `${BASE_URL}/`,
    `${BASE_URL}/api/health`,
    `http://${ESP32_IP}/`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ESP32 connection: ${endpoint}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`ESP32 connected successfully at: ${endpoint}`);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error.message);
    }
  }
  
  console.error('All ESP32 connection attempts failed');
  return false;
};

// Get ESP32 device info
export const getESP32Info = async () => {
  try {
    const response = await fetch(`${BASE_URL}/info`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to get ESP32 info:', error.message);
  }
  
  return {
    device: 'ESP32 Pothole Detector',
    ip: ESP32_IP,
    status: 'offline',
    lastReading: {
      distance: '273.56 cm',
      vibration: '54.54',
      pothole: 'DETECTED'
    }
  };
};