import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FiArrowLeft, FiActivity, FiCheckCircle, FiClock } from 'react-icons/fi';
import './FieldDetails.css';

// Mock Data for "Stage Progress" (Will be dynamic later)
const progressData = [
  { name: 'Completed', value: 75 },
  { name: 'Remaining', value: 25 },
];
const COLORS = ['#39ff14', '#333'];

const FieldDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  
  // Dummy Activity Logs (Frontend only for now)
  const [activities, setActivities] = useState([
    { id: 1, type: 'Sowing', date: '2023-10-01', status: 'Completed' },
    { id: 2, type: 'Fertilizing', date: '2023-10-15', status: 'Completed' },
    { id: 3, type: 'Irrigation', date: '2023-10-20', status: 'Completed' },
    { id: 4, type: 'Pest Control', date: '2023-11-05', status: 'Pending' },
  ]);

  // Simulate Fetching Field Data
  useEffect(() => {
    // In real backend integration, fetch axios.get(`/api/fields/${id}`)
    // For now, we assume user passed data or we fetch from list context
    console.log("Fetching details for field ID:", id);
    // Setting dummy field data to visualize UI
    setField({
      _id: id,
      fieldName: 'North Wheat Plot',
      currentCrop: 'Wheat',
      areaSize: 2.5,
      soilType: 'Black',
      fieldImage: 'https://images.unsplash.com/photo-1627920769842-6877543d3b73?q=80&w=400',
      waterAvailability: 'Medium'
    });
  }, [id]);

  if (!field) return <div className="loading-screen">Loading Field Data...</div>;

  return (
    <div className="field-detail-container">

         {/* Background blobs */}
      <div className="blob-layer">
        <div className="ag-blob blob-green-1"></div>
        <div className="ag-blob blob-yellow-1"></div>
        <div className="ag-blob blob-white-1"></div>
      </div>
      
      {/* Header Image */}
      <div 
        className="detail-header" 
        style={{ backgroundImage: `url(${field.fieldImage})` }}
      >
        <div className="overlay"></div>
        <button onClick={() => navigate('/dashboard')} className="back-btn-detail">
          <FiArrowLeft />
        </button>
        <div className="header-content">
          <h1>{field.fieldName}</h1>
          <span className="crop-pill">{field.currentCrop}</span>
        </div>
      </div>

      <div className="detail-content-grid">
        
        {/* Left: Stats & Progress */}
        <div className="left-panel">
          
          {/* Progress Card */}
          <motion.div 
            className="info-card progress-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Season Progress</h3>
            <div className="chart-row">
              <div className="chart-mini">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={progressData}
                      innerRadius={40}
                      outerRadius={55}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="center-text">
                  <span className="percent">75%</span>
                </div>
              </div>
              <div className="progress-labels">
                <p>Current Stage: <strong>Flowering</strong></p>
                <p>Est. Harvest: <strong>Dec 20</strong></p>
              </div>
            </div>
          </motion.div>

          {/* Quick Info */}
          <div className="info-card">
            <h3>Field Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <label>Area</label>
                <span>{field.areaSize} Ha</span>
              </div>
              <div className="spec-item">
                <label>Soil</label>
                <span>{field.soilType}</span>
              </div>
              <div className="spec-item">
                <label>Water</label>
                <span>{field.waterAvailability}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Activity Log */}
        <div className="right-panel">
          <div className="activity-header">
            <h3>Activity Log</h3>
            <button className="add-log-btn" onClick={() => navigate('/add-activity')}>
              + Log Task
            </button>
          </div>

          <div className="timeline">
            {activities.map((act, index) => (
              <div key={act.id} className="timeline-item">
                <div className="timeline-line"></div>
                <div className={`timeline-dot ${act.status === 'Completed' ? 'done' : 'pending'}`}>
                  {act.status === 'Completed' ? <FiCheckCircle /> : <FiClock />}
                </div>
                <div className="timeline-content">
                  <h4>{act.type}</h4>
                  <span className="timeline-date">{act.date}</span>
                  <span className={`status-tag ${act.status.toLowerCase()}`}>{act.status}</span>
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