import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Camera, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { potholeStore } from '../store/potholeStore';

const RaiseComplaint = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    description: '',
    image: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      // Store complaint in localStorage for demo
      const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      const newComplaint = {
        id: Date.now(),
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      complaints.push(newComplaint);
      localStorage.setItem('complaints', JSON.stringify(complaints));

      // Add to pending reports for admin approval
      const coordMatch = formData.location.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      let lat, lng, locationName;
      
      if (coordMatch) {
        [, lat, lng] = coordMatch;
        locationName = formData.location.replace(coordMatch[0], '').trim() || 'Reported Location';
      } else {
        // Default to Coimbatore coordinates if no coordinates provided
        lat = 11.0168 + (Math.random() - 0.5) * 0.1;
        lng = 76.9558 + (Math.random() - 0.5) * 0.1;
        locationName = formData.location;
      }
      
      const reportId = `R${String(Date.now()).slice(-6)}`;
      // Convert image to base64 for storage
      let imageData = null;
      if (formData.image) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const report = {
            id: reportId,
            name: formData.name,
            email: formData.email,
            location: locationName,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            description: formData.description,
            image: formData.image.name,
            imageData: e.target.result,
            timestamp: new Date().toISOString(),
            status: 'pending'
          };
          potholeStore.addPendingReport(report);
        };
        reader.readAsDataURL(formData.image);
      } else {
        const report = {
          id: reportId,
          name: formData.name,
          email: formData.email,
          location: locationName,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          description: formData.description,
          image: null,
          imageData: null,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        potholeStore.addPendingReport(report);
      }

      toast.success('Report submitted successfully! It will be reviewed by government officials.');
      setFormData({
        name: '',
        email: '',
        location: '',
        description: '',
        image: null
      });
      setLoading(false);
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get location name
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            let locationName = 'Unknown Location';
            
            if (data.address) {
              locationName = data.address.road || 
                           data.address.neighbourhood || 
                           data.address.suburb || 
                           data.address.village || 
                           data.address.town || 
                           data.address.city || 
                           'Unknown Location';
            }
            
            setFormData({
              ...formData,
              location: `${locationName} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
            });
          } catch (error) {
            setFormData({
              ...formData,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          }
          
          toast.success('Location detected successfully');
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Raise a Complaint</h1>
          <p className="text-gray-600">
            Report road issues and help us maintain better infrastructure
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card"
        >
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    required
                    className="input-field pl-10"
                    placeholder="Enter location or coordinates"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-secondary whitespace-nowrap"
                >
                  Get Location
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="input-field pl-10"
                  onChange={handleImageChange}
                />
              </div>
              {formData.image && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {formData.image.name}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="input-field pl-10 resize-none"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mt-8 bg-blue-50 border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Report Effectively
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Provide accurate location information for quick response</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Include clear photos if possible to help assess severity</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Describe the issue in detail including size and impact</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>You will receive updates on your complaint via email</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default RaiseComplaint;