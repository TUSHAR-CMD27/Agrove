import React from 'react';
import './About.css';

// Data for the 'Trusted By' section
const stats = [
  { value: '1500+', label: 'Registered Farms' },
  { value: '50K+', label: 'Acres Managed' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '18', label: 'Crops Supported' },
];

// Dummy data for farmer testimonials
const testimonials = [
  {
    name: 'Ramesh Patil',
    location: 'Maharashtra, IN',
    feedback: "Agrove transformed how I manage my cotton fields. The task logging and tailored advice are spot-on. Highly recommended!",
  },
  {
    name: 'Sarah Chen',
    location: 'California, US',
    feedback: "The yield analytics helped me identify underperforming areas instantly. It's truly a practical tool for modern farming.",
  },
  {
    name: 'Kwame Adofo',
    location: 'Kumasi, GH',
    feedback: "Simple, clean interface. I use it directly on my tablet in the field. Essential for keeping track of my cocoa harvest.",
  },
];

const About = () => {
  return (
    <div className="about-page">
      {/* Background Blobs (for visual effect) */}
      <div className="blob blob-green-1"></div>
      <div className="blob blob-white-2"></div>
      <div className="blob blob-yellow-3"></div>

 

      <section className="about-stats">
        <h2 className="white-text">Trusted By Farmers Worldwide</h2>
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
        <h2 className="white-text">Farmer Testimonials</h2>
        <div className="testimonials-container">
          {testimonials.map((t, index) => (
            <div key={index} className="glass-card testimonial-card">
              <p className="white-text testimonial-quote">"{t.feedback}"</p>
              <p className="white-text testimonial-source">
                — **{t.name}**, {t.location}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="about-footer">
        <p className="white-text">Join the Agrove community and cultivate success.</p>
      </footer>
    </div>
  );
};

export default About;