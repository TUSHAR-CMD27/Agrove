import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { FiArrowRight, FiLock, FiSun, FiCloudRain, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

// Mock Data for Charts
const dataYield = [
  { name: 'Jan', yield: 4000, profit: 2400 },
  { name: 'Feb', yield: 3000, profit: 1398 },
  { name: 'Mar', yield: 2000, profit: 9800 },
  { name: 'Apr', yield: 2780, profit: 3908 },
  { name: 'May', yield: 1890, profit: 4800 },
  { name: 'Jun', yield: 2390, profit: 3800 },
];

const newsData = [
  { id: 1, title: "Govt announces new subsidy for drip irrigation.", time: "2h ago" },
  { id: 2, title: "Monsoon expected to hit Kerala by June 1st.", time: "5h ago" },
  { id: 3, title: "Wheat prices soar as global demand increases.", time: "1d ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Auth Check Logic ---
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // --- 2. Not Logged In View ---
  if (!loading && !user) {
    return (
      <div className="dash-container locked-mode">
        <div className="dash-blob blob-dash-1"></div>
        <div className="dash-blob blob-dash-2"></div>
        
        <motion.div 
          className="access-denied-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="lock-icon-wrapper">
            <FiLock size={40} />
          </div>
          <h2>LOGIN TO CONTINUE</h2>
          <p>You must be logged in to view your Farm Analytics.</p>
          <Link to="/login" className="dash-btn-primary">
            Go to Login <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- 3. Main Dashboard View (Logged In) ---
  return (
    <div className="dash-container">
      {/* Background Blobs */}
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        
        {/* Header Section */}
        <header className="dash-header">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="user-greeting">
              Hello, <span className="highlight-name">{user?.name || "Farmer"}</span>
            </h1>
            <p className="one-liner">Your farm's pulse is strong today. 🌿</p>
          </motion.div>
          <div className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          
          {/* Main Chart: Yield Analysis */}
          <motion.div 
            className="bento-card col-span-2 row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header">
              <h3>Yield Analytics</h3>
              <FiTrendingUp className="card-icon" />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataYield}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{fill: '#888'}} />
                  <YAxis stroke="#666" tick={{fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#39ff14" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Stats: Weather */}
          <motion.div 
            className="bento-card weather-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="weather-info">
              <FiSun className="weather-icon sun" />
              <div>
                <span className="temp">32°C</span>
                <span className="condition">Sunny</span>
              </div>
            </div>
            <div className="weather-extra">
              <p><FiCloudRain /> Humidity: 45%</p>
            </div>
          </motion.div>

          {/* Infotainment / News */}
          <motion.div 
            className="bento-card row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-header">
              <h3>Agri-News</h3>
              <span className="live-dot"></span>
            </div>
            <div className="news-scroll">
              {newsData.map((news) => (
                <div key={news.id} className="news-item">
                  <p className="news-title">{news.title}</p>
                  <span className="news-time">{news.time}</span>
                </div>
              ))}
              {/* Infotainment Bit */}
              <div className="infotainment-box">
                <h4>Did you know?</h4>
                <p>Earthworms can consume their own weight in soil every day!</p>
              </div>
            </div>
          </motion.div>

          {/* Ad Section */}
          <motion.div 
            className="bento-card ad-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }} /* Triggers when scrolled to */
            viewport={{ once: true, margin: "-50px" }} /* Only animates once, never hides again */
            transition={{ duration: 0.4 }}
          >
            <div className="ad-content">
              <span className="ad-badge">Sponsored</span>
              <h4>Upgrade to Agrove Pro</h4>
              <p>Get satellite imagery for your fields.</p>
              <button className="ad-btn">View Plans</button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;