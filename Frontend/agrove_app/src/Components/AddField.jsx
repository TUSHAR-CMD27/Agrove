import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; 
import { FiCheck, FiArrowLeft, FiInfo, FiDroplet, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AddField.css';

// Import images
import Arid from '../assets/arid.jpg';
import BlackSoil from '../assets/black.jpg';
import RedSoil from '../assets/red.jpg';
import Alluvial from '../assets/alluvial.jpg';
import Laterite from '../assets/laterite.jpg';
import Coastal from '../assets/coastal.jpg';
import Forest from '../assets/forest.jpg';

// 1. Hardcoded Prediction Database with Actual Strings
const soilDatabase = {
  'Arid': { 
    crops: 'Bajra, Guar, Moth Beans, Mustard', 
    water: 'Scarce (Low)',
    label: 'Arid Soil'
  },
  'Black': { 
    crops: 'Cotton, Soybeans, Wheat, Jowar, Linseed', 
    water: 'Medium (Moisture Retentive)',
    label: 'Black Cotton Soil'
  },
  'Red': { 
    crops: 'Groundnut, Millet, Pulses, Tobacco', 
    water: 'High (Needs Regular Irrigation)',
    label: 'Red Soil'
  },
  'Alluvial': { 
    crops: 'Rice, Wheat, Sugarcane, Maize, Oilseeds', 
    water: 'Very High (High Absorption)',
    label: 'Alluvial Soil'
  },
  'Laterite': { 
    crops: 'Cashew Nuts, Tea, Coffee, Rubber', 
    water: 'High (Well Drained)',
    label: 'Laterite Soil'
  },
  'Coastal': { 
    crops: 'Coconut, Rice, Areca Nut', 
    water: 'Very High',
    label: 'Coastal/Saline Soil'
  },
  'Forest': { 
    crops: 'Spices, Coffee, Tea, Tropical Fruits', 
    water: 'High',
    label: 'Forest Soil'
  }
};

const AddField = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fieldAvatars = [
    { id: 'img1', name: 'Arid', src: Arid },
    { id: 'img2', name: 'Black', src: BlackSoil },
    { id: 'img3', name: 'Red', src: RedSoil },
    { id: 'img4', name: 'Alluvial', src: Alluvial },
    { id: 'img5', name: 'Laterite', src: Laterite },
    { id: 'img6', name: 'Coastal', src: Coastal },
    { id: 'img7', name: 'Forest', src: Forest },
  ];

  const [formData, setFormData] = useState({
    fieldName: '',
    areaSize: '',
    soilType: '',
    currentCrop: '',
    waterAvailability: 'Medium',
    fieldImage: fieldAvatars[0].src,
    recommendedCrops: '',
    waterRequirement: ''
  });

  // 2. Updated change handler to pull direct strings
  const handleSoilChange = (e) => {
    const selectedKey = e.target.value;
    const data = soilDatabase[selectedKey];
    
    setFormData(prev => ({
      ...prev,
      soilType: selectedKey,
      recommendedCrops: data ? data.crops : '',
      waterRequirement: data ? data.water : '',
      waterAvailability: selectedKey === 'Arid' ? 'Scarce' : prev.waterAvailability
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectAvatar = (src) => {
    setFormData({ ...formData, fieldImage: src });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/fields`, formData, config);
      
      toast.success(`${formData.fieldName} ${t('fields.success_msg')}`, {
        icon: '📍',
        duration: 4000
      });

      navigate('/dashboard');
    } catch (err) {
      toast.error(t('fields.error_msg'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-field-container">
      <motion.div 
        className="field-header-image"
        style={{ backgroundImage: `url(${formData.fieldImage})` }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="header-overlay"></div>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="header-title">{t('fields.add_title')}</h1>
      </motion.div>

      <div className="field-form-wrapper">
        <form onSubmit={handleSubmit} className="field-form">
          <div className="form-section">
            <h3 className="section-title">{t('fields.plot_details')}</h3>
            <div className="form-group-af">
              <label>{t('fields.label_name')}</label>
              <input 
                type="text" name="fieldName" required
                value={formData.fieldName} onChange={handleChange}
                placeholder={t('fields.placeholder_name')}
              />
            </div>

            <div className="form-row-af">
              <div className="form-group-af">
                <label>{t('fields.label_area')}</label>
                <input 
                  type="number" step="0.01" name="areaSize" required
                  value={formData.areaSize} onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group-af">
                <label>{t('fields.label_soil')}</label>
                <select 
                  name="soilType" required
                  value={formData.soilType} onChange={handleSoilChange}
                >
                  <option value="">{t('fields.select_soil')}</option>
                  {Object.keys(soilDatabase).map(key => (
                    <option key={key} value={key}>{soilDatabase[key].label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Logic: Renders actual strings from the state */}
          {formData.soilType && (
            <motion.div className="smart-insight-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <FiInfo className="insight-icon" />
              <div className="insight-text">
                <h4>Smart Soil Analysis</h4>
                <p>
                  For <strong>{soilDatabase[formData.soilType].label}</strong>, 
                  we recommend: <span className="highlight-text">{formData.recommendedCrops}</span>.
                </p>
                <div className="insight-meta">
                  <FiDroplet /> {t('fields.water_req')}: {formData.waterRequirement}
                </div>
              </div>
            </motion.div>
          )}

          <div className="form-section">
            <h3 className="section-title flex items-center gap-2">
              <FiImage /> {t('fields.select_avatar')}
            </h3>
            <div className="avatar-grid">
              {fieldAvatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  onClick={() => selectAvatar(avatar.src)}
                  className={`avatar-card ${formData.fieldImage === avatar.src ? 'selected' : ''}`}
                >
                  <img src={avatar.src} alt={avatar.name} />
                  <div className="avatar-overlay">
                    <span>{avatar.name}</span>
                    {formData.fieldImage === avatar.src && <FiCheck className="check-icon" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">{t('fields.cultivation_info')}</h3>
            <div className="form-group-af">
              <label>{t('fields.current_crop')}</label>
              <select name="currentCrop" required value={formData.currentCrop} onChange={handleChange}>
                <option value="">{t('fields.select_crop')}</option>
                {['Jowar', 'Bajra', 'Wheat', 'Rice', 'Soybean', 'Mango', 'Banana', 'Sugarcane', 'Cotton', 'Gram', 'Maize', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group-af">
              <label>{t('fields.water_availability')}</label>
              <div className="water-options-grid">
                {['Scarce', 'Medium', 'High', 'Very High'].map(opt => (
                  <button
                    key={opt} type="button"
                    onClick={() => setFormData({...formData, waterAvailability: opt})}
                    className={`water-btn ${formData.waterAvailability === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="save-field-btn" disabled={loading}>
            {loading ? t('fields.saving') : <><FiCheck /> {t('fields.save_btn')}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddField;