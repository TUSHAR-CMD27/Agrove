import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { FiArrowRight, FiLock, FiSun, FiCloudRain, FiLayers, FiDollarSign, FiWind, FiMapPin, FiExternalLink } from 'react-icons/fi';
import FieldCard from '../Components/FieldCard';
import QuickNotes from '../Components/QuickNotes'; // ✅ Make sure this component exists
import './Dashboard.css';

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

// Fallback News Data
const FALLBACK_NEWS = [
  { title: "Maharashtra govt announces new subsidy for drip irrigation projects.", url: "#", publishedAt: "2h ago" },
  { title: "Monsoon tracking: IMD predicts heavy rainfall in Konkan region.", url: "#", publishedAt: "5h ago" },
  { title: "Onion prices stabilize at Lasalgaon market after export ban lift.", url: "#", publishedAt: "1d ago" },
  { title: "New solar pump scheme launched for farmers in Vidarbha.", url: "#", publishedAt: "2d ago" },
];

const getWeatherDescription = (code) => {
  if (code === 0) return "Clear Sky";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dashRef = useRef(); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...', location: 'Locating...' });
  const [news, setNews] = useState(FALLBACK_NEWS);

  // --- 1. Master Data Fetching ---
  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        // A. Backend Data
        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const res = await axios.get('http://localhost:3000/api/fields', config);
          setFields(res.data);

          const cropMap = {};
          res.data.forEach(field => {
            const crop = field.currentCrop || 'Unknown';
            cropMap[crop] = (cropMap[crop] || 0) + (field.areaSize || 1);
          });
          setPieData(Object.keys(cropMap).map(crop => ({ name: crop, value: cropMap[crop] })));

          const financeChart = res.data.map(field => ({
            name: field.fieldName, Cost: field.totalCost, Revenue: field.totalRevenue
          }));
          setFinancialData(financeChart);
        } catch (err) { console.error("Data fetch error", err); }

        // B. Real Weather
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const wRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`);
              const current = wRes.data.current;
              setWeather({
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                condition: getWeatherDescription(current.weather_code),
                windSpeed: current.wind_speed_10m,
                location: 'Local Weather'
              });
            } catch (e) { setWeather(prev => ({ ...prev, condition: "Unavailable" })); }
          });
        }

        // C. Real News
        const NEWS_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with valid key if available
        if (NEWS_API_KEY !== 'YOUR_API_KEY_HERE') {
          try {
            const newsRes = await axios.get(`https://newsapi.org/v2/everything?q=agriculture+maharashtra+farming&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`);
            if (newsRes.data.articles.length > 0) {
              setNews(newsRes.data.articles.slice(0, 5));
            }
          } catch (err) { console.warn("News fetch failed, using fallback."); }
        }
      }
      setLoading(false);
    };
    checkUserAndFetch();
  }, []);

  // --- 2. Optimized Entry Animation (No Loop) ---
  useLayoutEffect(() => {
    if (loading) return; 

    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Fade in Blobs (Static after entry)
      tl.fromTo(".dash-blob", 
        { opacity: 0, scale: 0.8 },
        { opacity: 0.3, scale: 1, duration: 1.5, ease: "power3.out" }
      );

      // Stagger UI Elements
      tl.fromTo([".dash-header", ".bento-card", ".fields-section-container"],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" },
        "-=1.0"
      );
    }, dashRef);

    return () => ctx.revert();
  }, [loading]); 

  if (!loading && !user) {
    return (
      <div className="dash-container locked-mode">
        <div className="access-denied-card">
          <FiLock size={40} />
          <h2>LOGIN TO CONTINUE</h2>
          <Link to="/login" className="dash-btn-primary">Go to Login <FiArrowRight /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-container" ref={dashRef}>
      {/* Static Background Blobs */}
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-2"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="user-greeting">Hello, <span className="highlight-name">{user?.name}</span></h1>
            <p className="one-liner">Your farm's financial pulse. 🌿</p>
          </div>
          <div className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </header>

        {/* --- Bento Grid --- */}
        <div className="bento-grid">
          
          {/* 1. Profitability Chart */}
          <div className="bento-card col-span-2 row-span-2">
            <div className="card-header">
              <h3>Profitability Analysis</h3>
              <FiDollarSign className="card-icon" />
            </div>
            <div className="chart-wrapper">
              {financialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                    <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }} 
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="Revenue" stroke="#39ff14" fillOpacity={1} fill="url(#colorRevenue)" name="Returns (₹)" />
                    <Area type="monotone" dataKey="Cost" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" name="Invested (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-msg">Add fields to see financial trends.</div>
              )}
            </div>
          </div>

          {/* 2. Crop Distribution */}
          <div className="bento-card row-span-2">
            <div className="card-header">
              <h3>Crop Distribution</h3>
              <FiLayers className="card-icon" />
            </div>
            <div className="chart-wrapper">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    {/* ✅ Tooltip Fix: White Text on Black BG */}
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }} 
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-msg">No crops added yet.</div>
              )}
            </div>
          </div>

          {/* 3. Weather Card */}
          <div className="bento-card weather-card">
            <div className="weather-main">
              <div className="weather-icon-wrapper">
                {weather.condition.includes('Rain') ? <FiCloudRain className="weather-icon rain" /> : <FiSun className="weather-icon sun" />}
              </div>
              <div className="weather-text">
                <span className="temp">{weather.temp}°C</span>
                <span className="condition">{weather.condition}</span>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-detail-item">
                <FiCloudRain className="detail-icon"/><span>{weather.humidity}% Hum</span>
              </div>
              <div className="weather-detail-item location-tag">
                <FiMapPin className="detail-icon"/><span>{weather.location}</span>
              </div>
            </div>
          </div>

          {/* ✅ 4. Quick Notes Card (New) */}
          <div className="row-span-2">
             <QuickNotes />
          </div>

          {/* 5. News Card */}
          <div className="bento-card row-span-2 news-card">
            <div className="card-header"><h3>Agri-News (MH)</h3><span className="live-dot"></span></div>
            <div className="news-scroll">
              {news.map((item, index) => (
                <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="news-item">
                  <p className="news-title">{item.title}</p>
                  <div className="news-meta">
                    <span className="news-time">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <FiExternalLink size={12} color="#666" />
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div> 

        {/* --- Fields List --- */}
        <div className="fields-section-container mt-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#39ff14] pl-3">My Fields</h2>
          {fields.length === 0 ? (
            <div className="empty-fields-state">
              <p>You haven't added any plots yet.</p>
              <button onClick={() => navigate('/add-field')} className="dash-btn-primary">Add Your First Field</button>
            </div>
          ) : (
            <div className="fields-grid-display">
              {fields.map(field => (
                <FieldCard key={field._id} field={field} onClick={(id) => navigate(`/field/${id}`)} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
