// Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  // Hover animation for nav items
  const iconVariants = {
    hover: { scale: 1.2, color: 'var(--ag-green, #39ff14)' },
    tap: { scale: 0.9 }
  };

  const navItems = [
    { to: "/", icon: <FiHome size={24} />, label: "Home" },
    { to: "/dashboard", icon: <FiGrid size={24} />, label: "Dashboard" },
    // Using signup/login for demo, in real app you might swap these based on auth state
    { to: "/login", icon: <FiLogIn size={24} />, label: "Login" },
    { to: "/signup", icon: <FiUserPlus size={24} />, label: "Signup" },
    { to: "/profile", icon: <FiUser size={24} />, label: "Profile" },
  ];

  return (
    <motion.nav 
      className="floating-navbar"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
    >
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.label} className="nav-item">
            <NavLink 
              to={item.to} 
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active-link' : ''}`
              }
            >
              <motion.div
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
                className="icon-container"
              >
                {item.icon}
              </motion.div>
              {/* Optional label - usually hidden on mobile bottom navs for space */}
              {/* <span className="nav-label">{item.label}</span> */}
            </NavLink>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};

export default Navbar;