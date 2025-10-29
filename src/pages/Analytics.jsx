import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { fetchPotholeData } from '../api/espApi';
import { potholeStore } from '../store/potholeStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [potholes, setPotholes] = useState(potholeStore.getData());
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('weekly');

  useEffect(() => {
    try {
      const unsubscribe = potholeStore.subscribe(setPotholes);
      setPotholes(potholeStore.getData());
      return unsubscribe;
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  }, []);

  // Depth Distribution Data
  const depthDistribution = {
    labels: ['0-2 cm', '2-4 cm', '4-6 cm', '6-8 cm', '8+ cm'],
    datasets: [
      {
        label: 'Number of Potholes',
        data: [
          potholes.filter(p => p.depth <= 2).length,
          potholes.filter(p => p.depth > 2 && p.depth <= 4).length,
          potholes.filter(p => p.depth > 4 && p.depth <= 6).length,
          potholes.filter(p => p.depth > 6 && p.depth <= 8).length,
          potholes.filter(p => p.depth > 8).length,
        ],
        backgroundColor: [
          '#10b981',
          '#84cc16',
          '#f59e0b',
          '#f97316',
          '#ef4444',
        ],
        borderColor: [
          '#059669',
          '#65a30d',
          '#d97706',
          '#ea580c',
          '#dc2626',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Severity Distribution Data
  const severityDistribution = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [
          potholes.filter(p => p.severity === 'low').length,
          potholes.filter(p => p.severity === 'medium').length,
          potholes.filter(p => p.severity === 'high').length,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  // Time Series Data (simulated)
  const generateTimeSeriesData = () => {
    const days = timeRange === 'daily' ? 7 : 30;
    const labels = [];
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }));
      data.push(Math.floor(Math.random() * 5) + 1);
    }

    return { labels, data };
  };

  const timeSeriesData = generateTimeSeriesData();
  const complaintsOverTime = {
    labels: timeSeriesData.labels,
    datasets: [
      {
        label: 'Potholes Detected',
        data: timeSeriesData.data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive analysis of pothole detection data
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              <div>
                <p className="text-blue-100">Total Detected</p>
                <p className="text-2xl font-bold">{potholes.length}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <PieChart className="w-8 h-8 mr-3" />
              <div>
                <p className="text-green-100">Low Severity</p>
                <p className="text-2xl font-bold">
                  {potholes.filter(p => p.severity === 'low').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 mr-3" />
              <div>
                <p className="text-orange-100">Medium Severity</p>
                <p className="text-2xl font-bold">
                  {potholes.filter(p => p.severity === 'medium').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              <div>
                <p className="text-red-100">High Severity</p>
                <p className="text-2xl font-bold">
                  {potholes.filter(p => p.severity === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Depth Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Depth Distribution</h2>
            <Bar data={depthDistribution} options={chartOptions} />
          </motion.div>

          {/* Severity Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-xl font-semibold mb-4">Severity Distribution</h2>
            <Pie data={severityDistribution} options={pieOptions} />
          </motion.div>
        </div>

        {/* Time Series Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold">Detection Trends</h2>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  timeRange === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  timeRange === 'weekly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
          <Line data={complaintsOverTime} options={chartOptions} />
        </motion.div>

        {/* Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Average Depth</h3>
              <p className="text-2xl font-bold text-primary">
                {potholes.length > 0 
                  ? (potholes.reduce((sum, p) => sum + p.depth, 0) / potholes.length).toFixed(1)
                  : 0
                } cm
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Resolution Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {potholes.length > 0 
                  ? Math.round((potholes.filter(p => p.status === 'resolved').length / potholes.length) * 100)
                  : 0
                }%
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Pending Issues</h3>
              <p className="text-2xl font-bold text-orange-600">
                {potholes.filter(p => p.status === 'pending').length}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Critical Issues</h3>
              <p className="text-2xl font-bold text-red-600">
                {potholes.filter(p => p.severity === 'high' && p.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;