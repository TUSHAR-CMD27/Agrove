import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './Home.css';

// 1. IMPORT THE ABOUT COMPONENT
import About from './About.jsx'; 
// NOTE: Adjust the path if your About component is located elsewhere

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

  // --- Animation Variants --- (Unchanged)
  // ... (containerVariants, itemVariants, titleContainerVariants, letterVariants remain the same)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const titleContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.12
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
    // 3. REMOVE the closing </div> here. The Home component now wraps the Hero + About section
    <div className="landing-page-wrapper">
      
      {/* ------------------------------------------------ */}
      {/* SECTION 1: HERO (Your existing code) */}
      {/* ------------------------------------------------ */}
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

      {/* ------------------------------------------------ */}
      {/* SECTION 2: ABOUT (NEW INCLUSION) */}
      {/* ------------------------------------------------ */}
      <section id="about-us-section">
        <About />
      </section>
      
    </div> // Closing tag for the main wrapper
  );
};

export default Home;