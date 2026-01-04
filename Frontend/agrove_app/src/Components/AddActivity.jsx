import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import { FaRupeeSign } from "react-icons/fa";
import { FiSave, FiArrowLeft, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './AddActivity.css';

const AddActivity = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  
  const [allowedTypes, setAllowedTypes] = useState(['Sowing']); 

  const [formData, setFormData] = useState({
    fieldId: '',
    activityType: 'Sowing',
    activityDate: new Date().toISOString().split('T')[0],
    status: 'Planned',
    productName: '',
    quantity: '',
    unit: 'kg',
    cost: '',
    revenue: '',
    notes: ''
  });

  useEffect(() => {
    const fetchFields = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return navigate('/login');
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('http://localhost:10000/api/fields', config);
        setFields(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, fieldId: res.data[0]._id }));
        }
      } catch (err) {
        console.error("Error fetching fields", err);
      }
    };
    fetchFields();
  }, [navigate]);

  useEffect(() => {
    if (!formData.fieldId) return;

    const checkHistory = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const res = await axios.get(`http://localhost:10000/api/activities/${formData.fieldId}`, config);
        const logs = res.data;

        const hasSowing = logs.some(l => l.activityType === 'Sowing');
        const hasHarvest = logs.some(l => l.activityType === 'Harvesting');

        if (!hasSowing || (hasHarvest && hasSowing)) { 
           if(!hasSowing) {
               setAllowedTypes(['Sowing']);
               setFormData(prev => ({ ...prev, activityType: 'Sowing' }));
           } else {
               if(logs.length > 0 && logs[0].activityType === 'Harvesting'){
                   setAllowedTypes(['Sowing']);
                   setFormData(prev => ({ ...prev, activityType: 'Sowing' }));
               } else {
                   setAllowedTypes(['Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']);
               }
           }
        } else {
            setAllowedTypes(['Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']);
        }
      } catch (err) {
        setAllowedTypes(['Sowing', 'Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']);
      }
    };
    checkHistory();
  }, [formData.fieldId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:10000/api/activities', formData, config);
      navigate(`/field/${formData.fieldId}`);
    } catch (err) {
      alert(t('activity.error_msg') + ": " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping helper
  const getActivityIcon = (type) => {
    const icons = {
      Sowing: '🌱', Irrigation: '💧', Fertilizer: '🧪',
      Pesticide: '🛡️', Harvesting: '🌾', Other: '📝'
    };
    return icons[type] || '📝';
  };

  return (
    <div className="add-activity-container">
      <div className="dash-blob blob-dash-1"></div>
      <div className="dash-blob blob-dash-2"></div>
      <div className="dash-blob blob-dash-3"></div>
      
      <div className="activity-header-section">
        <button onClick={() => navigate('/dashboard')} className="back-btn-simple">
          <FiArrowLeft size={24} />
        </button>
        <h1>{t('activity.header_title')}</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group-act">
            <label>{t('activity.select_field')}</label>
            <select name="fieldId" value={formData.fieldId} onChange={handleChange} required>
              {fields.map(field => (
                <option key={field._id} value={field._id}>
                  {field.fieldName} ({field.currentCrop})
                </option>
              ))}
            </select>
          </div>

          <div className="row-split">
            <div className="form-group-act">
              <label>{t('activity.task_type')}</label>
              <select name="activityType" value={formData.activityType} onChange={handleChange}>
                {allowedTypes.map(type => (
                   <option key={type} value={type}>
                     {getActivityIcon(type)} {t(`activity.types.${type.toLowerCase()}`)}
                   </option>
                ))}
              </select>
              {allowedTypes.length === 1 && allowedTypes[0] === 'Sowing' && (
                <small className="warning-text">
                  <FiAlertCircle /> {t('activity.sowing_warning')}
                </small>
              )}
            </div>

            <div className="form-group-act">
              <label>{t('activity.label_date')}</label>
              <div className="input-with-icon">
                <FiCalendar />
                <input type="date" name="activityDate" value={formData.activityDate} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-group-act">
            <label>{t('activity.label_status')}</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={{ 
                borderColor: formData.status === 'Planned' ? '#fbbf24' : '#39ff14',
                color: formData.status === 'Planned' ? '#fbbf24' : '#39ff14'
              }}
            >
              <option value="Planned">{t('activity.status_planned')}</option>
              <option value="Completed">{t('activity.status_completed')}</option>
            </select>
          </div>

          <div className="form-group-act">
            <label>{t('activity.label_product')}</label>
            <input 
              type="text" 
              name="productName" 
              placeholder={t('activity.placeholder_product')}
              value={formData.productName} 
              onChange={handleChange} 
            />
          </div>

          <div className="row-split">
            <div className="form-group-act">
              <label>{t('activity.label_quantity')}</label>
              <input type="number" name="quantity" placeholder="0.00" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="form-group-act">
              <label>{t('activity.label_unit')}</label>
              <select name="unit" value={formData.unit} onChange={handleChange}>
                <option value="kg">{t('activity.units.kg')}</option>
                <option value="L">{t('activity.units.L')}</option>
                <option value="bags">{t('activity.units.bags')}</option>
                <option value="hours">{t('activity.units.hours')}</option>
                <option value="units">{t('activity.units.units')}</option>
              </select>
            </div>
          </div>

          <div className="row-split">
            <div className="form-group-act">
              <label>{t('activity.label_cost')}</label>
              <div className="input-with-icon cost-input">
                <FaRupeeSign/>
                <input type="number" name="cost" placeholder="0.00" value={formData.cost} onChange={handleChange} />
              </div>
            </div>

            {formData.activityType === 'Harvesting' && (
              <div className="form-group-act">
                <label className="revenue-label">{t('activity.label_revenue')}</label>
                <div className="input-with-icon revenue-input">
                  <FaRupeeSign />
                  <input type="number" name="revenue" placeholder="0.00" value={formData.revenue} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          <div className="form-group-act">
            <label>{t('activity.label_notes')}</label>
            <textarea 
              name="notes" 
              rows="3" 
              placeholder={t('activity.placeholder_notes')}
              value={formData.notes} 
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="submit-act-btn" disabled={loading}>
            {loading ? t('activity.saving') : <><FiSave /> {t('activity.save_btn')}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddActivity;