import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi';
import './FieldDetails.css';

const FieldDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // Stats
  const [progress, setProgress] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0); // ✅ New State for Revenue
  const [currentStage, setCurrentStage] = useState('Planning');

  const COLORS = ['#39ff14', '#333'];

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const [fieldRes, actRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/fields/${id}`, config),
          axios.get(`http://localhost:3000/api/activities/${id}`, config)
        ]);
        setField(fieldRes.data);
        setActivities(actRes.data);
        calculateStats(actRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [id]);

  // 2. Logic: Calculate Progress & Financials
  const calculateStats = (logs) => {
    // Calculate Totals
    const cost = logs.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const revenue = logs.reduce((acc, curr) => acc + (curr.revenue || 0), 0); // ✅ Sum Revenue
    
    setTotalCost(cost);
    setTotalRevenue(revenue);

    const completed = logs.filter(l => l.status === 'Completed');
    
    // Determine Stage
    let percent = 0;
    let stage = "Planning";

    if (completed.some(l => l.activityType === 'Sowing')) { percent = 25; stage = "Sowed"; }
    if (completed.some(l => l.activityType === 'Irrigation')) { percent = 50; stage = "Growing"; }
    if (completed.some(l => l.activityType === 'Fertilizer')) { percent = 75; stage = "Maturing"; }
    if (completed.some(l => l.activityType === 'Harvesting')) { percent = 100; stage = "Harvested"; }

    setProgress(percent);
    setCurrentStage(stage);
  };

  // 3. Handle Click to Complete
  const toggleStatus = async (activityId, currentStatus) => {
    if (currentStatus === 'Completed') return; 

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      const updatedActivities = activities.map(act => 
        act._id === activityId ? { ...act, status: 'Completed' } : act
      );
      setActivities(updatedActivities);
      calculateStats(updatedActivities);

      await axios.patch(`http://localhost:3000/api/activities/${activityId}`, {}, config);
      
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (!field) return <div className="loading-screen">Loading...</div>;

  const pieData = [{ name: 'Done', value: progress }, { name: 'Left', value: 100 - progress }];
  
  // ✅ Data for the new Bar Chart
  const financialData = [
    { name: 'Financials', Cost: totalCost, Revenue: totalRevenue }
  ];

  // Calculate Net Profit
  const netProfit = totalRevenue - totalCost;

  return (
    <div className="field-detail-container">
      {/* Background blobs */}
      <div className="blob-layer">
        <div className="ag-blob blob-green-1"></div>
        <div className="ag-blob blob-yellow-1"></div>
      </div>

      <div className="detail-header" >
        <button onClick={() => navigate('/dashboard')} className="back-btn-detail"><FiArrowLeft /></button>
        <div className="header-content">
          <h1>{field.fieldName}</h1>
          <span className="crop-pill">{field.currentCrop}</span>
        </div>
      </div>

      <div className="detail-content-grid">
        
        {/* Left Panel: Stats & Graphs */}
        <div className="left-panel">
          
          {/* 1. Progress Pie Chart */}
          <motion.div className="info-card progress-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3>Field Status</h3>
            <div className="chart-row">
              <div className="chart-mini">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                      {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="center-text"><span className="percent">{progress}%</span></div>
              </div>
              <div className="progress-labels">
                <p>Stage: <strong>{currentStage}</strong></p>
                <p>Next: <strong>{progress === 100 ? 'Sale' : 'Care'}</strong></p>
              </div>
            </div>
          </motion.div>

          {/* ✅ 2. NEW: Profit vs Cost Bar Chart */}
          <motion.div 
            className="info-card financial-card" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3>Profit & Loss Analysis</h3>
            <div className="financial-chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={financialData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#666" hide />
                  <YAxis type="category" dataKey="name" stroke="#666" hide width={10} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="Cost" fill="#ef4444" radius={[0, 4, 4, 0]} name="Total Cost" />
                  <Bar dataKey="Revenue" fill="#39ff14" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="net-profit-row">
              <span>Net Profit:</span>
              <span className={`profit-val ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                {netProfit >= 0 ? '+' : '-'} ₹{Math.abs(netProfit).toLocaleString()}
              </span>
            </div>
          </motion.div>

        </div>

        {/* Right Panel: Interactive Timeline */}
        <div className="right-panel">
          <div className="activity-header">
            <h3>Operations Log</h3>
            <button className="add-log-btn" onClick={() => navigate('/add-activity')}>+ Plan Task</button>
          </div>

          <div className="timeline">
            {activities.length === 0 ? <p className="no-logs">No tasks planned.</p> : activities.map((act) => (
              <div key={act._id} className="timeline-item">
                <div className="timeline-line"></div>
                
                <div 
                  className={`timeline-dot ${act.status === 'Completed' ? 'done' : 'pending'}`}
                  onClick={() => toggleStatus(act._id, act.status)}
                  title={act.status === 'Planned' ? "Click to Mark Done" : "Completed"}
                >
                  {act.status === 'Completed' ? <FiCheckCircle /> : <FiClock />}
                </div>

                <div className="timeline-content">
                  <div className="timeline-top">
                    <h4>{act.activityType}</h4>
                    <span className="cost-badge">₹{act.cost}</span>
                  </div>
                  <span className="timeline-date">
                    {new Date(act.activityDate).toDateString()} 
                    {act.status === 'Planned' && <span className="due-tag"> (Due)</span>}
                  </span>
                  {act.notes && <p className="act-notes">{act.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FieldDetails;