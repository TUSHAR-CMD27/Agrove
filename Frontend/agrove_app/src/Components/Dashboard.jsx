import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FiSun, FiLayers, FiDollarSign, FiExternalLink
} from 'react-icons/fi';
import FieldCard from '../Components/FieldCard';
import QuickNotes from '../Components/QuickNotes';
import './Dashboard.css';

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

const Dashboard = () => {
  const navigate = useNavigate();
  const dashRef = useRef();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...' });
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        return;
      }
      
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      try {
        const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
        const res = await axios.get('http://localhost:3000/api/fields', config);
        setFields(res.data);

        // Process Charts
        const cropMap = {};
        res.data.forEach(f => {
          const crop = f.currentCrop || 'Other';
          cropMap[crop] = (cropMap[crop] || 0) + (f.areaSize || 1);
        });
        setPieData(Object.keys(cropMap).map(name => ({ name, value: cropMap[name] })));
        setFinancialData(res.data.map(f => ({ name: f.fieldName, Cost: f.totalCost, Revenue: f.totalRevenue })));

        // News API
        const newsRes = await axios.get(`https://newsapi.org/v2/everything?q=agriculture+india&pageSize=4&apiKey=378da52d0e394cb3af6a80189dec13ad`);
        setNews(newsRes.data.articles);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    let ctx = gsap.context(() => {
      gsap.from(".bento-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, dashRef);
    return () => ctx.revert();
  }, [loading]);

  if (loading) return <div className="loading-screen">Loading your farm...</div>;

  // Render Logic (Handles both Logged In and Logged Out with same CSS)
  return (
    <div className="dash-container" ref={dashRef}>
      {/* Background Blobs - Always Visible */}
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-2"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        {!user ? (
          /* LOGGED OUT STATE */
          <div className="logged-out-view">
            <h1 className="user-greeting">Access <span className="highlight-name">Locked</span></h1>
            <p className="one-liner">Please log in to manage your fields and finances.</p>
            <button className="submit-act-btn" onClick={() => navigate('/login')} style={{maxWidth: '300px', margin: '2rem auto'}}>
              Return to Login
            </button>
          </div>
        ) : (
          /* LOGGED IN STATE */
          <>
            <header className="dash-header">
              <div>
                <h1 className="user-greeting">Hello, <span className="highlight-name">{user.name}</span></h1>
                <p className="one-liner">Your farm's financial pulse. 🌿</p>
              </div>
            </header>

            <div className="bento-grid">
              <div className="bento-card col-span-2 row-span-2">
                <div className="card-header"><h3>Finances</h3><FiDollarSign /></div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" hide />
                      <Tooltip contentStyle={{ background: '#000', border: '1px solid #333' }} />
                      <Area type="monotone" dataKey="Revenue" stroke="#39ff14" fill="#39ff1411" />
                      <Area type="monotone" dataKey="Cost" stroke="#ef4444" fill="#ef444411" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bento-card weather-card">
                <div className="weather-main">
                  <FiSun className="temp-icon" style={{color: '#fbbf24', fontSize: '2rem'}} />
                  <div className="weather-text">
                    <span className="temp">{weather.temp}°C</span>
                    <span className="condition">{weather.condition}</span>
                  </div>
                </div>
              </div>

              <div className="bento-card row-span-2">
                <div className="card-header"><h3>Crops</h3><FiLayers /></div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius="60%" outerRadius="80%" dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 5]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }}
                      itemStyle={{ 
      color: '#fff',                // Force White Text
      fontSize: '14px',
      fontWeight: 'bold'
    }} cursor={{ fill: 'transparent' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bento-card col-span-2 row-span-2">
                <div className="card-header"><h3>Market News</h3></div>
                <div className="news-scroll">
                  {news.map((item, i) => (
                    <div key={i} className="news-entry">
                      <p className="news-title-text">{item.title}</p>
                      <a href={item.url} target="_blank" rel="noreferrer" className="news-cta-link">
                        Read Story <FiExternalLink />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row-span-2"><QuickNotes /></div>
            </div>

            <section className="fields-section-container">
              <h2 className="section-title">My Fields</h2>
              <div className="fields-grid-display">
                {fields.map(field => (
                  <FieldCard key={field._id} field={field} onClick={(id) => navigate(`/field/${id}`)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;