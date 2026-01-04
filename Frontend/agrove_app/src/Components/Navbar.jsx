import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { IoLanguage } from "react-icons/io5";
import {
  FiHome, FiGrid, FiUser, FiLogIn, FiUserPlus, FiPlus, FiLayers, FiActivity
} from 'react-icons/fi';
import './Navbar.css';

// --- 1. Sub-component defined OUTSIDE to follow Hook rules ---
const NavItem = ({ to, icon, label, closeMenu, variants }) => (
  <li className="nav-item">
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`}
      onClick={closeMenu}
    >
      <motion.div
        className="icon-container"
        variants={variants}
        whileHover="hover"
        whileTap="tap"
      >
        {icon}
      </motion.div>
      <span className="nav-tooltip">{label}</span>
    </NavLink>
  </li>
);

const Navbar = () => {
  // --- 2. Hooks (Must be at the top) ---
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fieldCount, setFieldCount] = useState(0);

  // --- 3. Logic ---
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const checkUser = async () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      setUser(null);
      setFieldCount(0);
      return;
    }
    try {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      const res = await axios.get('http://localhost:10000/api/fields', {

        headers: { Authorization: `Bearer ${parsedUser.token}` }
      });
      setFieldCount(res.data.length);
    } catch (error) {
      setFieldCount(0);
    }
  };

  useEffect(() => {
    checkUser();
    const interval = setInterval(checkUser, 3000);
    return () => clearInterval(interval);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const iconVariants = { hover: { scale: 1.2 }, tap: { scale: 0.9 } };
  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.8 },
    visible: { opacity: 1, y: 15, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.8 }
  };

  return (
    <motion.nav 
      className="floating-navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <ul className="nav-list">
        <h1 className="ayo" onClick={() => { closeMenu(); navigate('/'); }}>AGROVE</h1>

        <NavItem to="/" icon={<FiHome size={22} />} label={t('nav.home')} closeMenu={closeMenu} variants={iconVariants} />
        
        <NavItem to="/dashboard" icon={<FiGrid size={22} />} label={t('nav.dashboard')} closeMenu={closeMenu} variants={iconVariants} />

        {user && (
          <li className="nav-item fab-wrapper">
            <motion.button
              className={`nav-fab ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
            >
              <FiPlus size={28} />
            </motion.button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div className="navbar-popup-menu" initial="hidden" animate="visible" exit="exit" variants={menuVariants}>
                  <button onClick={() => { closeMenu(); fieldCount > 0 ? navigate('/add-activity') : alert(t('nav.alert_field')); }} className="popup-btn">
                    <div className="popup-icon"><FiActivity /></div>
                    <span className="popup-label">{t('nav.add_activity')}</span>
                  </button>
                  <button onClick={() => { closeMenu(); navigate('/add-field'); }} className="popup-btn">
                    <div className="popup-icon"><FiLayers /></div>
                    <span className="popup-label">{t('nav.add_field')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )}

        <NavItem to="/profile" icon={<FiUser size={22} />} label={t('nav.profile')} closeMenu={closeMenu} variants={iconVariants} />

        {/* Language Toggle */}
        <li className="nav-item">
          <button className="lang-toggle-btn" onClick={toggleLanguage} style={{background:'none', border:'none', color:'inherit', cursor:'pointer'}}>
            <motion.div variants={iconVariants} whileHover="hover">
              <IoLanguage size={24} color="#39ff14" />
            </motion.div>
            <span className="nav-tooltip">{i18n.language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </li>
      </ul>
    </motion.nav>
  );
};

export default Navbar;