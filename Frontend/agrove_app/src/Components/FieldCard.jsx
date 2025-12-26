


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- IMPORTED TOAST ---
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

  // --- NEW: CONFIRMATION LOGIC ---
  const handleConfirmDelete = (e) => {
    e.stopPropagation(); // Prevents clicking the card and going to details page

    toast((t) => (
      <div className="custom-confirm-container">
        <p>Delete <b>{field.fieldName}</b> plot? <br/> <small>This moves all data to Recycle Bin.</small></p>
        <div className="toast-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button 
            className="toast-confirm-btn"
            style={{ 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={() => {
              toast.dismiss(t.id);
              onDelete(field._id, field.fieldName); // Calls the original delete function
            }}
          >
            Yes, Delete
          </button>
          <button 
            className="toast-cancel-btn"
            style={{ 
              background: '#4b5563', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        border: '1px solid #ef4444',
        padding: '16px',
        color: '#1f2937',
        minWidth: '250px'
      }
    });
  };

  return (
    <motion.div 
      className="field-card"
      whileHover={{ y: -5 }}
      onClick={() => onClick(field._id)}
    >
      <div className="card-image" style={{ backgroundImage: `url(${field.fieldImage})` }}>
        
        {/* UPDATED DELETE FIELD ICON */}
        <div 
          className="field-delete-btn" 
          onClick={handleConfirmDelete} // Trigger the confirmation toast
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