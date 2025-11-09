import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, FileText, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { fetchPotholeData, testESP32Connection } from '../api/espApi';

const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [esp32Connected, setEsp32Connected] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchPotholeData();
        const total = data.length;
        const pending = data.filter(p => p.status === 'pending').length;
        const resolved = data.filter(p => p.status === 'resolved').length;
        
        setStats({ total, pending, resolved });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    const checkConnection = async () => {
      const connected = await testESP32Connection();
      setEsp32Connected(connected);
    };

    loadStats();
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-violet-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-400/15 to-purple-400/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-rose-400/8 to-pink-400/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Pothole Detection System
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Detect. Report. Repair. Making Roads Safer with IoT and AI.
          </p>
          
          {/* ESP32 Connection Status */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
            esp32Connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {esp32Connected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>ESP32 Connected (192.168.22.122)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>ESP32 Offline - Using Mock Data</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Map className="w-6 h-6" />
                <span>View Live Map</span>
              </motion.button>
            </Link>
            
            <Link to="/report">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <FileText className="w-6 h-6" />
                <span>Raise Complaint</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            whileHover={{ y: -5 }}
            className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <p className="text-blue-100">Total Potholes Detected</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <p className="text-orange-100">Complaints Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card bg-gradient-to-r from-green-500 to-green-600 text-white"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <p className="text-green-100">Resolved Potholes</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* About Section */}
        <motion.div variants={itemVariants} className="card max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            About the Project
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Our Smart Pothole Detection System uses advanced IoT sensors and AI technology to automatically 
            detect road irregularities and potholes. The system helps municipalities and road authorities 
            maintain better road infrastructure by providing real-time data and enabling quick response to 
            road maintenance needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IoT Detection</h3>
              <p className="text-gray-600 text-sm">Advanced sensors detect road irregularities in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Analytics</h3>
              <p className="text-gray-600 text-sm">Comprehensive analysis and reporting of road conditions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">Immediate alerts and efficient maintenance scheduling</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn-primary"
              >
                Learn More About Our System
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;