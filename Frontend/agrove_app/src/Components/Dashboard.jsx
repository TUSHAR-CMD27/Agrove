import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiArrowRight, FiLock, FiSun, FiCloudRain, FiTrendingUp, FiLayers } from 'react-icons/fi';
import FieldCard from '../Components/FieldCard';
import './Dashboard.css';

// --- Mock Data for Static Charts ---
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

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New States for Real Data
  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);

  // --- 1. Auth & Data Fetch Logic ---
  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        try {
          // Fetch Real Fields
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          const res = await axios.get('http://localhost:3000/api/fields', config);
          setFields(res.data);

          // Calculate Pie Chart Data (Crop Distribution)
          const cropMap = {};
          res.data.forEach(field => {
            const crop = field.currentCrop || 'Unknown';
            cropMap[crop] = (cropMap[crop] || 0) + (field.areaSize || 1);
          });
          
          const chartData = Object.keys(cropMap).map(crop => ({
            name: crop,
            value: cropMap[crop]
          }));
          setPieData(chartData);

        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        }
      }
      setLoading(false);
    };

    checkUserAndFetch();
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

        {/* --- GRID LAYOUT --- */}
        <div className="bento-grid">
          
          {/* 1. YIELD CHART (Original) */}
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

          {/* 2. CROP DISTRIBUTION PIE CHART (New) */}
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
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                  No crops added yet.
                </div>
              )}
            </div>
          </motion.div>

          {/* 3. WEATHER CARD (Original) */}
          <motion.div 
            className="bento-card weather-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
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

          {/* 4. NEWS CARD (Original) */}
          <motion.div 
            className="bento-card row-span-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
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
              <div className="infotainment-box">
                <h4>Did you know?</h4>
                <p>Earthworms can consume their own weight in soil every day!</p>
              </div>
            </div>
          </motion.div>

          {/* 5. AD BANNER (Fixed Animation) */}
          <motion.div 
            className="bento-card ad-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
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
        {/* End of Bento Grid */}

        {/* --- NEW SECTION: MY FIELDS LIST --- */}
        <div className="fields-section-container mt-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#39ff14] pl-3">My Fields</h2>
          
          {fields.length === 0 ? (
            <div className="empty-fields-state text-center py-10 bg-[#111] rounded-2xl border border-dashed border-gray-700">
              <p className="text-gray-400 mb-4">You haven't added any plots yet.</p>
              <button onClick={() => navigate('/add-field')} className="dash-btn-primary">
                Add Your First Field
              </button>
            </div>
          ) : (
            <div className="fields-grid-display">
              {fields.map(field => (
                <FieldCard 
                  key={field._id} 
                  field={field} 
                  onClick={(id) => navigate(`/field/${id}`)} 
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;