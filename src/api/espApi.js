// Simulated ESP32 API for pothole data
const generateMockData = () => {
  const potholes = [];
  const severityLevels = ['low', 'medium', 'high'];
  
  for (let i = 1; i <= 20; i++) {
    const depth = Math.random() * 10 + 1;
    let severity = 'low';
    if (depth > 6) severity = 'high';
    else if (depth > 3) severity = 'medium';
    
    potholes.push({
      id: i,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      depth: parseFloat(depth.toFixed(1)),
      severity,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      status: Math.random() > 0.7 ? 'resolved' : 'pending'
    });
  }
  
  return potholes;
};

export const fetchPotholeData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockData();
};

export const updatePotholeStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, id, status };
};