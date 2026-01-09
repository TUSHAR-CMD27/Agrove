import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiMapPin, FiCalendar, FiHash, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import farmImg from '../assets/f12.png';
import './Signup.css';

const Signup = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', state: '', district: '', pincode: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (!user.age || !user.state) { nav('/onboarding'); } 
      else { nav('/dashboard'); }
    }
  }, [nav]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData);
      toast.success(t('auth.success_signup'));
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      nav('/dashboard');
      window.location.reload();
    } catch (err) {
      toast.error(t('auth.error_signup'));
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading(t('auth.connecting_google'));
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      toast.success(t('auth.google_success'), { id: loadingToast });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      nav(res.data.age ? '/dashboard' : '/onboarding');
      window.location.reload();
    } catch (error) {
      toast.error(t('auth.google_fail'), { id: loadingToast });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* LEFT SIDE */}
        <div className="auth-image-side" style={{ backgroundImage: `url(${farmImg})` }}>
          <div className="auth-image-overlay"></div>
          <motion.div className="brand-overlay" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1>AGROVE</h1>
            <p>{t('auth.hero_text')}</p>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-side">
          <motion.div className="auth-card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="auth-header">
              <h2 className="auth-title">{t('auth.signup_title')}</h2>
              <p className="auth-subtitle">
                {t('auth.have_account')} <Link to="/login">{t('auth.login_here')}</Link>
              </p>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" width="300" />
            </div>

            <div className="auth-divider"><span>{t('auth.or_email')}</span></div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {[
                  { name: 'name', icon: <FiUser />, label: t('auth.full_name'), placeholder: 'Tushar...', type: 'text' },
                  { name: 'email', icon: <FiMail />, label: t('auth.email'), placeholder: 'name@email.com', type: 'email' },
                  { name: 'password', icon: <FiLock />, label: t('auth.password'), placeholder: '••••••••', type: 'password' },
                  { name: 'state', icon: <FiMapPin />, label: t('auth.state'), placeholder: 'Maharashtra', type: 'text' },
                  { name: 'district', icon: <FiMapPin />, label: t('auth.district'), placeholder: 'Dombivli', type: 'text' },
                  { name: 'age', icon: <FiCalendar />, label: t('auth.age'), placeholder: '25', type: 'number' },
                  { name: 'pincode', icon: <FiHash />, label: t('auth.pincode'), placeholder: '400001', type: 'number' },
                ].map((input) => (
                  <div className="form-group" key={input.name}>
                    <label className="form-label">{input.label}</label>
                    <div className="input-wrapper">
                      <span className="input-icon">{input.icon}</span>
                      <input 
                        type={input.type} 
                        name={input.name} 
                        value={formData[input.name]} 
                        onChange={handleChange} 
                        className="auth-input" 
                        placeholder={input.placeholder} 
                        required 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? t('auth.creating') : <>{t('auth.signup_btn')} <FiArrowRight /></>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;