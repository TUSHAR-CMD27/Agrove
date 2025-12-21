import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  FiSun, FiLayers, FiDollarSign, FiExternalLink, FiBriefcase, FiCloudRain, FiMapPin
} from 'react-icons/fi';
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
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', location: 'Locating...' });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        return;
      }
      
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);

      try {
        const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
        
        // 1. Fetch Field Data
        const res = await axios.get('http://localhost:3000/api/fields', config);
        setFields(res.data);
        const cropMap = {};
        res.data.forEach(f => {
          const crop = f.currentCrop || 'Other';
          cropMap[crop] = (cropMap[crop] || 0) + (f.areaSize || 1);
        });
        setPieData(Object.keys(cropMap).map(name => ({ name, value: cropMap[name] })));
        setFinancialData(res.data.map(f => ({ name: f.fieldName, Cost: f.totalCost, Revenue: f.totalRevenue })));

       
      // 2. Weather Logic & Reverse Geocoding
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Fetch Weather Data
              const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
              const wRes = await axios.get(weatherUrl);

              // NEW: Fetch City Name (Reverse Geocoding)
              const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
              const geoRes = await axios.get(geoUrl);

              // Pick the best location name from the response
              const address = geoRes.data.address;
              const cityDisplayName = address.city || address.town || address.village || address.suburb || 'Your Location';

              setWeather({
                temp: Math.round(wRes.data.current.temperature_2m),
                condition: getWeatherDescription(wRes.data.current.weather_code),
                location: cityDisplayName // Now shows the actual city!
              });

            } catch (e) {
              console.error("Location/Weather error:", e);
              setWeather(prev => ({ ...prev, condition: "Offline", location: "Location Error" }));
            }
          });
        }

        // 3. SECURE FARMER NEWS (Mandi Rates & Crop Advice)
        const fetchFarmerNews = async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

          const newsFeeds = [
            { label: "Mandi Rate", url: 'https://krishijagran.com/rss/market-news/' },
            { label: "Crop Advice", url: 'https://krishijagran.com/rss/agripedia/' }
          ];

          try {
            const feed = newsFeeds[0];
            const apiEndpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&t=${Date.now()}`;
            
            const response = await fetch(apiEndpoint, { signal: controller.signal });
            const data = await response.json();

            if (data.status === 'ok' && data.items.length > 0) {
              const formatted = data.items.slice(0, 5).map(item => ({
                title: item.title,
                link: item.link,
                category: feed.label
              }));
              setNews(formatted);
              setNewsLoading(false);
              clearTimeout(timeoutId);
              return;
            }
          } catch (err) {
            console.warn("News feed slow/blocked. Showing daily links.");
          }

          // INSTANT FALLBACK if the API is blocked or slow
          setNews([
            { title: "Today's Mandi Price (Official Agmarknet)", link: "https://agmarknet.gov.in/", category: "Live Market" },
            { title: "Weekly Crop Advisory for Farmers (ICAR)", link: "https://icar.org.in/", category: "Seasonal" },
            { title: "Daily Agriculture News Portal", link: "https://krishijagran.com/", category: "Agri-News" },
            { title: "Check Latest Weather Alerts", link: "https://mausam.imd.gov.in/", category: "Mausam" }
          ]);
          setNewsLoading(false);
          clearTimeout(timeoutId);
        };
        fetchFarmerNews();

        // 4. Govt Schemes Logic (Dedicated Card)
        const DATA_GOV_KEY = "579b464db66ec23bdd000001889912a7c0844e435d230832e17f993d";
        if (DATA_GOV_KEY) {
          try {
            const schemeRes = await axios.get(`https://data.gov.in/api/datastore/resource.json?resource_id=6aee3f1e-bc6b-4b2d-9b91-4b9a0d6c5f6a&api-key=${DATA_GOV_KEY}&limit=5`);
            const formatted = schemeRes.data.records.map(s => ({
              title: s.scheme_name || s.name || "Government Scheme",
              url: s.website || "https://www.india.gov.in/topics/agriculture"
            }));
            setSchemes(formatted);
          } catch (err) { setSchemes(FALLBACK_SCHEMES); }
        }

      } catch (err) { console.error("Critical error in data fetch", err); }
      setLoading(false);
    };
    checkUserAndFetch();
  }, []);

  useLayoutEffect(() => {
    if (loading) return;
    let ctx = gsap.context(() => {
      gsap.from(".bento-card", {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
      });
    }, dashRef);
    return () => ctx.revert();
  }, [loading]);

  if (loading) return <div className="loading-screen">Updating Farm Insights...</div>;

  return (
    <div className="dash-container" ref={dashRef}>
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-2"></div>
      <div className="dash-blob blob-dash-3"></div>

      <div className="dash-content">
        {!user ? (
          <div className="logged-out-view">
            <h1 className="user-greeting">Access <span className="highlight-name">Locked</span></h1>
            <p className="one-liner">Please log in to manage your fields and finances.</p>
            <button className="submit-act-btn" onClick={() => navigate('/login')} style={{maxWidth: '300px', margin: '2rem auto'}}>
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <header className="dash-header">
              <div>
                <h1 className="user-greeting">Hello, <span className="highlight-name">{user.name}</span></h1>
                <p className="one-liner">Market rates and seasonal crop updates. 🌿</p>
              </div>
            </header>

            <div className="bento-grid">
              {/* Financial Analysis Card */}
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

              {/* Crop Distribution Card */}
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
           

              {/* Farmer Market News Card (Independent from Schemes) */}
              <div className="bento-card row-span-2 news-card">
                <div className="card-header">
                  <h3>Market & Crop News</h3>
                  <div className="live-indicator"><span className="live-dot"></span><span className="live-text">LIVE</span></div>
                </div>
                <div className="news-scroll">
                  {newsLoading ? (
                    <p className="loading-text">Loading daily trends...</p>
                  ) : (
                    news.map((item, index) => (
                      <div key={index} className="news-entry">
                        <span className="news-tag" style={{fontSize: '0.65rem', color: '#39ff14', fontWeight: 'bold'}}>
                          [{item.category}]
                        </span>
                        <p className="news-title-text" style={{marginTop: '4px', fontSize: '0.9rem'}}>{item.title}</p>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-cta-link">
                          View Details <FiExternalLink />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Govt Schemes Card (Pulled from data.gov.in) */}
              <div className="bento-card row-span-2 schemes-card">
                <div className="card-header"><h3>Govt. Schemes</h3><FiBriefcase /></div>
                <div className="news-scroll">
                  {schemes.length > 0 ? schemes.map((item, index) => (
                    <div key={index} className="news-entry">
                      <p className="news-title-text">{item.title}</p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-cta-link">Apply Now <FiExternalLink /></a>
                    </div>
                  )) : <p className="loading-text">Loading schemes...</p>}
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
                  <div className="weather-detail-item"><FiCloudRain /> <span>{weather.condition}</span></div>
                  <div className="weather-detail-item"><FiMapPin /> <span>{weather.location}</span></div>
                </div>
              </div>

                {/* Quick Notes */}
              <div><QuickNotes /></div>
            </div>

            <section className="fields-section-container">
              <h2 className="section-title">My Managed Fields</h2>
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