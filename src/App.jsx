import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import RaiseComplaint from './pages/RaiseComplaint';
import Analytics from './pages/Analytics';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                <Login setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/home" />
              } 
            />
            <Route 
              path="/signup" 
              element={
                !isAuthenticated ? 
                <Signup setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/home" />
              } 
            />
            <Route 
              path="/home" 
              element={
                isAuthenticated ? 
                <Home /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/map" 
              element={
                isAuthenticated ? 
                <MapPage /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/report" 
              element={
                isAuthenticated ? 
                <RaiseComplaint /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                isAuthenticated ? 
                <Analytics /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/about" 
              element={
                isAuthenticated ? 
                <About /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/contact" 
              element={
                isAuthenticated ? 
                <Contact /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? 
                <Profile setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                isAuthenticated ? 
                <AdminDashboard /> : 
                <Navigate to="/login" />
              } 
            />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;