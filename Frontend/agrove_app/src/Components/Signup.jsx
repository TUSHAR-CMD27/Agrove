



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiMapPin, FiCalendar, FiHash } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast'; // --- IMPORT ADDED ---
import './Authentication.css';

const Signup = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    state: '',
    district: '',
    pincode: ''
  });

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (!user.age || !user.state) {
        nav('/onboarding');
      } else {
        nav('/dashboard');
      }
    }
  }, [nav]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Signup Success:", res.data);
      // --- SUCCESS TOAST ---
      toast.success("Account created successfully!");
      
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      
      nav('/dashboard');
      window.location.reload(); 

    } catch (err) {
      // --- REPLACED ALERTS WITH TOASTS ---
      if (err.code === 'ERR_NETWORK') {
        console.error("Connection Refused: Is the backend server running on port 3000?");
        toast.error("Network Error: Cannot reach the server.");
      } else {
        console.error("Signup Error Response:", err.response?.data);
        const message = err.response?.data?.message || "Signup Failed";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/auth/google', {
        credential: credentialResponse.credential
      });
      
      toast.success("Google Signup Successful!");
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      nav('/onboarding');
      window.location.reload();
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error('Google Signup Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-blob blob-auth-1"></div>
      <div className="auth-blob blob-auth-2"></div>

      <motion.div className="auth-card wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="auth-header">
          <h2 className="auth-title">Join Agrove</h2>
          <p className="auth-subtitle">Already have an account? <Link to="/login">Login here</Link></p>
        </div>

        <div className="google-btn-wrapper">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => toast.error('Google Signup Failed')} // --- UPDATED ---
            theme="filled_black" 
            width="100%" 
          />
        </div>

        <div className="auth-divider"><span>or sign up with email</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="auth-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="auth-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="auth-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" /><input type="text" name="state" value={formData.state} onChange={handleChange} className="auth-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" /><input type="text" name="district" value={formData.district} onChange={handleChange} className="auth-input" required />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Age</label>
              <div className="input-wrapper">
                <FiCalendar className="input-icon" /><input type="number" name="age" value={formData.age} onChange={handleChange} className="auth-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" /><input type="number" name="pincode" value={formData.pincode} onChange={handleChange} className="auth-input" required />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;