import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import farmImg from '../assets/f14.jpg';
import './Authentication.css';

const Login = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const hasProfile = user.age && user.state && user.district && user.pincode;
      nav(hasProfile ? '/dashboard' : '/onboarding');
    }
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      if (res.data) {
        // 3. Translated Toast with dynamic name
        toast.success(`${t('auth.welcome_back')}, ${res.data.name || t('auth.farmer')}!`, {
          duration: 7000,
          icon: '🚜',
        });

        localStorage.setItem('userInfo', JSON.stringify(res.data));
        const { age, state, district, pincode } = res.data;
        nav(age && state && district && pincode ? '/dashboard' : '/onboarding');
      }
    } catch (error) {
      // 4. Translated error message
      toast.error(t('auth.error_login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading(t('auth.connecting_google'));
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success(t('auth.google_success'), { id: loadingToast });
      nav(res.data.age ? '/dashboard' : '/onboarding');
      window.location.reload();
    } catch (error) {
      toast.error(t('auth.google_fail'), { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* LEFT SIDE */}
        <div className="auth-image-side" style={{ backgroundImage: `url(${farmImg})` }}>
          <div className="auth-image-overlay"></div>
          <motion.div className="brand-overlay" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1>{t('auth.secure_gateway')}</h1>
            <p>{t('auth.login_description')}</p>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-side">
          <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="auth-header">
              <h2 className="auth-title">{t('auth.welcome_title')}</h2>
              <p className="auth-subtitle">
                {t('auth.new_user')} <Link to="/signup">{t('auth.create_account')}</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="farmer@agrove.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? t('auth.logging_in') : <>{t('auth.login_btn')} <FiArrowRight /></>}
              </button>
            </form>

            <div className="auth-divider"><span>{t('auth.or_continue')}</span></div>

            <div className="google-btn-wrapper">
              <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" width="300" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;