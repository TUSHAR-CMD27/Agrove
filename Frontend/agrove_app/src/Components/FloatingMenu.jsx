import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiLayers, FiActivity, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast
import { useTranslation } from 'react-i18next'; // 1. Import hook
import './FloatingMenu.css';

const FloatingMenu = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [fieldCount, setFieldCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isOnboardingPage = location.pathname === '/onboarding';

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setIsLoggedIn(true);
      const fetchFields = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fields`, config);
          setFieldCount(res.data.length);
        } catch (err) {
          if (err?.response?.status === 401) {
            localStorage.removeItem('userInfo');
            navigate('/login');
          }
        }
      };
      fetchFields();
    }
  }, [isOpen, navigate]);

  if (!isLoggedIn || isOnboardingPage) return null;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleActivityClick = () => {
    if (fieldCount > 0) {
      navigate('/add-activity');
      setIsOpen(false);
    } else {
      toast.error(t('nav.err_no_fields')); // Localized toast
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.8 }
  };

  return (
    <div className="fab-container">
      <AnimatePresence>
        {isOpen && (
          <div className="fab-options">
            {/* Recycle Bin */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.1 }}
              onClick={() => { navigate('/bin'); setIsOpen(false); }}
              className="fab-option"
            >
             
              <div className="fab-icon-small bin-color">
                <FiTrash2 />
              </div>
            </motion.button>

            {/* Add Activity */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.05 }}
              onClick={handleActivityClick}
              className={`fab-option ${fieldCount === 0 ? 'disabled' : ''}`}
            >
              <span className="fab-label">{t('nav.add_activity')}</span>
              <div className="fab-icon-small activity-color">
                <FiActivity />
              </div>
            </motion.button>

            {/* Add Field */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => { navigate('/add-field'); setIsOpen(false); }}
              className="fab-option"
            >
              <span className="fab-label">{t('nav.add_field')}</span>
              <div className="fab-icon-small field-color">
                <FiLayers />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        className="fab-main-btn"
        onClick={toggleMenu}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <FiPlus />
      </motion.button>
    </div>
  );
};

export default FloatingMenu;