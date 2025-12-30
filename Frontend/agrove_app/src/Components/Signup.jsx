import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiMapPin, FiCalendar, FiHash, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import farmImg from '../assets/f12.png'; // ✅ Using the same aesthetic image
import './Signup.css';

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
        headers: { 'Content-Type': 'application/json' }
      });

      toast.success("Account created successfully!");
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      nav('/dashboard');
      window.location.reload(); 

    } catch (err) {
      const message = err.response?.data?.message || "Signup Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading("Connecting to Google...");
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/auth/google', {
        credential: credentialResponse.credential
      });
      
      toast.success("Google Signup Successful!", { id: loadingToast });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      nav('/onboarding');
      window.location.reload();
    } catch (error) {
      toast.error('Google Signup Failed', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        
        {/* LEFT SIDE: AESTHETIC IMAGE & BRANDING */}
        <div 
          className="auth-image-side" 
          style={{ backgroundImage: `url(${farmImg})` }}
        >
          <div className="auth-image-overlay"></div>
          
          <motion.div 
            className="brand-overlay"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1>AGROVE</h1>
            <p>Join the next generation of precision farming.</p>
          </motion.div>
        </div>

        {/* RIGHT SIDE: SIGNUP FORM */}
        <div className="auth-form-side">
          <motion.div 
            className="auth-card wide" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-header">
              <h2 className="auth-title">Join in</h2>
              <p className="auth-subtitle">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => toast.error('Google Signup Failed')} 
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
                    <FiUser className="input-icon" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="auth-input" placeholder="Tushar..." required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="auth-input" placeholder="name@email.com" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="auth-input" placeholder="••••••••" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <div className="input-wrapper">
                    <FiMapPin className="input-icon" />
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="auth-input" placeholder="Maharashtra" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <div className="input-wrapper">
                    <FiMapPin className="input-icon" />
                    <input type="text" name="district" value={formData.district} onChange={handleChange} className="auth-input" placeholder="District" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <div className="input-wrapper">
                    <FiCalendar className="input-icon" />
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="auth-input" placeholder="25" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <div className="input-wrapper">
                    <FiHash className="input-icon" />
                    <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} className="auth-input" placeholder="400001" required />
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : <>Create Account <FiArrowRight /></>}
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Signup;