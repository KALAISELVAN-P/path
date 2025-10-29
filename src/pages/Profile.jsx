import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, FileText, LogOut, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setEditData({
      name: userData.name || '',
      email: userData.email || ''
    });

    // Load user complaints
    const allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    const userComplaints = allComplaints.filter(c => c.email === userData.email);
    setComplaints(userComplaints);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your complaint history</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="btn-primary flex items-center space-x-2 flex-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex items-center space-x-2 flex-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">January 2024</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Complaints</span>
                  <span className="font-semibold text-primary">{complaints.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">
                    {complaints.filter(c => c.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Complaints History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">My Complaints</h2>
              </div>

              {complaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't submitted any complaints yet. Help us improve road conditions by reporting issues.
                  </p>
                  <a
                    href="/report"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Report an Issue</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="font-medium text-gray-900 mb-2 sm:mb-0">
                          Complaint #{complaint.id}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(complaint.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{complaint.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Submitted</p>
                          <p className="text-sm text-gray-600">
                            {new Date(complaint.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                        <p className="text-sm text-gray-600">{complaint.description}</p>
                      </div>
                      
                      {complaint.image && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Attachment</p>
                          <p className="text-sm text-blue-600">📎 {complaint.image.name}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;