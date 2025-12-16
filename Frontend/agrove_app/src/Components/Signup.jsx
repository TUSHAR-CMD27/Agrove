import React, {useState} from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiMapPin, FiCalendar, FiHash } from 'react-icons/fi';
import './Authentication.css';

const Signup = () => {
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    state: '',
    district: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Corrected URL to match your backend port
      const res = await axios.post('http://localhost:3000/api/auth/signup', formData);
      console.log("Success", res.data);

      localStorage.setItem('userInfo', JSON.stringify(res.data));
      
      // Navigate to Dashboard or Home after signup
      nav('/dashboard'); 
      window.location.reload()
    } catch (err) {
      console.log("Error:", err.response?.data?.message || err.message);
      alert("Signup Failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
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
          <div className="form-grid">
            
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input 
                  type="text" 
                  name="name" /* ✅ ADDED */
                  value={formData.name} /* ✅ ADDED */
                  onChange={handleChange} /* ✅ ADDED */
                  className="auth-input" 
                  placeholder="Tushar ..." 
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label">Age</label>
              <div className="input-wrapper">
                <FiCalendar className="input-icon" />
                <input 
                  type="number" 
                  name="age" /* ✅ ADDED */
                  value={formData.age} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="24" 
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  name="email" /* ✅ ADDED */
                  value={formData.email} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="user@email.com" 
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  name="password" /* ✅ ADDED */
                  value={formData.password} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label">State</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input 
                  type="text" 
                  name="state" /* ✅ ADDED */
                  value={formData.state} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="Maharashtra" 
                />
              </div>
            </div>

            {/* District */}
            <div className="form-group">
              <label className="form-label">District</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input 
                  type="text" 
                  name="district" /* ✅ ADDED */
                  value={formData.district} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="Thane" 
                />
              </div>
            </div>
            
            {/* Pincode */}
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <div className="input-wrapper">
                <FiHash className="input-icon" />
                <input 
                  type="number" 
                  name="pincode" /* ✅ ADDED */
                  value={formData.pincode} 
                  onChange={handleChange} 
                  className="auth-input" 
                  placeholder="421202" 
                />
              </div>
            </div>
             
             {/* Read-only ID */}
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

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
