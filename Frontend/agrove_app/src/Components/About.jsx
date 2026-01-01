

import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  // 1. Destructure i18n to track language changes
  const { t, i18n } = useTranslation(); 
  const comp = useRef();

  // 2. Use useMemo to recreate the arrays ONLY when the language changes
  const stats = useMemo(() => [
    { value: '1500+', label: t('about.stats.farms') },
    { value: '50K+', label: t('about.stats.acres') },
    { value: '95%', label: t('about.stats.satisfaction') },
    { value: '18', label: t('about.stats.crops') },
  ], [t, i18n.language]); // Recalculates when i18n.language changes

  const testimonials = useMemo(() => [
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
  ], [t, i18n.language]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".section-title", 
        { y: 50, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { 
          y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", 
          duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: ".about-stats", start: "top 85%" }
        }
      );

      gsap.fromTo(".stat-item", 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".stats-container", start: "top 85%" }
        }
      );

      gsap.to(".blob-about", {
        y: "40px", duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut",
        stagger: { amount: 2, from: "random" }
      });

      gsap.fromTo(".testimonial-card",
        { y: 100, opacity: 0, rotationX: 10 },
        {
          y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.2, ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-feedback",
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-wrapper" ref={comp}>
      <div className="blob blob-about blob-green-about"></div>
      <div className="blob blob-about blob-white-about"></div>

      <div className="content-wrapper">
        <section className="about-stats">
          <h2 className="section-title">{t('about.title_trust')}</h2>
          <div className="stats-container">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card stat-item">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-feedback">
          <h2 className="section-title">{t('about.title_stories')}</h2>
          <div className="testimonials-container">
            {testimonials.map((t_item, index) => (
              <div key={index} className="glass-card testimonial-card">
                <div className="quote-icon">“</div>
                <p className="testimonial-quote">{t_item.feedback}</p>
                <div className="testimonial-source">
                  <div className="source-line"></div>
                  <p><strong>{t_item.name}</strong>, {t_item.location}</p>
                </div>
                <div className="card-shine"></div>
              </div>
            ))}
          </div>
        </section>

        <footer className="about-footer">
          <p>{t('about.footer')}</p>
        </footer>
      </div>
    </div>
  );
};

export default About;