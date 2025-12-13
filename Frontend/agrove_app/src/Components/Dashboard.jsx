import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { FiArrowRight, FiLock, FiSun, FiCloudRain, FiLayers, FiDollarSign } from 'react-icons/fi';
import FieldCard from '../Components/FieldCard';
import './Dashboard.css';

const newsData = [
  { id: 1, title: "Govt announces new subsidy for drip irrigation.", time: "2h ago" },
  { id: 2, title: "Monsoon expected to hit Kerala by June 1st.", time: "5h ago" },
  { id: 3, title: "Wheat prices soar as global demand increases.", time: "1d ago" },
];

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [financialData, setFinancialData] = useState([]);

  // --- 1. Auth & Data Fetch Logic ---
  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const res = await axios.get('http://localhost:3000/api/fields', config);
          setFields(res.data);

          // 1. Prepare Pie Data (Crop Distribution)
          const cropMap = {};
          res.data.forEach(field => {
            const crop = field.currentCrop || 'Unknown';
            cropMap[crop] = (cropMap[crop] || 0) + (field.areaSize || 1);
          });
          setPieData(Object.keys(cropMap).map(crop => ({ name: crop, value: cropMap[crop] })));

          // 2. Prepare Financial Data for Area Chart
          const financeChart = res.data.map(field => ({
            name: field.fieldName,
            Cost: field.totalCost,
            Revenue: field.totalRevenue
          }));
          setFinancialData(financeChart);

        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        }
      }
      setLoading(false);
    };

    checkUserAndFetch();
  }, []);

  if (!loading && !user) {
    return (
      <div className="dash-container locked-mode">
        <div className="dash-blob blob-dash-1"></div>
        <div className="dash-blob blob-dash-2"></div>
        <motion.div className="access-denied-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <FiLock size={40} />
          <h2>LOGIN TO CONTINUE</h2>
          <Link to="/login" className="dash-btn-primary">Go to Login <FiArrowRight /></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dash-container">
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        
        {/* Header */}
        <header className="dash-header">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="user-greeting">Hello, <span className="highlight-name">{user?.name}</span></h1>
            <p className="one-liner">Your farm's financial pulse. 🌿</p>
          </motion.div>
          <div className="date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </header>

        {/* --- BENTO GRID --- */}
        <div className="bento-grid">
          
          {/* ✅ 1. FINANCIAL AREA CHART (Reverted to the "Cool" style) */}
          <motion.div 
            className="bento-card col-span-2 row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header">
              <h3>Profitability Analysis</h3>
              <FiDollarSign className="card-icon" />
            </div>
            <div className="chart-wrapper">
              {financialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {/* Gradient for Revenue (Green) */}
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                      </linearGradient>
                      {/* Gradient for Cost (Red) */}
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                    <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    
                    {/* The two overlapping areas */}
                    <Area 
                      type="monotone" 
                      dataKey="Revenue" 
                      stroke="#39ff14" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Returns (₹)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Cost" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorCost)" 
                      name="Invested (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-msg">Add fields to see financial trends.</div>
              )}
            </div>
          </motion.div>

          {/* 2. CROP DISTRIBUTION */}
          <motion.div 
            className="bento-card row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header">
              <h3>Crop Distribution</h3>
              <FiLayers className="card-icon" />
            </div>
            <div className="chart-wrapper">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-msg">No crops added yet.</div>
              )}
            </div>
          </motion.div>

          {/* 3. WEATHER CARD */}
          <motion.div className="bento-card weather-card">
            <div className="weather-info">
              <FiSun className="weather-icon sun" />
              <div><span className="temp">32°C</span><span className="condition">Sunny</span></div>
            </div>
            <div className="weather-extra"><p><FiCloudRain /> Humidity: 45%</p></div>
          </motion.div>

          {/* 4. NEWS CARD */}
          <motion.div className="bento-card row-span-2">
            <div className="card-header"><h3>Agri-News</h3><span className="live-dot"></span></div>
            <div className="news-scroll">
              {newsData.map((news) => (
                <div key={news.id} className="news-item">
                  <p className="news-title">{news.title}</p>
                  <span className="news-time">{news.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div> 
        {/* End Bento Grid */}

        {/* --- MY FIELDS LIST --- */}
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