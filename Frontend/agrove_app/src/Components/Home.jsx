// Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';
import { FiArrowRight } from 'react-icons/fi';

const Home = () => {
  // Animation variants for staggered text entry
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
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="home-container">
      {/* The Background Blob Layer */}
      <div className="blob-layer">
        <div className="ag-blob blob-green-1"></div>
        <div className="ag-blob blob-yellow-1"></div>
        <div className="ag-blob blob-white-1"></div>
      </div>

      {/* The Content Layer */}
      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="hero-title">
          Agrove<span className="accent-dot">.</span>
        </motion.h1>
        
        <motion.h2 variants={itemVariants} className="hero-subtitle">
          Cultivating the Future.
        </motion.h2>
        
        <motion.p variants={itemVariants} className="hero-description">
          Smart farm management powered by data. maximize yields, minimize risks, and grow sustainably.
        </motion.p>

        <motion.div variants={itemVariants} className="cta-group">
           {/* Using React Router Link for navigation */}
          <Link to="/signup" className="ag-btn ag-btn-primary">
            Get Started <FiArrowRight />
          </Link>
          <Link to="/login" className="ag-btn ag-btn-secondary">
            Login
          </Link>
        </motion.div>
      </motion.div>
       {/* NB: Navbar will be rendered outside this component in App.jsx so it floats above everything */}
    </div>
  );
};

export default Home;