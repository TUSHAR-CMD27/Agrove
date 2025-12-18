import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FiHome,
  FiGrid,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiPlus,
  FiLayers,
  FiActivity,
  FiInfo 
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fieldCount, setFieldCount] = useState(0);

  // --- Auth + Field Check ---
  useEffect(() => {
    const checkUser = async () => {
      const userInfo = localStorage.getItem('userInfo');

      if (!userInfo) {
        setUser(null);
        setFieldCount(0);
        return;
      }

      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      try {
        const config = {
          headers: { Authorization: `Bearer ${parsedUser.token}` }
        };
        // NOTE: Ensure your backend runs on this port/route
        const res = await axios.get('http://localhost:3000/api/fields', config);
        setFieldCount(res.data.length);
      } catch {
        setFieldCount(0);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const iconVariants = {
    hover: { scale: 1.2 },
    tap: { scale: 0.9 }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: -15, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.8 }
  };

  const NavItem = ({ to, icon, label }) => (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `nav-link ${isActive ? 'active-link' : ''}`
        }
      >
        <motion.div
          className="icon-container"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {icon}
        </motion.div>
        <span className="nav-tooltip">{label}</span>
      </NavLink>
    </li>
  );

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setFieldCount(0);
    navigate('/');
  };

  return (
    <>
      {/* --- Floating Action Popup --- */}
      <AnimatePresence>
        {isMenuOpen && user && (
          <div className="navbar-popup-menu">
            {/* Add Activity Button */}
            <motion.button
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.05 }}
              onClick={() => {
                setIsMenuOpen(false);
                fieldCount > 0
                  ? navigate('/add-activity')
                  : alert('Add a Field first!');
              }}
              className={`popup-btn activity-btn ${
                fieldCount === 0 ? 'disabled' : ''
              }`}
            >
              <span className="popup-label">Add Activity</span>
              <div className="popup-icon">
                <FiActivity />
              </div>
            </motion.button>

            {/* Add Field Button */}
            <motion.button
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/add-field');
              }}
              className="popup-btn field-btn"
            >
              <span className="popup-label">Add Field</span>
              <div className="popup-icon">
                <FiLayers />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* --- Navbar --- */}
      <motion.nav
        className="floating-navbar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <ul className="nav-list">
          {/* 1. HOME (only shown when logged out) */}
          {!user && <NavItem to="/" icon={<FiHome size={22} />} label="Home" />}

          {/* 2. DASHBOARD */}
          <NavItem
            to="/dashboard" // <-- CORRECTED: Links to the proper dashboard route
            icon={<FiGrid size={22} />}
            label="Dashboard"
          />

          {/* 3. FAB (only shown when logged in) */}
          {user && (
            <li className="nav-item fab-wrapper">
              <motion.button
                className={`nav-fab ${isMenuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isMenuOpen ? 45 : 0 }}
              >
                <FiPlus size={28} />
              </motion.button>
            </li>
          )}
          
          {/* 4. ABOUT US PAGE (REVERTED LINK) */}
          <NavItem 
            to="/about" // <-- REVERTED: Now links to the separate /about route
            icon={<FiInfo size={22} />} 
            label="About Us" 
          />

          {/* 5. PROFILE (User or Guest) */}
          <NavItem to="/profile" icon={<FiUser size={22} />} label="Profile" />

          {/* 6. AUTHENTICATION LINKS (only shown when logged out) */}
          {!user && (
            <>
              <NavItem
                to="/login"
                icon={<FiLogIn size={22} />}
                label="Login"
              />
              <NavItem
                to="/signup"
                icon={<FiUserPlus size={22} />}
                label="Signup"
              />
            </>
          )}
        </ul>
      </motion.nav>
    </>
  );
};

export default Navbar;