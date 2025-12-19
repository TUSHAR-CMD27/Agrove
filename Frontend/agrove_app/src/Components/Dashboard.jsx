import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FiArrowRight, FiLock, FiSun, FiCloudRain, FiLayers,
  FiDollarSign, FiMapPin, FiExternalLink, FiBriefcase
} from 'react-icons/fi';
import FieldCard from '../Components/FieldCard';
import QuickNotes from '../Components/QuickNotes';
import './Dashboard.css';

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

// Fallback data in case the API fails
const FALLBACK_SCHEMES = [
  { title: "PM Kisan Samman Nidhi Yojana", url: "https://pmkisan.gov.in/" },
  { title: "Pradhan Mantri Fasal Bima Yojana", url: "https://pmfby.gov.in/" },
  { title: "Soil Health Card Scheme", url: "https://soilhealth.dac.gov.in/" }
];

const getWeatherDescription = (code) => {
  const mapping = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
    55: "Dense Drizzle", 61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers", 95: "Thunderstorm",
  };
  return mapping[code] || "Clear";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dashRef = useRef();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [financialData, setFinancialData] = useState([]);

  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', location: 'Locating...' });
  const [news, setNews] = useState([]);
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');

      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);

        // A. Field Data Fetch
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

        // B. Weather Logic (Open-Meteo)
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
                const wRes = await axios.get(url);
                const current = wRes.data.current;
                setWeather({
                  temp: Math.round(current.temperature_2m),
                  condition: getWeatherDescription(current.weather_code),
                  location: 'Your Location'
                });
              } catch (e) { setWeather(prev => ({ ...prev, condition: "Offline" })); }
            },
            () => setWeather(prev => ({ ...prev, condition: "Location Denied" }))
          );
        }

        // C. News & Schemes Logic
        const API_KEY = '378da52d0e394cb3af6a80189dec13ad';
        const DATA_GOV_KEY = "579b464db66ec23bdd000001889912a7c0844e435d230832e17f993d"; // ✅ Actual Key Applied

        if (API_KEY) {
          try {
            const newsRes = await axios.get(`https://newsapi.org/v2/everything?q=agriculture+market+price+india&language=en&sortBy=publishedAt&apiKey=${API_KEY}`);
            setNews(newsRes.data.articles.slice(0, 4));
          } catch (err) { console.warn("News fetch failed."); }
        }

        if (DATA_GOV_KEY) {
          try {
            const schemeRes = await axios.get(
              `https://data.gov.in/api/datastore/resource.json?resource_id=6aee3f1e-bc6b-4b2d-9b91-4b9a0d6c5f6a&api-key=${DATA_GOV_KEY}&limit=5`
            );
            const formatted = schemeRes.data.records.map(s => ({
              title: s.scheme_name || s.name || "Government Scheme",
              url: s.website || "https://www.india.gov.in/topics/agriculture"
            }));
            setSchemes(formatted);
          } catch (err) {
            console.warn("Scheme API failed, using fallbacks.");
            setSchemes(FALLBACK_SCHEMES);
          }
        }
      }
      setLoading(false);
    };
    checkUserAndFetch();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".dash-blob", { opacity: 0, scale: 0.8 }, { opacity: 0.3, scale: 1, duration: 1.5, ease: "power3.out" });
      tl.fromTo([".dash-header", ".bento-card", ".fields-section-container"], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }, "-=1.0");
    }, dashRef);
    return () => ctx.revert();
  }, [loading]);

  if (!loading && !user) return <div className="dash-container locked-mode"><h2>LOGIN TO CONTINUE</h2></div>;

  return (
    <div className="dash-container" ref={dashRef}>
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-2"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        <header className="dash-header">
          <div>
            <h1 className="user-greeting">Welcome, <span className="highlight-name">{user?.name}</span></h1>
            <p className="one-liner">Your farm's financial pulse. 🌿</p>
          </div>
          <div className="date-badge">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        </header>

        <div className="bento-grid">
          {/* Charts */}
          <div className="bento-card col-span-2 row-span-2">
            <div className="card-header"><h3>Profitability Analysis</h3><FiDollarSign className="card-icon" /></div>
            <div className="chart-wrapper">
              {financialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#39ff14" fill="#39ff1433" />
                    <Area type="monotone" dataKey="Cost" stroke="#ef4444" fill="#ef444433" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="empty-chart-msg">Add fields to see financial trends.</div>}
            </div>
          </div>


          <div className="bento-card row-span-2">
            <div className="card-header">
              <h3>Crop Distribution</h3>
              <FiLayers className="card-icon" />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', borderRadius: '12px', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  {/* Added Legend to show labels like "Banana", "Rice" as seen in your screenshot */}
                  <Legend verticalAlign="bottom" height={36} iconType="rect" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="row-span-2"><QuickNotes /></div>

          {/* --- Market News Card --- */}
          <div className="bento-card row-span-2 news-card">
            <div className="card-header"><h3>Market Trends</h3><div className="live-indicator"><span className="live-dot"></span><span className="live-text">LIVE</span></div></div>
            <div className="news-scroll">
              {news.length > 0 ? news.map((item, index) => (
                <div key={index} className="news-entry">
                  <p className="news-title-text">{item.title}</p>
                  <div className="news-actions">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-cta-link">{item.source?.name || 'View Source'} <FiExternalLink size={12} /></a>
                    <span className="news-timestamp">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : <p className="loading-text">Fetching latest trends...</p>}
            </div>
          </div>

          {/* --- Government Schemes Card --- */}
          <div className="bento-card row-span-2 schemes-card">
            <div className="card-header"><h3>Govt. Schemes</h3><FiBriefcase className="header-icon-gold" /></div>
            <div className="news-scroll">
              {schemes.length > 0 ? schemes.map((item, index) => (
                <div key={index} className="news-entry scheme-entry">
                  <p className="news-title-text">{item.title}</p>
                  <div className="news-actions">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-cta-link scheme-link">Enroll in Portal <FiExternalLink size={12} /></a>
                    <span className="scheme-badge">Official</span>
                  </div>
                </div>
              )) : <p className="loading-text">Searching for active schemes...</p>}
            </div>
          </div>

          {/* Weather Card */}
          <div className="bento-card weather-card">
            <div className="weather-main">
              <div className="weather-icon-wrapper">

                  <FiSun className="weather-icon sun" style={{ color: '#fbbf24', fontSize: '2.5rem' }} />
                    </div>
                    <div className="weather-text">
                      <span className="temp">{weather.temp}°C</span>
                      <span className="condition">{weather.condition}</span>
                    </div>
                  </div>
                  <div className="weather-details">
                    <div className="weather-detail-item">
                      <FiCloudRain /> <span>Local Weather</span>
                    </div>
                    <div className="weather-detail-item">
                      <FiMapPin /> <span>{weather.location}</span>
                    </div>
                  </div>
                </div>
              </div>

        <div className="fields-section-container mt-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#39ff14] pl-3">My Fields</h2>
          <div className="fields-grid-display">
            {fields.map(field => <FieldCard key={field._id} field={field} onClick={(id) => navigate(`/field/${id}`)} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;            