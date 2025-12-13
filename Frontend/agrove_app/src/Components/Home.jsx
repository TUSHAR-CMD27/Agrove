import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      navigate('/dashboard', { replace: true });
    } else {
      setUser(null);
    }
  }, [navigate]);

  // --- Animation Variants ---

  // 1. Parent container for the whole hero section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 }
    }
  };

  // 2. Generic items (subtitle, buttons)
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // 3. Specific variants for the Typing Title
  const titleContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5, // Wait a bit before starting typing
        staggerChildren: 0.12 // Speed of typing (0.12s per letter)
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 200 }
    }
  };

  const titleText = "Agrove";

  return (
    <div className="home-container">
      {/* Background blobs */}
      <div className="blob-layer">
        <div className="ag-blob blob-green-1"></div>
        <div className="ag-blob blob-yellow-1"></div>
        <div className="ag-blob blob-white-1"></div>
      </div>

      {/* Hero Content */}
      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* TYPING ANIMATION TITLE */}
        <motion.h1 
          className="hero-title"
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {titleText.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants}>
              {char}
            </motion.span>
          ))}
          {/* Animate the dot last */}
          <motion.span variants={letterVariants} className="accent-dot">.</motion.span>
        </motion.h1>
        
        <motion.h2 variants={itemVariants} className="hero-subtitle">
          Cultivating the Future.
        </motion.h2>
        
        <motion.p variants={itemVariants} className="hero-description">
          Smart farm management powered by data. Maximize yields, minimize risks, and grow sustainably.
        </motion.p>

        <motion.div variants={itemVariants} className="cta-group">
          <Link to="/signup" className="ag-btn ag-btn-primary">
            Get Started <FiArrowRight />
          </Link>
          <Link to="/login" className="ag-btn ag-btn-secondary">
            Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;