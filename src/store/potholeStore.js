// Shared pothole data store
// Default pothole data
const defaultPotholes = [
  {
    id: 'P001',
    location: 'Ukkadam',
    latitude: 11.0168,
    longitude: 76.9558,
    depth: 2.5,
    severity: 'low',
    timestamp: '2024-12-15T08:30:00.000Z',
    status: 'pending',
    reportedBy: 'John Doe',
    reporterEmail: 'john@email.com',
    estimatedCost: 1500,
    assignedTeam: null
  },
  {
    id: 'P002',
    location: 'BK Pudur',
    latitude: 11.0304,
    longitude: 76.9718,
    depth: 4.8,
    severity: 'medium',
    timestamp: '2024-12-14T14:15:00.000Z',
    status: 'assigned',
    reportedBy: 'Jane Smith',
    reporterEmail: 'jane@email.com',
    estimatedCost: 3200,
    assignedTeam: 'Team Beta'
  },
  {
    id: 'P003',
    location: 'RS Puram',
    latitude: 11.0051,
    longitude: 76.9618,
    depth: 7.2,
    severity: 'high',
    timestamp: '2024-12-13T10:45:00.000Z',
    status: 'pending',
    reportedBy: 'Mike Johnson',
    reporterEmail: 'mike@email.com',
    estimatedCost: 5800,
    assignedTeam: null
  }
];

// Load pothole data from localStorage or use defaults
let potholeData = JSON.parse(localStorage.getItem('potholeData') || JSON.stringify(defaultPotholes));

let listeners = [];
let pendingPotholes = []; // Potholes waiting for confirmation
// Initialize with default data if localStorage is empty
const defaultReports = [
  {
    id: 'R001',
    name: 'Kalai',
    email: 'kalai@gmail.com',
    location: 'Kaaya Mouth',
    latitude: 11.0168,
    longitude: 76.9558,
    description: 'Deep pothole causing traffic issues near the main junction. Water logging during rain.',
    image: null,
    imageData: null,
    timestamp: '2024-12-15T09:30:00.000Z',
    status: 'pending'
  }
];

// Initialize pending reports from localStorage or use defaults
let storedReports = localStorage.getItem('pendingReports');
let pendingReports = [];

if (storedReports) {
  pendingReports = JSON.parse(storedReports);
  // Ensure Kalai's report is always present
  const hasKalaiReport = pendingReports.some(r => r.name === 'Kalai' && r.location === 'Kaaya Mouth');
  if (!hasKalaiReport) {
    pendingReports = [...defaultReports, ...pendingReports];
    localStorage.setItem('pendingReports', JSON.stringify(pendingReports));
  }
} else {
  pendingReports = defaultReports;
  localStorage.setItem('pendingReports', JSON.stringify(pendingReports));
}

export const potholeStore = {
  getData: () => potholeData,
  
  addPothole: (pothole) => {
    potholeData = [...potholeData, pothole];
    localStorage.setItem('potholeData', JSON.stringify(potholeData));
    listeners.forEach(listener => listener(potholeData));
  },
  
  updatePothole: (id, updates) => {
    potholeData = potholeData.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem('potholeData', JSON.stringify(potholeData));
    listeners.forEach(listener => listener(potholeData));
  },
  
  refreshData: (newData) => {
    potholeData = newData;
    listeners.forEach(listener => listener(potholeData));
  },
  
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  getPendingPotholes: () => pendingPotholes,
  
  addPendingPothole: (pothole) => {
    const newPothole = { ...pothole, votes: 1, voters: [pothole.reportedBy || 'Anonymous'] };
    pendingPotholes = [...pendingPotholes, newPothole];
    listeners.forEach(listener => listener(potholeData));
  },
  
  voteForPothole: (id, voterName) => {
    pendingPotholes = pendingPotholes.map(p => {
      if (p.id === id && !p.voters.includes(voterName)) {
        const updatedPothole = {
          ...p,
          votes: p.votes + 1,
          voters: [...p.voters, voterName]
        };
        
        if (updatedPothole.votes >= 5) {
          const confirmedPothole = { ...updatedPothole };
          delete confirmedPothole.votes;
          delete confirmedPothole.voters;
          potholeData = [...potholeData, confirmedPothole];
          pendingPotholes = pendingPotholes.filter(pp => pp.id !== id);
        }
        
        return updatedPothole;
      }
      return p;
    });
    listeners.forEach(listener => listener(potholeData));
  },
  
  getPendingReports: () => pendingReports,
  
  addPendingReport: (report) => {
    pendingReports = [...pendingReports, report];
    localStorage.setItem('pendingReports', JSON.stringify(pendingReports));
    listeners.forEach(listener => listener(potholeData));
  },
  
  initializeReports: () => {
    // Force reload from localStorage
    const stored = localStorage.getItem('pendingReports');
    if (stored) {
      pendingReports = JSON.parse(stored);
    }
  },
  
  approveReport: (reportId) => {
    const report = pendingReports.find(r => r.id === reportId);
    if (report) {
      const newId = `P${String(potholeData.length + 1).padStart(3, '0')}`;
      const pothole = {
        id: newId,
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        depth: 3.0,
        severity: 'medium',
        timestamp: new Date().toISOString(),
        status: 'pending',
        reportedBy: report.name,
        reporterEmail: report.email,
        estimatedCost: 2500
      };
      potholeData = [...potholeData, pothole];
      localStorage.setItem('potholeData', JSON.stringify(potholeData));
      pendingReports = pendingReports.filter(r => r.id !== reportId);
      localStorage.setItem('pendingReports', JSON.stringify(pendingReports));
      listeners.forEach(listener => listener(potholeData));
    }
  },
  
  rejectReport: (reportId) => {
    pendingReports = pendingReports.filter(r => r.id !== reportId);
    localStorage.setItem('pendingReports', JSON.stringify(pendingReports));
    listeners.forEach(listener => listener(potholeData));
  }
};