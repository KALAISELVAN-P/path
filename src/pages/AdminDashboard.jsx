import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, User, DollarSign, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { potholeStore } from '../store/potholeStore';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [potholes, setPotholes] = useState(potholeStore.getData());
  const [pendingReports, setPendingReports] = useState(potholeStore.getPendingReports());
  const [teams, setTeams] = useState([
    { id: 1, name: 'Girls eh raanuva padai', leader: 'Kaaya', status: 'available', members: 4 },
    { id: 2, name: 'The great kirikalan patch up', leader: 'Lydia', status: 'busy', members: 3 },
    { id: 3, name: 'Saaptu saaingalama pannuvom', leader: 'Nikila', status: 'available', members: 5 }
  ]);

  useEffect(() => {
    try {
      potholeStore.initializeReports();
      const unsubscribe = potholeStore.subscribe(() => {
        setPotholes(potholeStore.getData());
        setPendingReports(potholeStore.getPendingReports());
      });
      setPotholes(potholeStore.getData());
      setPendingReports(potholeStore.getPendingReports());
      return unsubscribe;
    } catch (error) {
      console.error('Error loading pothole data:', error);
    }
  }, []);

  const assignTeam = (potholeId, teamName) => {
    potholeStore.updatePothole(potholeId, { status: 'assigned', assignedTeam: teamName });
    setTeams(prev =>
      prev.map(t => t.name === teamName ? { ...t, status: 'busy' } : t)
    );
  };

  const markCompleted = (potholeId) => {
    const pothole = potholes.find(p => p.id === potholeId);
    potholeStore.updatePothole(potholeId, { status: 'completed' });
    if (pothole.assignedTeam) {
      setTeams(prev =>
        prev.map(t => t.name === pothole.assignedTeam ? { ...t, status: 'available' } : t)
      );
    }
  };

  const totalCost = potholes.reduce((sum, p) => sum + p.estimatedCost, 0);
  const pendingCount = potholes.filter(p => p.status === 'pending').length;
  const assignedCount = potholes.filter(p => p.status === 'assigned').length;
  const completedCount = potholes.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Government Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Pothole Management & Repair Team Coordination</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-orange-50 border-orange-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-orange-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-blue-600 font-medium">Assigned</p>
                <p className="text-2xl font-bold text-blue-900">{assignedCount}</p>
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-purple-600 font-medium">Total Cost</p>
                <p className="text-2xl font-bold text-purple-900">₹{totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reports Section */}
        {pendingReports.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-6">Pending Reports for Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReports.map((report) => (
                <div key={report.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">Report {report.id}</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      PENDING REVIEW
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p><strong>Reporter:</strong> {report.name}</p>
                    <p><strong>Email:</strong> {report.email}</p>
                    <p><strong>Location:</strong> {report.location}</p>
                    <p><strong>Coordinates:</strong> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
                    <p><strong>Description:</strong> {report.description}</p>
                    <p><strong>Submitted:</strong> {new Date(report.timestamp).toLocaleDateString()}</p>
                    {report.image && (
                      <div>
                        <p><strong>Photo:</strong> <span className="text-green-600">{report.image}</span></p>
                        {report.imageData && (
                          <img src={report.imageData} alt="Report" className="mt-2 max-w-full h-32 object-cover rounded" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        potholeStore.approveReport(report.id);
                        toast.success('Report approved and added as pothole!');
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex-1"
                    >
                      Approve as Pothole
                    </button>
                    <button
                      onClick={() => {
                        potholeStore.rejectReport(report.id);
                        toast.success('Report rejected');
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex-1"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pothole Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Pothole Management</h2>
              <div className="space-y-4">
                {potholes.map((pothole) => (
                  <div key={pothole.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{pothole.id} - {pothole.location}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(pothole.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pothole.status === 'completed' ? 'bg-green-100 text-green-800' :
                        pothole.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {pothole.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Depth</p>
                        <p className="text-lg font-semibold">{pothole.depth} cm</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Severity</p>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pothole.severity.charAt(0).toUpperCase() + pothole.severity.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reported By</p>
                        <p className="text-sm">{pothole.reportedBy}</p>
                        <p className="text-xs text-gray-500">{pothole.reporterEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Est. Cost</p>
                        <p className="text-lg font-semibold text-green-600">₹{pothole.estimatedCost.toLocaleString()}</p>
                      </div>
                    </div>

                    {pothole.assignedTeam && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Assigned Team</p>
                        <p className="text-blue-600 font-medium">{pothole.assignedTeam}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {pothole.status === 'pending' && (
                        <select
                          onChange={(e) => e.target.value && assignTeam(pothole.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          defaultValue=""
                        >
                          <option value="">Assign Team</option>
                          {teams.filter(t => t.status === 'available').map(team => (
                            <option key={team.id} value={team.name}>{team.name}</option>
                          ))}
                        </select>
                      )}
                      {pothole.status === 'assigned' && (
                        <button
                          onClick={() => markCompleted(pothole.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Status */}
          <div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Repair Teams</h2>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{team.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        team.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {team.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Leader:</strong> {team.leader}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {team.members} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;