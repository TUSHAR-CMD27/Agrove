import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import farmImg from '../assets/f14.jpg'; // ✅ Your aesthetic image
import './Authentication.css';

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const hasProfile = user.age && user.state && user.district && user.pincode;
      if (!hasProfile) {
        nav('/onboarding');
      } else {
        nav('/dashboard');
      }
    }
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });

      if (res.data) {
        toast.success(`Welcome back, ${res.data.name || 'Farmer'}! `, {
          duration: 7000,
          icon: '🚜',
        });

        localStorage.setItem('userInfo', JSON.stringify(res.data));

        const { age, state, district, pincode } = res.data;
        const isProfileComplete = age && state && district && pincode;

        if (!isProfileComplete) {
          nav('/onboarding');
        } else {
          nav('/dashboard');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login Failed. Check your email/password.';
      toast.error(errorMessage);
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

      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success('Google Login Successful!', { id: loadingToast });

      const { age, state, district, pincode } = res.data;
      if (!age || !state || !district || !pincode) {
        nav('/onboarding');
      } else {
        nav('/dashboard');
      }
      window.location.reload();
    } catch (error) {
      toast.error('Google Login Failed', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">

        {/* LEFT SIDE: AESTHETIC IMAGE */}
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
            <h1>SECURE GATEWAY </h1>
            <p>Agrove is engineered to synchronize the raw power of nature with advanced digital architecture, providing farmers with a robust command center for every acre under their care.</p>
          </motion.div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="auth-form-side">
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
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="auth-input"
                    placeholder="farmer@agrove.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Logging In...' : <>Login to Dashboard <FiArrowRight /></>}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                theme="filled_black"
                size="large"
                width="100%"
              />
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Login;