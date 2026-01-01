import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight } from 'react-icons/fi';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t, i18n } = useTranslation(); // 2. Initialize translation
  const navigate = useNavigate();
  const mainRef = useRef();

  // --- 3. REFRESH GSAP ON LANGUAGE CHANGE ---
  // When text length changes (English to Hindi), ScrollTrigger needs to recalculate positions.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [i18n.language]);

  const stats = [
    { value: '100+', label: t('about.stats.farms') },
    { value: '20K+', label: t('about.stats.acres') },
    { value: '95%', label: t('about.stats.satisfaction') },
    { value: '18', label: t('about.stats.crops') },
  ];

  const testimonials = [
    {
      name: 'Ramesh Patil',
      location: 'Maharashtra, IN',
      feedback: t('about.testimonials.ramesh'),
    },
    {
      name: 'Viraj Gupta',
      location: 'Uttar Pradesh, IN',
      feedback: t('about.testimonials.viraj'),
    },
    {
      name: 'Sayali Mane',
      location: 'Maharashtra, IN',
      feedback: t('about.testimonials.sayali'),
    },
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.from(
        [".cards", ".cards2", ".cards3", ".cardY1",".cardY2",".cardY3"],
        { x: 10, opacity: 0, duration: 2, ease: "expo.out", stagger: 0.15, delay: 0.5 }
      );

      function float(el, x = 10, y = 10, dur = 4) {
        gsap.to(el, {
          x: gsap.utils.random(-x, x),
          y: gsap.utils.random(-y, y),
          duration: gsap.utils.random(dur - 1, dur + 1),
          ease: "sine.inOut",
          onComplete: () => float(el, x, y, dur)
        });
      }

      float(".cards");
      float(".cards2", 14, 12, 5);
      float(".cards3", 8, 8, 3.5);

      tl.fromTo(".blob-hero", { opacity: 0, scale: 0.5 }, { opacity: 0.5, scale: 1, duration: 2, ease: "power3.out", stagger: 0.2 });
      tl.fromTo(".hero-char", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)", stagger: 0.05 }, "-=1.5");
      tl.fromTo(".accent-dot", { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }, "-=0.5");
      tl.fromTo([".hero-subtitle", ".hero-description"], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" }, "-=0.8");
      tl.fromTo(".ag-btn", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" }, "-=0.4" );

      gsap.fromTo(".section-title", 
        { y: 50, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, ease: "power4.out", scrollTrigger: { trigger: ".stats-section", start: "top 80%" } }
      );

      gsap.fromTo(".stat-item", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ".stats-grid", start: "top 85%" } }
      );

      gsap.fromTo(".testimonial-card",
        { y: 100, opacity: 0, rotationX: 10 },
        { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".testimonials-grid", start: "top 75%", toggleActions: "play none none reverse" } }
      );

      gsap.to(".blob", { y: "60px", x: "20px", duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: { amount: 3, from: "random" } });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const titleText = "Agrove";

  return (
    <div ref={mainRef} className="landing-wrapper">
      <div className='decor-layer'>
        <div className='cards'></div><div className='cards2'></div><div className='cards3'></div>
        <div className='cardY1'></div><div className='cardY2'></div><div className='cardY3'></div>
      </div>

      <section className="hero-section">
        <div className="blob-layer">
          <div className="blob blob-hero blob-green-1"></div>
          <div className="blob blob-hero blob-yellow-1"></div>
          <div className="blob blob-hero blob-white-1"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            {titleText.split("").map((char, index) => (
              <span key={index} className="hero-char" style={{ display: 'inline-block' }}>{char}</span>
            ))}
            <span className="accent-dot" style={{ display: 'inline-block' }}>.</span>
          </h1>
          <h2 className="hero-subtitle">{t('auth.hero_text')}</h2>
          <p className="hero-description">{t('auth.login_description')}</p>

          <div className="cta-group">
            <Link to="/signup" className="ag-btn ag-btn-primary">
              {t('auth.create_account')} <FiArrowRight />
            </Link>
            <Link to="/login" className="ag-btn ag-btn-secondary">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="blob blob-lower blob-green-2"></div>
        <div className="content-container">
          <h2 className="section-title">{t('about.title_trust')}</h2>
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

      <section className="testimonials-section">
        <div className="blob blob-lower blob-white-2"></div>
        <div className="content-container">
          <h2 className="section-title">{t('about.title_stories')}</h2>
          <div className="testimonials-grid">
            {testimonials.map((t_data, index) => (
              <div key={index} className="glass-card testimonial-card">
                <div className="quote-icon">“</div>
                <p className="testimonial-quote">{t_data.feedback}</p>
                <div className="testimonial-source">
                  <div className="source-line"></div>
                  <p><strong>{t_data.name}</strong>, {t_data.location}</p>
                </div>
                <div className="card-shine"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>{t('about.footer')} &copy; 2026 Agrove.</p>
      </footer>
    </div>
  );
};

export default Home;