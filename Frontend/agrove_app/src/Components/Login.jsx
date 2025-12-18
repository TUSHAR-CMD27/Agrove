import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import './Authentication.css';

const Login = () => {
  const nav = useNavigate(); // ✅ Defined as 'nav'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Check for missing profile data
      if (!user.age || !user.state || !user.district || !user.pincode) {
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
      // ✅ Matches your backend port 3000
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });

      console.log("Login Success:", res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.age === null || res.data.state === null || res.data.district === null || res.data.pincode === null) {
        // If any required profile field is null/missing
        nav('/onboarding');
      } else {
        // If all profile fields are present
        nav('/dashboard');
      }
      window.location.reload();
      // ✅ Fixed: changed 'navigate' to 'nav'

    } catch (error) {
      console.error("Login Error:", error);
      // Simple alert for now since toast is commented out
      alert(error.response?.data?.message || 'Login Failed');
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

      console.log("Google Login Success:", res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.age === null || res.data.state === null || res.data.district === null || res.data.pincode === null) {
        // If any required profile field is null/missing
        nav('/onboarding');
      } else {
        // If all profile fields are present
        nav('/dashboard');
      }
      window.location.reload();
    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.response?.data?.message || 'Google Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert('Google Login Failed. Please try again.');
  };

  return (
    <div className="auth-container">
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
                value={email}                       /* ✅ ADDED */
                onChange={(e) => setEmail(e.target.value)} /* ✅ ADDED */
                required                            /* ✅ ADDED */
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
                value={password}                    /* ✅ ADDED */
                onChange={(e) => setPassword(e.target.value)} /* ✅ ADDED */
                required                            /* ✅ ADDED */
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging In...' : <>Login to Dashboard <FiArrowRight /></>}
          </button>
        </form>

        {/* Google OAuth Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google Sign-In Button */}
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            width="100%"
            text="signin_with"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
