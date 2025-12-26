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
  FiActivity
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fieldCount, setFieldCount] = useState(0);

  // --- 1. Auth & Field Sync Logic ---
  const checkUser = async () => {
    const userInfo = localStorage.getItem('userInfo');

    if (!userInfo) {
      setUser(null);
      setFieldCount(0);
      return;
    }

    try {
      const parsedUser = JSON.parse(userInfo);
      
      if (!parsedUser.token) {
        setUser(null);
        return;
      }
      
      setUser(parsedUser);

      const config = {
        headers: { Authorization: `Bearer ${parsedUser.token}` }
      };
      const res = await axios.get('http://localhost:3000/api/fields', config);
      setFieldCount(res.data.length);
    } catch (error) {
      console.error("Navbar sync error:", error);
      setFieldCount(0);
    }
  };

  useEffect(() => {
    checkUser();
    window.addEventListener('storage', checkUser);
    const interval = setInterval(checkUser, 2000);
    
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  // --- 2. Interaction Handlers ---
  const toggleMenu = () => {
    if (!user) {
      alert("Please login to use this feature");
      return;
    }
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => setIsMenuOpen(false);

  // --- 3. Animation Variants ---
  const iconVariants = {
    hover: { scale: 1.2 },
    tap: { scale: 0.9 }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.8 },
    visible: { opacity: 1, y: 15, scale: 1 }, // Moves down from the button
    exit: { opacity: 0, y: -10, scale: 0.8 }
  };

  const NavItem = ({ to, icon, label }) => (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`}
        onClick={closeMenu}
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

  return (
    <>
      <motion.nav
        className="floating-navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <ul className="nav-list">
          <h1 className="ayo" onClick={() => { closeMenu(); navigate('/'); }}>
            AGROVE
          </h1>

          {!user && <NavItem to="/" icon={<FiHome size={22} />} label="Home" />}

          <NavItem to="/dashboard" icon={<FiGrid size={22} />} label="Dashboard" />

          {/* Plus Button (FAB) Wrapper */}
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

              {/* POPUP MENU IS NOW ANCHORED INSIDE THE FAB-WRAPPER */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    className="navbar-popup-menu"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                  >
                    <button
                      onClick={() => {
                        closeMenu();
                        fieldCount > 0 ? navigate('/add-activity') : alert('Add a Field first!');
                      }}
                      className={`popup-btn activity-btn ${fieldCount === 0 ? 'disabled' : ''}`}
                    >
                      <div className="popup-icon"><FiActivity /></div>
                      <span className="popup-label">Add Activity</span>
                    </button>

                    <button
                      onClick={() => {
                        closeMenu();
                        navigate('/add-field');
                      }}
                      className="popup-btn field-btn"
                    >
                      <div className="popup-icon"><FiLayers /></div>
                      <span className="popup-label">Add Field</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )}

          <NavItem to="/profile" icon={<FiUser size={22} />} label="Profile" />

          {!user && (
            <>
              <NavItem to="/login" icon={<FiLogIn size={22} />} label="Login" />
              <NavItem to="/signup" icon={<FiUserPlus size={22} />} label="Signup" />
            </>
          )}
        </ul>
      </motion.nav>
    </>
  );
};

export default Navbar;


