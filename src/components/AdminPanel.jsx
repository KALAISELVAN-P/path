import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { updatePotholeStatus } from '../api/espApi';
import toast from 'react-hot-toast';

const AdminPanel = ({ isOpen, onClose, potholes, onUpdatePothole }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    const total = potholes.length;
    const pending = potholes.filter(p => p.status === 'pending').length;
    const resolved = potholes.filter(p => p.status === 'resolved').length;
    
    setStats({ total, pending, resolved });
  }, [potholes]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updatePotholeStatus(id, newStatus);
      onUpdatePothole(id, newStatus);
      toast.success(`Pothole ${newStatus === 'resolved' ? 'marked as fixed' : 'assigned for work'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Potholes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pothole List */}
          <div className="overflow-y-auto max-h-96">
            <h3 className="text-lg font-semibold mb-4">Manage Potholes</h3>
            <div className="space-y-4">
              {potholes.map((pothole) => (
                <div key={pothole.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">ID: {pothole.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pothole.severity === 'high' ? 'bg-red-100 text-red-800' :
                          pothole.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {pothole.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pothole.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {pothole.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Depth: {pothole.depth}cm | Location: {pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {pothole.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(pothole.id, 'assigned')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Assign Work
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(pothole.id, 'resolved')}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Mark Fixed
                          </button>
                        </>
                      )}
                      {pothole.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusUpdate(pothole.id, 'resolved')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Mark Fixed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;