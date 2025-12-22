import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiDroplet, FiMap, FiActivity, FiClock, FiTrash2 } from 'react-icons/fi';
import './FieldCard.css';

const FieldCard = ({ field, onClick, onDelete }) => {
  const [latestLog, setLatestLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchLatestActivity = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get(`http://localhost:3000/api/activities/field/${field._id}`, config);
        if (res.data.length > 0) {
          setLatestLog(res.data[res.data.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestActivity();
  }, [field._id]);

  return (
    <motion.div 
      className="field-card"
      whileHover={{ y: -5 }}
      onClick={() => onClick(field._id)}
    >
      <div className="card-image" style={{ backgroundImage: `url(${field.fieldImage})` }}>
        
        {/* DELETE FIELD ICON - Top Left */}
        <div 
          className="field-delete-btn" 
          onClick={(e) => {
            e.stopPropagation(); // Stops navigation to details page
            onDelete(field._id, field.fieldName);
          }}
        >
          <FiTrash2 size={16} />
        </div>

        <span className="crop-badge">{field.currentCrop}</span>
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