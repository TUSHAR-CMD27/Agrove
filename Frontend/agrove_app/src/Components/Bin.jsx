import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiRefreshCw,
  FiTrash2,
  FiArrowLeft,
  FiClock,
  FiFileText
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Bin.css';

const Bin = () => {
  const [deletedFields, setDeletedFields] = useState([]);
  const [deletedActivities, setDeletedActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBin();
  }, []);

  const fetchBin = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const [fieldsRes, activitiesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/fields/bin', config),
        axios.get('http://localhost:3000/api/activities/bin/all', config)
      ]);

      setDeletedFields(fieldsRes.data);
      setDeletedActivities(activitiesRes.data);
    } catch (err) {
      console.error("Error fetching bin", err);
    }
  };

  const restoreField = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.patch(`http://localhost:3000/api/fields/${id}/restore`, {}, config);
      fetchBin();
    } catch {
      alert("Field restore failed");
    }
  };

  const restoreActivity = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.patch(`http://localhost:3000/api/activities/${id}/restore`, {}, config);
      fetchBin();
    } catch {
      alert("Activity restore failed");
    }
  };

  return (
    <div className="bin-page-container">
      <div className="bin-header">
        <button onClick={() => navigate('/dashboard')} className="back-dashboard-btn">
          <FiArrowLeft /> Back
        </button>

        <h2><FiTrash2 /> Recycle Bin</h2>
      </div>

      {/* FIELDS */}
      <h3 className="bin-section-title">Deleted Fields</h3>
      <div className="bin-grid">
        {deletedFields.length === 0 ? (
          <p className="empty-bin-msg">No deleted fields</p>
        ) : (
          deletedFields.map(field => (
            <div key={field._id} className="bin-card">
              <h4>{field.fieldName}</h4>
              <p><FiClock /> Deleted on {new Date(field.deletedAt).toLocaleDateString()}</p>
              <button onClick={() => restoreField(field._id)}>
                <FiRefreshCw /> Restore Field
              </button>
            </div>
          ))
        )}
      </div>

      {/* ACTIVITIES */}
      <h3 className="bin-section-title">Deleted Activities</h3>
      <div className="bin-grid">
        {deletedActivities.length === 0 ? (
          <p className="empty-bin-msg">No deleted activities</p>
        ) : (
          deletedActivities.map(act => (
            <div key={act._id} className="bin-card">
              <h4><FiFileText /> {act.activityType}</h4>
              <p>₹{act.cost || 0}</p>
              <p><FiClock /> Deleted on {new Date(act.deletedAt).toLocaleDateString()}</p>
              <button onClick={() => restoreActivity(act._id)}>
                <FiRefreshCw /> Restore Activity
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bin;
