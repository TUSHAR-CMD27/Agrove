import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiMapPin, FiCalendar, FiHash } from 'react-icons/fi';
import './Authentication.css';

const Signup = () => {

    const handleSubmit = (e) => {
    e.preventDefault();

 }
  return (
    <div className="auth-container">
      {/* Ambient Background */}
      <div className="auth-blob blob-auth-1"></div>
      <div className="auth-blob blob-auth-2"></div>

      <motion.div 
        className="auth-card wide"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h2 className="auth-title">Join Agrove</h2>
          <p className="auth-subtitle">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 2-Column Grid for details */}
          <div className="form-grid">
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input type="text" className="auth-input" placeholder="Tushar ..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <div className="input-wrapper">
                <FiCalendar className="input-icon" />
                <input type="number" className="auth-input" placeholder="24" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input type="email" className="auth-input" placeholder="user@email.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Create Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input type="password" className="auth-input" placeholder="••••••••" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input type="text" className="auth-input" placeholder="Maharashtra" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input type="text" className="auth-input" placeholder="Thane" />
              </div>
            </div>
            
            {/* Spanning full width for Pincode if needed, or keep in grid */}
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input type="number" className="auth-input" placeholder="421202" />
              </div>
            </div>
             
             {/* Read-only system field simulation */}
             <div className="form-group">
              <label className="form-label">User ID (Auto-generated)</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input 
                  type="text" 
                  className="auth-input" 
                  value="AG-2025-X89" 
                  disabled 
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            Create Account
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;