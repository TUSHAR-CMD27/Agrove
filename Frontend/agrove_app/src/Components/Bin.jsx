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
import { useTranslation } from 'react-i18next'; // 1. Import
import toast from 'react-hot-toast'; // Consistent notifications
import './Bin.css';

const Bin = () => {
  const { t } = useTranslation(); // 2. Initialize
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
        axios.get(`${import.meta.env.VITE_API_URL}/api/fields/bin`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/api/activities/bin/all`, config)
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
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/fields/${id}/restore`, {}, config);
      toast.success(t('bin.restore_success'));
      fetchBin();
    } catch {
      toast.error(t('bin.restore_fail'));
    }
  };

  const restoreActivity = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/activities/${id}/restore`, {}, config);
      toast.success(t('bin.restore_success'));
      fetchBin();
    } catch {
      toast.error(t('bin.restore_fail'));
    }
  };

  return (
    <div className="bin-page-container">
      
      <div className="bin-header">
        <button onClick={() => navigate('/dashboard')} className="back-dashboard-btn">
          <FiArrowLeft /> {t('bin.back')}
        </button>

        <h2><FiTrash2 /> {t('nav.recycle_bin')}</h2>
      </div>

      {/* FIELDS SECTION */}
      <h3 className="bin-section-title">{t('bin.deleted_fields')}</h3>
      <div className="bin-grid">
        {deletedFields.length === 0 ? (
          <p className="empty-bin-msg">{t('bin.no_fields')}</p>
        ) : (
          deletedFields.map(field => (
            <div key={field._id} className="bin-card">
              <h4>{field.fieldName}</h4>
              <p><FiClock /> {t('bin.deleted_on')} {new Date(field.deletedAt).toLocaleDateString()}</p>
              <button onClick={() => restoreField(field._id)}>
                <FiRefreshCw /> {t('bin.restore_btn')}
              </button>
            </div>
          ))
        )}
      </div>

     {/* ACTIVITIES SECTION */}
      <h3 className="bin-section-title">{t('bin.deleted_activities')}</h3>
      <div className="bin-grid">
        {deletedActivities.length === 0 ? (
          <p className="empty-bin-msg">{t('bin.no_activities')}</p>
        ) : (
          deletedActivities.map(act => (
            <div key={act._id} className="bin-card">
              {/* Localized Activity Type */}
              <h4><FiFileText /> {t(`activity.types.${(act.activityType || 'other').toLowerCase()}`)}</h4>
              
              <p style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {t('details.fab_field')}: {act.field?.fieldName || t('bin.original_deleted')}
              </p>

              <p>₹{act.cost || 0}</p>
              <p><FiClock /> {t('bin.deleted_on')} {new Date(act.deletedAt).toLocaleDateString()}</p>
              <button onClick={() => restoreActivity(act._id)}>
                <FiRefreshCw /> {t('bin.restore_btn')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bin;