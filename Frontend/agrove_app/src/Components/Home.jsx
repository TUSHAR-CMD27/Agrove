import React, { useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight } from 'react-icons/fi';
import './Home.css';

// Register plugins globally
gsap.registerPlugin(ScrollTrigger);

// --- DATA CONSTANTS ---
const stats = [
  { value: '1500+', label: 'Registered Farms' },
  { value: '50K+', label: 'Acres Managed' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '18', label: 'Crops Supported' },
];

const testimonials = [
  {
    name: 'Ramesh Patil',
    location: 'Maharashtra, IN',
    feedback: "Agrove transformed how I manage my cotton fields. The task logging and tailored advice are spot-on.",
  },
  {
    name: 'Viraj Gupta',
    location: 'Uttar Pradesh, IN',
    feedback: "The yield analytics helped me identify underperforming areas instantly. It's truly a practical tool.",
  },
  {
    name: 'Sayali Mane',
    location: 'Maharashtra, IN',
    feedback: "Simple, clean interface. I use it directly on my tablet in the field. Essential for my cocoa harvest.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const mainRef = useRef(); // Scope for all GSAP animations

  // Auth Check
  useLayoutEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // --- MASTER ANIMATION LOGIC ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // ===================================
      // 1. HERO ANIMATIONS (On Load)
      // ===================================
      const tl = gsap.timeline();

      // Blob Entry
      tl.fromTo(".blob-hero", 
        { opacity: 0, scale: 0.5 },
        { opacity: 0.5, scale: 1, duration: 2, ease: "power3.out", stagger: 0.2 }
      );

      // Hero Text Stagger
      tl.fromTo(".hero-char", 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)", stagger: 0.05 },
        "-=1.5"
      );

      // Dot Bounce
      tl.fromTo(".accent-dot",
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" },
        "-=0.5"
      );

      // Subtitle & Desc
      tl.fromTo([".hero-subtitle", ".hero-description"],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
        "-=0.8"
      );

      // Buttons
      tl.fromTo(".ag-btn",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
        "-=0.4"
      );

      // ===================================
      // 2. SCROLL ANIMATIONS (About Section)
      // ===================================
      
      // Reveal "Cultivating Trust" Title
      gsap.fromTo(".section-title", 
        { y: 50, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { 
          y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", 
          duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: ".stats-section", start: "top 80%" }
        }
      );

      // Stagger Stats Cards
      gsap.fromTo(".stat-item", 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".stats-grid", start: "top 85%" }
        }
      );

      // Stagger Testimonials
      gsap.fromTo(".testimonial-card",
        { y: 100, opacity: 0, rotationX: 10 },
        {
          y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.2, ease: "power3.out",
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 75%",
            toggleActions: "play none none reverse", // Replays when scrolling back up
          }
        }
      );

      // ===================================
      // 3. CONTINUOUS BLOB MOVEMENT
      // ===================================
      gsap.to(".blob", {
        y: "60px",
        x: "20px",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 3, from: "random" }
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  const titleText = "Agrove";

  return (
    <div ref={mainRef} className="landing-wrapper">
      
      {/* ------------------------------------------------ */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------ */}
      <section className="hero-section">
        {/* Massive Hero Blobs */}
        <div className="blob-layer">
          <div className="blob blob-hero blob-green-1"></div>
          <div className="blob blob-hero blob-yellow-1"></div>
          <div className="blob blob-hero blob-white-1"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            {titleText.split("").map((char, index) => (
              <span key={index} className="hero-char" style={{ display: 'inline-block' }}>
                {char}
              </span>
            ))}
            <span className="accent-dot" style={{ display: 'inline-block' }}>.</span>
          </h1>
          
          <h2 className="hero-subtitle">Cultivating the Future.</h2>
          
          <p className="hero-description">
            Smart farm management powered by data. Maximize yields, minimize risks, and grow sustainably.
          </p>

          <div className="cta-group">
            <Link to="/signup" className="ag-btn ag-btn-primary">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className="ag-btn ag-btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* STATS SECTION */}
      {/* ------------------------------------------------ */}
      <section className="stats-section">
        {/* Lower Section Blobs */}
        <div className="blob blob-lower blob-green-2"></div>

        <div className="content-container">
          <h2 className="section-title">Cultivating Trust</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card stat-item">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* TESTIMONIALS SECTION */}
      {/* ------------------------------------------------ */}
      <section className="testimonials-section">
        <div className="blob blob-lower blob-white-2"></div>
        
        <div className="content-container">
          <h2 className="section-title">Farmer Stories</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, index) => (
              <div key={index} className="glass-card testimonial-card">
                <div className="quote-icon">“</div>
                <p className="testimonial-quote">{t.feedback}</p>
                <div className="testimonial-source">
                  <div className="source-line"></div>
                  <p><strong>{t.name}</strong>, {t.location}</p>
                </div>
                <div className="card-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* FOOTER */}
      {/* ------------------------------------------------ */}
      <footer className="landing-footer">
        <p>Built for the future of farming. &copy; 2025 Agrove.</p>
      </footer>

    </div>
  );
};

export default Home;