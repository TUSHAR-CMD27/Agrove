import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FiSun, FiLayers, FiDollarSign, FiExternalLink, FiBriefcase, FiMapPin, FiPlus, FiDownload
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import FieldCard from '../Components/FieldCard';
import QuickNotes from '../Components/QuickNotes';

import './Dashboard.css';

const PIE_COLORS = ['#39ff14', '#2563eb', '#fbbf24', '#ef4444', '#a855f7'];

const FALLBACK_SCHEMES = [
  { title: "PM Kisan Samman Nidhi Yojana", url: "https://pmkisan.gov.in/" },
  { title: "Pradhan Mantri Fasal Bima Yojana", url: "https://pmfby.gov.in/" },
  { title: "Soil Health Card Scheme", url: "https://soilhealth.dac.gov.in/" }
];

const getWeatherDescription = (code) => {
  const mapping = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 61: "Slight Rain",
    63: "Moderate Rain", 80: "Slight Showers", 95: "Thunderstorm",
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
  const [weather, setWeather] = useState({ temp: '--', condition: 'Clear', location: 'Dombivli' });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        return navigate('/login');
      }

      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      try {
        const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };

        // Fetch Fields
        const res = await axios.get('http://localhost:3000/api/fields', config);
        setFields(res.data);
        const cropMap = {};
        res.data.forEach(f => {
          const crop = f.currentCrop || 'Other';
          cropMap[crop] = (cropMap[crop] || 0) + (f.areaSize || 1);
        });
        setPieData(Object.keys(cropMap).map(name => ({ name, value: cropMap[name] })));
        setFinancialData(res.data.map(f => ({ name: f.fieldName, Cost: f.totalCost, Revenue: f.totalRevenue })));

        // Fetch report for download
        const reportRes = await axios.get('http://localhost:3000/api/fields/report', config);
        setReport(reportRes.data);

        // Weather & Location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
              const wRes = await axios.get(wUrl);
              const gUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
              const gRes = await axios.get(gUrl);
              const addr = gRes.data.address;
              const cityName = addr.city || addr.town || addr.village || addr.suburb || 'Dombivli';

              setWeather({
                temp: Math.round(wRes.data.current.temperature_2m),
                condition: getWeatherDescription(wRes.data.current.weather_code),
                location: cityName
              });
            } catch (e) { console.warn("Location error"); }
          });
        }

        // News
        const fetchNews = async () => {
          try {
            const rssUrl = encodeURIComponent('https://krishijagran.com/rss/market-news/');
            const data = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`).then(r => r.json());
            if (data.status === 'ok' && data.items.length > 0) {
              setNews(data.items.slice(0, 5).map(item => ({ title: item.title, link: item.link, category: "Market" })));
              setNewsLoading(false);
              return;
            }
          } catch (err) {}
          setNews([
            { title: "Today's Mandi Price (Official Agmarknet)", link: "https://agmarknet.gov.in/", category: "Live Market" },
            { title: "Weekly Crop Advisory for Farmers (ICAR)", link: "https://icar.org.in/", category: "Seasonal" },
            { title: "Daily Agriculture News Portal", link: "https://krishijagran.com/", category: "Agri-News" },
            { title: "Check Latest Weather Alerts", link: "https://mausam.imd.gov.in/", category: "Mausam" }
          ]);
          setNewsLoading(false);
        };
        fetchNews();

        // Govt Schemes
        const fetchSchemes = async () => {
          try {
            const target = `https://data.gov.in/api/datastore/resource.json?resource_id=6aee3f1e-bc6b-4b2d-9b91-4b9a0d6c5f6a&api-key=579b464db66ec23bdd000001889912a7c0844e435d230832e17f993d&limit=5`;
            const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
            const res = await axios.get(proxy);
            const parsed = JSON.parse(res.data.contents);
            setSchemes(parsed.records.map(s => ({ title: s.scheme_name || "Agri Scheme", url: "https://www.india.gov.in/" })));
          } catch (err) { setSchemes(FALLBACK_SCHEMES); }
        };
        fetchSchemes();

      } catch (err) {
        console.error(err);
        // If the token is missing/invalid, force re-login so the user gets a fresh JWT
        if (err?.response?.status === 401) {
          localStorage.removeItem('userInfo');
          return navigate('/login');
        }
      }
      setLoading(false);
    };
    checkUserAndFetch();
  }, [navigate]);

  // Delete field
  const handleDeleteField = async (fieldId, fieldName) => {
    if (window.confirm(`Permanently delete ${fieldName}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.patch(`http://localhost:3000/api/fields/${fieldId}/delete`, {}, config);
        setFields(fields.filter(f => f._id !== fieldId));
      } catch (e) { alert("Failed to delete field."); }
    }
  };

  // Animate cards
  useLayoutEffect(() => {
    if (loading) return;
    let ctx = gsap.context(() => {
      gsap.from(".bento-card", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" });
    }, dashRef);
    return () => ctx.revert();
  }, [loading]);

  // Download report function
  const downloadReport = () => {
    if (!report) return;
    const summarySheet = XLSX.utils.json_to_sheet([report.reportSummary]);
    const fieldsSheet = XLSX.utils.json_to_sheet(report.fieldReports, { header: ["fieldName","areaSize","soilType","currentCrop","totalCost","totalRevenue","netProfit"] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, fieldsSheet, "Fields");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "User_Report.xlsx");
  };

  if (loading) return <div className="loading-screen">Updating Farm Insights...</div>;

  return (
    <div className="dash-container" ref={dashRef}>
      <div className="dash-content">
        <header className="dash-header">
          <div>
            <h1 className="user-greeting">Hello, <span className="highlight-name">{user?.name}</span></h1>
            <p className="one-liner">Market rates and seasonal crop updates. 🌿</p>
          </div>
        </header>

        <div className="bento-grid">
          {/* Profitability Analysis */}
          <div className="bento-card col-span-2 row-span-2">
            <div className="card-header"><h3>Profitability Analysis</h3><FiDollarSign /></div>
            <div className="chart-wrapper">
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
            </div>
          </div>

          {/* Crop Distribution */}
          <div className="bento-card row-span-2">
            <div className="card-header"><h3>Crops Distribution</h3><FiLayers /></div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius="60%" outerRadius="80%" dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 5]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weather Card */}
          <div className="bento-card weather-card">
            <div className="weather-main">
              <FiSun className="weather-icon sun" style={{ color: '#fbbf24', fontSize: '2.5rem' }} />
              <div className="weather-text">
                <span className="temp">{weather.temp}°C</span>
                <span className="condition">{weather.condition}</span>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-detail-item"><FiMapPin /> <span>{weather.location}</span></div>
            </div>
          </div>

          {/* Market News */}
          <div className="bento-card row-span-2 news-card">
            <div className="card-header">
              <h3>Market & Crop News</h3>
              <div className="live-indicator"><span className="live-dot"></span><span className="live-text">LIVE</span></div>
            </div>
            <div className="news-scroll">
              {newsLoading ? <p>Loading news...</p> : news.map((item, i) => (
                <div key={i} className="news-entry">
                  <span className="news-tag" style={{fontSize: '0.65rem', color: '#39ff14', fontWeight: 'bold'}}>[{item.category}]</span>
                  <p className="news-title-text">{item.title}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="news-cta-link">View Details <FiExternalLink /></a>
                </div>
              ))}
            </div>
          </div>

          {/* Govt Schemes */}
          <div className="bento-card row-span-2 schemes-card">
            <div className="card-header"><h3>Govt. Schemes</h3><FiBriefcase /></div>
            <div className="news-scroll">
              {schemes.map((item, i) => (
                <div key={i} className="news-entry">
                  <p className="news-title-text">{item.title}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="news-cta-link">Apply <FiExternalLink /></a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <QuickNotes />
          </div>
        </div>

        {/* My Managed Fields */}
        <section className="fields-section-container">
          <h2 className="section-title">My Managed Fields</h2>
          <div className="fields-grid-display">
            {fields.map(field => (
              <FieldCard 
                key={field._id} 
                field={field} 
                onDelete={handleDeleteField}
                onClick={(id) => navigate(`/field/${id}`)} 
              />
            ))}
          </div>
        </section>

        {/* FAB Buttons */}
        <div className="fab-container">
          {/* Download Report FAB */}
          <button className="fab-btn download-btn-fab" onClick={downloadReport}>
            <FiDownload />
          </button>

          {/* Add Field FAB */}
          <button className="fab-btn plus-btn" onClick={() => navigate('/add-field')}>
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
