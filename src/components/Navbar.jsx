import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, FileText, BarChart3, Info, Phone, User, Shield } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Navbar = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ id: '', password: '' });

  const handleAdminClick = (e) => {
    e.preventDefault();
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    if (adminCreds.id === 'gov123' && adminCreds.password === 'admin2024') {
      setShowAdminLogin(false);
      setAdminCreds({ id: '', password: '' });
      window.location.href = '/admin-dashboard';
    } else {
      toast.error('Invalid government credentials');
    }
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Live Map' },
    { path: '/report', icon: FileText, label: 'Report' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin-dashboard', icon: Shield, label: 'Admin', onClick: handleAdminClick },
    { path: '/about', icon: Info, label: 'About' },
    { path: '/contact', icon: Phone, label: 'Contact' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PotholeDetect</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              if (item.onClick) {
                return (
                  <button
                    key={item.path}
                    onClick={item.onClick}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-primary hover:bg-gray-50"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-primary bg-blue-50'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Government Official Access
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID
                </label>
                <input
                  type="text"
                  value={adminCreds.id}
                  onChange={(e) => setAdminCreds({...adminCreds, id: e.target.value})}
                  className="input-field"
                  placeholder="Enter government ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={adminCreds.password}
                  onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})}
                  className="input-field"
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAdminLogin}
                className="btn-primary flex-1"
              >
                Access Dashboard
              </button>
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminCreds({ id: '', password: '' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Demo Credentials:</strong><br/>
                ID: gov123<br/>
                Password: admin2024
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;