import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiDroplet, FiMap, FiActivity, FiClock } from 'react-icons/fi';
import './FieldCard.css';

const FieldCard = ({ field, onClick }) => {
  const [latestLog, setLatestLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest activity for this specific field
  useEffect(() => {
    const fetchLatestActivity = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;

      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        // Fetch all activities for this field
        const res = await axios.get(`http://localhost:3000/api/activities/${field._id}`, config);
        
        // Since backend sorts by newest first, take the 0th index
        if (res.data && res.data.length > 0) {
          setLatestLog(res.data[0]);
        } else {
          setLatestLog(null);
        }
      } catch (err) {
        console.error("Error fetching activity for card", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestActivity();
  }, [field._id]); // Re-run if field ID changes

  // Helper to format date (e.g., "Oct 24")
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div 
      className="field-card"
      whileHover={{ y: -5 }}
      onClick={() => onClick(field._id)}
    >
      <div 
        className="card-image" 
        style={{ backgroundImage: `url(${field.fieldImage})` }}
      >
        <span className="crop-badge">{field.currentCrop}</span>
        
        {/* Optional: Status Overlay based on water availability */}
        {field.waterAvailability === 'Scarce' && (
          <span className="status-alert">Low Water</span>
        )}
      </div>
      
      <div className="card-info">
        <h3>{field.fieldName}</h3>
        
        <div className="info-row">
          <span><FiMap /> {field.areaSize} Ha</span>
          <span><FiDroplet /> {field.waterAvailability}</span>
        </div>
        
        {/* Dynamic Activity Section */}
        <div className="activity-footer">
          {loading ? (
            <span className="activity-text loading">Loading updates...</span>
          ) : latestLog ? (
            <div className="activity-row">
              <div className={`activity-dot ${latestLog.status === 'Completed' ? 'done' : 'pending'}`}></div>
              <div className="activity-details">
                <span className="act-type">{latestLog.activityType}</span>
                <span className="act-date"><FiClock size={10} /> {formatDate(latestLog.activityDate)}</span>
              </div>
            </div>
          ) : (
            <div className="no-activity">
              <FiActivity /> <span>No recent activities</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FieldCard;