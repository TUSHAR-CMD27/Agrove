import React, { useEffect, useState, useLayoutEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import Bgimg from '../assets/bg.png';
import { useTranslation } from 'react-i18next'; // 1. Added i18n
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

const Dashboard = () => {
  const { t, i18n } = useTranslation(); // 2. Initialize
  const navigate = useNavigate();
  const dashRef = useRef();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [weather, setWeather] = useState({ temp: '--', condition: '...', location: '...' });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [report, setReport] = useState(null);

  // 3. Translated Weather helper
  const getWeatherDescription = (code) => {
    const mapping = {
      0: t(' clear'), 1: t(' clear'), 2: t(' partly cloudy'), 3: t(' overcast'),
      45: t(' foggy'), 48: t(' rime fog'), 51: t(' light drizzle'), 61: t(' slight rain'),
      63: t(' moderate rain'), 80: t(' slight showers'), 95: t(' thunderstorm'),
    };
    return mapping[code] || t('weather.clear');
  };

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
        
        // Translate chart labels dynamically
        setFinancialData(res.data.map(f => ({ 
            name: f.fieldName, 
            [t('dash.revenue')]: f.totalRevenue, 
            [t('dash.cost')]: f.totalCost 
        })));

        const reportRes = await axios.get('http://localhost:3000/api/fields/report', config);
        setReport(reportRes.data);

        // Weather
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const wRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
            const gRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            
            const addr = gRes.data.address;
            setWeather({
              temp: Math.round(wRes.data.current.temperature_2m),
              condition: getWeatherDescription(wRes.data.current.weather_code),
              location: addr.city || addr.town || addr.village || 'Dombivli'
            });
          });
        }

        // News & Schemes Logic (simplified for brevity, keep your existing logic here)
        setNewsLoading(false);
        setSchemes([
            { title: "PM Kisan Samman Nidhi", url: "https://pmkisan.gov.in/" },
            { title: "PM Fasal Bima Yojana", url: "https://pmfby.gov.in/" }
        ]);

      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('userInfo');
          return navigate('/login');
        }
      }
      setLoading(false);
    };
    checkUserAndFetch();
  }, [navigate, i18n.language]); // Refetch/Re-map when language changes

  // Delete field with translated confirm
  const handleDeleteField = async (fieldId, fieldName) => {
    if (window.confirm(`${t('dash.confirm_delete')} ${fieldName}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.patch(`http://localhost:3000/api/fields/${fieldId}/delete`, {}, config);
        setFields(fields.filter(f => f._id !== fieldId));
      } catch (e) { alert(t('dash.delete_error')); }
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const summarySheet = XLSX.utils.json_to_sheet([report.reportSummary]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "Agrove_Report.xlsx");
  };

  if (loading) return <div className="loading-screen">{t('dash.loading')}</div>;

  return (
    <div className="dash-container" ref={dashRef} style={{backgroundImage : `url(${Bgimg})`}}>
      <div className="dash-content">
        <header className="dash-header">
          <div>
            <h1 className="user-greeting">{t('dash.hello')}, <span className="highlight-name">{user?.name}</span></h1>
            <p className="one-liner">{t('dash.one_liner')}</p>
          </div>
        </header>

        <div className="bento-grid">
          {/* Profitability Analysis */}
          <div className="bento-card col-span-2 row-span-2">
            <div className="card-header"><h3>{t('dash.profit_analysis')}</h3><FiDollarSign /></div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                  <Legend />
                  <Area type="monotone" dataKey={t('dash.revenue')} stroke="#39ff14" fill="#39ff1433" />
                  <Area type="monotone" dataKey={t('dash.cost')} stroke="#ef4444" fill="#ef444433" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crop Distribution */}
          <div className="bento-card row-span-2">
            <div className="card-header"><h3>{t('dash.crop_dist')}</h3><FiLayers /></div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius="60%" outerRadius="80%" dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % 5]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#dadadaff', border: '1px solid #333' }} />
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
              <h3>{t('dash.market_news')}</h3>
              <div className="live-indicator"><span className="live-dot"></span><span className="live-text">{t('dash.live')}</span></div>
            </div>
            <div className="news-scroll">
              {news.map((item, i) => (
                <div key={i} className="news-entry">
                  <p className="news-title-text">{item.title}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="news-cta-link">{t('dash.view_details')} <FiExternalLink /></a>
                </div>
              ))}
            </div>
          </div>

          {/* Govt Schemes */}
          <div className="bento-card row-span-2 schemes-card">
            <div className="card-header"><h3>{t('dash.govt_schemes')}</h3><FiBriefcase /></div>
            <div className="news-scroll">
              {schemes.map((item, i) => (
                <div key={i} className="news-entry">
                  <p className="news-title-text">{item.title}</p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="news-cta-link">{t('dash.apply')} <FiExternalLink /></a>
                </div>
              ))}
            </div>
          </div>

          <div><QuickNotes /></div>
        </div>

        <section className="fields-section-container">
          <h2 className="section-title">{t('dash.managed_fields')}</h2>
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

        <div className="fab-container">
          <button className="fab-btn download-btn-fab" onClick={downloadReport} title={t('dash.download_report')}>
            <FiDownload />
          </button>
          <button className="fab-btn plus-btn" onClick={() => navigate('/add-field')} title={t('dash.add_field')}>
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;