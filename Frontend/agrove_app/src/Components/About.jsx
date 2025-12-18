import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

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

const About = () => {
  const comp = useRef(); 

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Section Title Reveal
      gsap.fromTo(".section-title", 
        { y: 50, opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { 
          y: 0, opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", 
          duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: ".about-stats", start: "top 85%" }
        }
      );

      // 2. Stats Cards Stagger
      gsap.fromTo(".stat-item", 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: ".stats-container", start: "top 85%" }
        }
      );

      // 3. Blob Floating (About Section Specific)
      gsap.to(".blob-about", {
        y: "40px",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 2, from: "random" }
      });

      // 4. Testimonials Stagger
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
      {/* Background Blobs (Specific to About) */}
      <div className="blob blob-about blob-green-about"></div>
      <div className="blob blob-about blob-white-about"></div>

      <div className="content-wrapper">
        <section className="about-stats">
          <h2 className="section-title">Cultivating Trust</h2>
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
          <h2 className="section-title">Farmer Stories</h2>
          <div className="testimonials-container">
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
        </section>

        <footer className="about-footer">
          <p>Built for the future of farming. &copy; 2025 Agrove.</p>
        </footer>
      </div>
    </div>
  );
};

export default About;