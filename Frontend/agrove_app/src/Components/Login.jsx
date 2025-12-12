import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import './Authentication.css';

const Login = () => {

const handleSubmit = (e) => {
    e.preventDefault();

 }
  return (
    <div className="auth-container">
      {/* Ambient Background */}
      <div className="auth-blob blob-auth-1"></div>
      <div className="auth-blob blob-auth-2"></div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            New to Agrove? <Link to="/signup">Create an account</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or User ID</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                className="auth-input" 
                placeholder="farmer@agrove.in" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            Login to Dashboard <FiArrowRight />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;