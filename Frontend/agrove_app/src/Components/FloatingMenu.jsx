import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiLayers, FiActivity, FiTrash2 } from 'react-icons/fi'; // ✅ Added FiTrash2
import axios from 'axios';
import './FloatingMenu.css';
import '../Components/Bin'

const FloatingMenu = () => {
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
          const res = await axios.get('http://localhost:3000/api/fields', config);
          setFieldCount(res.data.length);
        } catch (err) {
          console.error("Field check failed", err);
          // Clear stale/invalid tokens and return to login so the user can re-authenticate
          if (err?.response?.status === 401) {
            localStorage.removeItem('userInfo');
            navigate('/login');
          }
        }
      };
      fetchFields();
    }
  }, [isOpen]);

  // 4. ADD THIS CONDITION: 
  // If not logged in OR if we are on the onboarding page, return nothing (null)
  if (!isLoggedIn || isOnboardingPage) return null;

  const toggleMenu = () => setIsOpen(!isOpen);

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
            {/* ✅ NEW: Recycle Bin Option */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.1 }}
              onClick={() => { navigate('/bin'); setIsOpen(false); }}
              className="fab-option"
            >
              <span className="fab-label">Recycle Bin</span>
              <div className="fab-icon-small bin-color">
                <FiTrash2 />
              </div>
            </motion.button>

            {/* Option 2: Add Activity */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.05 }}
              onClick={() => fieldCount > 0 ? navigate('/add-activity') : alert("Please add a field first!")}
              className={`fab-option ${fieldCount === 0 ? 'disabled' : ''}`}
            >
              <span className="fab-label">Add Activity</span>
              <div className="fab-icon-small activity-color">
                <FiActivity />
              </div>
            </motion.button>

            {/* Option 1: Add Field */}
            <motion.button
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => navigate('/add-field')}
              className="fab-option"
            >
              <span className="fab-label">Add Field</span>
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