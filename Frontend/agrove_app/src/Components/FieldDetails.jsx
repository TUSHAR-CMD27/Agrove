import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  FiArrowLeft, FiCheckCircle, FiClock, FiTrash2, 
  FiEdit, FiSettings, FiFileText 
} from 'react-icons/fi';
import './FieldDetails.css';

const FieldDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showEditMenu, setShowEditMenu] = useState(false);
  
  const [stats, setStats] = useState({
    progress: 0,
    totalCost: 0,
    totalRevenue: 0,
    currentStage: 'Planning'
  });

  const COLORS = ['#39ff14', '#333'];

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return navigate('/login');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const [fieldRes, actRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/fields/${id}`, config),
          axios.get(`http://localhost:3000/api/activities?fieldId=${id}`, config)
        ]);
        setField(fieldRes.data);
        setActivities(actRes.data);
        calculateStats(actRes.data);
      } catch (err) { 
        console.error("Error fetching data:", err); 
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Logic: Calculate Stats
  const calculateStats = (logs) => {
    const cost = logs.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const revenue = logs.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const completed = logs.filter(l => l.status === 'Completed');
    
    let progress = 0;
    let stage = "Planning";

    if (completed.some(l => l.activityType === 'Sowing')) { progress = 25; stage = "Sowed"; }
    if (completed.some(l => l.activityType === 'Irrigation')) { progress = 50; stage = "Growing"; }
    if (completed.some(l => l.activityType === 'Fertilizer')) { progress = 75; stage = "Maturing"; }
    if (completed.some(l => l.activityType === 'Harvesting')) { progress = 100; stage = "Harvested"; }

    setStats({ progress, totalCost: cost, totalRevenue: revenue, currentStage: stage });
  };

  // 3. Handle Delete
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("⚠️ Move this task to backup?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.patch(`http://localhost:3000/api/activities/${activityId}/delete`, {}, config);
      
      const updatedActivities = activities.filter(act => act._id !== activityId);
      setActivities(updatedActivities);
      calculateStats(updatedActivities);
    } catch (err) {
      alert("Error deleting activity");
    }
  };

  if (!field) return <div className="loading-screen">Loading South Plot...</div>;

  const pieData = [
    { name: 'Done', value: stats.progress }, 
    { name: 'Remaining', value: 100 - stats.progress }
  ];
  const netProfit = stats.totalRevenue - stats.totalCost;

  return (
    <div className="field-detail-container">
      {/* Header with Plot Name and Crop Badge */}
      <div className="detail-header" style={{ background: '#0a3d1d' }}>
        <button onClick={() => navigate('/dashboard')} className="back-btn-detail">
          <FiArrowLeft />
        </button>
        <div className="header-content">
          <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            {field.fieldName}
          </motion.h1>
          <span className="crop-pill">{field.currentCrop}</span>
        </div>
      </div>

      <div className="detail-content-grid">
        {/* Left Side: Stats and Financials */}
        <div className="left-panel">
          <motion.div className="info-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h3>FIELD PROGRESS</h3>
            <div className="chart-row">
              <div className="chart-mini">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      innerRadius={45} 
                      outerRadius={60} 
                      paddingAngle={5}
                      dataKey="value" 
                      startAngle={90} 
                      endAngle={-270}
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="center-text">{stats.progress}%</div>
              </div>
              <div className="progress-labels">
                <p>Current Stage: <strong>{stats.currentStage}</strong></p>
              </div>
            </div>
          </motion.div>

          <motion.div className="info-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3>FINANCIAL SUMMARY</h3>
            <div className="financial-stats-row">
              <div className="fin-item">
                <label>Total Cost</label>
                <span className="cost-text">₹{stats.totalCost.toLocaleString()}</span>
              </div>
              <div className="fin-item">
                <label>Net Profit</label>
                <span className={`profit-text ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                  ₹{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Operations Log */}
        <div className="right-panel">
          <div className="activity-header">
            <h3>Operations Log</h3>
            <button 
              className="add-log-btn" 
              onClick={() => navigate('/plan', { state: { fieldId: field._id, fieldName: field.fieldName } })}
            >
              + Plan Task
            </button>
          </div>

          <div className="timeline">
            {activities.length === 0 ? (
              <p className="no-logs">No activity recorded for this plot.</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="timeline-item">
                  <div className={`timeline-dot ${act.status === 'Completed' ? 'done' : 'pending'}`}>
                    {act.status === 'Completed' ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-top">
                      <h4>{act.activityType} <span className="cost-badge">₹{act.cost}</span></h4>
                      <div className="timeline-actions">
                        <button onClick={() => navigate(`/edit/activity/${act._id}`)}><FiEdit /></button>
                        <button onClick={() => handleDeleteActivity(act._id)}><FiTrash2 /></button>
                      </div>
                    </div>
                    <span className="timeline-date">{new Date(act.activityDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Menu (Horizontal Expansion) */}
      <div className="edit-fab-container">
        <AnimatePresence>
          {showEditMenu && (
            <motion.div 
              className="fab-options-horizontal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="fab-option-wrapper">
                <button className="fab-sub-btn field-color" onClick={() => navigate(`/edit/field/${id}`)}>
                  <FiSettings />
                </button>
                <span className="fab-label-bottom">Field</span>
              </div>
              <div className="fab-option-wrapper">
                <button className="fab-sub-btn activity-color" onClick={() => setShowEditMenu(false)}>
                  <FiFileText />
                </button>
                <span className="fab-label-bottom">Logs</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          className={`fab-main-btn ${showEditMenu ? 'active' : ''}`}
          onClick={() => setShowEditMenu(!showEditMenu)}
          whileTap={{ scale: 0.9 }}
        >
          <FiEdit />
        </motion.button>
      </div>
    </div>
  );
};

export default FieldDetails;