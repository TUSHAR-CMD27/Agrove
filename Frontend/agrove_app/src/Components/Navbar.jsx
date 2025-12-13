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

  // Check Login & Field Data
  useEffect(() => {
    const checkUser = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        
        // Check fields to enable/disable "Add Activity"
        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const res = await axios.get('http://localhost:3000/api/fields', config);
          setFieldCount(res.data.length);
        } catch (err) {
          console.error("Field check failed");
        }
      } else {
        setUser(null);
      }
    };
    
    // Run on mount and listen for storage changes (optional enhancement)
    checkUser();
    window.addEventListener('storage', checkUser); 
    return () => window.removeEventListener('storage', checkUser);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const iconVariants = {
    hover: { scale: 1.2 },
    tap: { scale: 0.9 }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: -15, scale: 1 }, // Moves up above navbar
    exit: { opacity: 0, y: 20, scale: 0.8 }
  };

  const NavItem = ({ to, icon, label }) => (
    <li className="nav-item">
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`}
      >
        <motion.div variants={iconVariants} whileHover="hover" whileTap="tap" className="icon-container">
          {icon}
        </motion.div>
        {/* Tooltip hidden on mobile usually, good for desktop */}
        <span className="nav-tooltip">{label}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      {/* --- The Pop-up Menu (Appears ABOVE navbar) --- */}
      <AnimatePresence>
        {isMenuOpen && user && (
          <div className="navbar-popup-menu">
            {/* Option: Add Activity */}
            <motion.button
              variants={menuVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={{ delay: 0.05 }}
              onClick={() => {
                setIsMenuOpen(false);
                fieldCount > 0 ? navigate('/add-activity') : alert("Add a Field first!");
              }}
              className={`popup-btn activity-btn ${fieldCount === 0 ? 'disabled' : ''}`}
            >
              <span className="popup-label">Add Activity</span>
              <div className="popup-icon"><FiActivity /></div>
            </motion.button>

            {/* Option: Add Field */}
            <motion.button
              variants={menuVariants}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/add-field');
              }}
              className="popup-btn field-btn"
            >
              <span className="popup-label">Add Field</span>
              <div className="popup-icon"><FiLayers /></div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* --- The Main Navbar --- */}
      <motion.nav
        className="floating-navbar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <ul className="nav-list">
          
          {/* Guest Links */}
          {!user && <NavItem to="/" icon={<FiHome size={22} />} label="Home" />}
          
          {/* Dashboard (Always visible) */}
          <NavItem to="/dashboard" icon={<FiGrid size={22} />} label="Dashboard" />

          {/* --- CENTRAL ACTION BUTTON (Logged In Only) --- */}
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

          {/* Profile (Always visible) */}
          <NavItem to="/profile" icon={<FiUser size={22} />} label="Profile" />

          {/* Guest Auth Links */}
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