import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, BarChart3, Shield, Zap, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Cpu,
      title: 'IoT Sensors',
      description: 'Advanced sensors detect road irregularities and measure pothole depth with high precision.',
      color: 'bg-blue-500'
    },
    {
      icon: Wifi,
      title: 'Real-time Data',
      description: 'Continuous monitoring and instant data transmission for immediate response.',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Comprehensive data analysis and reporting for better decision making.',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Reliable System',
      description: 'Robust and weather-resistant sensors ensure consistent performance.',
      color: 'bg-orange-500'
    },
    {
      icon: Zap,
      title: 'Quick Response',
      description: 'Automated alerts enable rapid response and efficient maintenance scheduling.',
      color: 'bg-red-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Citizens can report issues and track progress for better community engagement.',
      color: 'bg-indigo-500'
    }
  ];

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Smart Pothole Detection System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our innovative system combines IoT technology, artificial intelligence, and community 
            engagement to create safer roads and more efficient infrastructure maintenance.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To revolutionize road maintenance through smart technology, ensuring safer travel 
              for everyone while optimizing municipal resources and improving quality of life 
              in our communities.
            </p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Detection</h3>
              <p className="text-gray-600">
                IoT sensors mounted on vehicles continuously monitor road conditions and 
                detect irregularities using advanced algorithms.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analysis</h3>
              <p className="text-gray-600">
                Data is processed in real-time to determine severity levels, location accuracy, 
                and priority for maintenance actions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Action</h3>
              <p className="text-gray-600">
                Automated alerts are sent to maintenance teams, and work orders are 
                generated for efficient repair scheduling.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="card"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Technology Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Hardware</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>ESP32 Microcontrollers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Ultrasonic Distance Sensors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>GPS Modules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Accelerometers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Wireless Communication Modules</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Software</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>React.js Frontend</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Firebase Backend</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Machine Learning Algorithms</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Real-time Data Processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Mobile-responsive Design</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-800">For Municipalities</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Reduced maintenance costs through predictive repairs</li>
                <li>• Improved resource allocation and planning</li>
                <li>• Enhanced public safety and satisfaction</li>
                <li>• Data-driven decision making</li>
                <li>• Automated reporting and documentation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-800">For Citizens</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Safer driving conditions</li>
                <li>• Reduced vehicle damage and maintenance</li>
                <li>• Improved road quality over time</li>
                <li>• Easy complaint reporting system</li>
                <li>• Transparent progress tracking</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;