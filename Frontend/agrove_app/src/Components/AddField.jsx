import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiArrowLeft, FiInfo, FiDroplet, FiImage } from 'react-icons/fi';
import './AddField.css';

// Import your images
import Arid from '../assets/arid.jpg';
import BlackSoil from '../assets/black.jpg';
import RedSoil from '../assets/red.jpg';
import Alluvial from '../assets/alluvial.jpg';
import Laterite from '../assets/laterite.jpg';
import Coastal from '../assets/coastal.jpg';
import Forest from '../assets/forest.jpg';

const AddField = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- 1. The Avatar Options ---
  const fieldAvatars = [
    { id: 'img1', name: 'Arid Land', src: Arid },
    { id: 'img2', name: 'Black Soil', src: BlackSoil },
    { id: 'img3', name: 'Red Soil', src: RedSoil },
    { id: 'img4', name: 'Alluvial', src: Alluvial },
    { id: 'img5', name: 'Laterite', src: Laterite },
    { id: 'img6', name: 'Coastal', src: Coastal },
    { id: 'img7', name: 'Forest', src: Forest },
  ];

  // Smart Logic Database
  const soilDatabase = {
    'Black': { crops: 'Cotton, Soybean, Jowar', water: 'Medium' },
    'Red': { crops: 'Groundnut, Bajra, Rice', water: 'High' },
    'Alluvial': { crops: 'Rice, Wheat, Sugarcane', water: 'Very High' },
    'Laterite': { crops: 'Mango, Cashew, Tea', water: 'High' },
    'Arid': { crops: 'Bajra, Jowar, Maize', water: 'Scarce' },
    'Coastal': { crops: 'Rice, Coconut, Banana', water: 'Very High' },
    'Forest': { crops: 'Coffee, Spices, Fruits', water: 'High' }
  };

  const [formData, setFormData] = useState({
    fieldName: '',
    areaSize: '',
    soilType: '',
    currentCrop: '',
    waterAvailability: 'Medium',
    fieldImage: fieldAvatars[0].src, // Default image
    recommendedCrops: '',
    waterRequirement: ''
  });

  const handleSoilChange = (e) => {
    const selectedSoil = e.target.value;
    const soilData = soilDatabase[selectedSoil];

    setFormData(prev => ({
      ...prev,
      soilType: selectedSoil,
      recommendedCrops: soilData ? soilData.crops : '',
      waterRequirement: soilData ? soilData.water : '',
      waterAvailability: selectedSoil === 'Arid' ? 'Scarce' : prev.waterAvailability
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. Handle Avatar Selection ---
  const selectAvatar = (src) => {
    setFormData({ ...formData, fieldImage: src });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:3000/api/fields', formData, config);
      navigate('/dashboard');
    } catch (err) {
      alert("Error adding field: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-field-container">
      {/* Dynamic Header Image */}
      <motion.div 
        className="field-header-image"
        style={{ backgroundImage: `url(${formData.fieldImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-overlay"></div>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="header-title">Add New Field</h1>
      </motion.div>

      <div className="field-form-wrapper">
        <form onSubmit={handleSubmit} className="field-form">
          
          {/* Section 1: Basic Details */}
          <div className="form-section">
            <h3 className="section-title">Plot Details</h3>
            <div className="form-group-af">
              <label>Field Name / ID</label>
              <input 
                type="text" name="fieldName" required
                value={formData.fieldName} onChange={handleChange}
                placeholder="e.g. North River Plot"
              />
            </div>

            <div className="form-row-af">
              <div className="form-group-af">
                <label>Area (Hectares)</label>
                <input 
                  type="number" step="0.01" name="areaSize" required
                  value={formData.areaSize} onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group-af">
                <label>Soil Type</label>
                <select 
                  name="soilType" required
                  value={formData.soilType} onChange={handleSoilChange}
                >
                  <option value="">Select Soil...</option>
                  {Object.keys(soilDatabase).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: Smart Insights Box is now here! */}
          {formData.soilType && (
            <motion.div 
              className="smart-insight-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiInfo className="insight-icon" />
              <div className="insight-text">
                <h4>Soil Analysis</h4>
                <p>Based on <strong>{formData.soilType}</strong> soil, recommended crops are: <span>{formData.recommendedCrops}</span>.</p>
                <div className="insight-meta">
                  <FiDroplet /> Typical Water Req: {formData.waterRequirement}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- Section 2: Avatar Selection Grid --- */}
          <div className="form-section">
            <h3 className="section-title flex items-center gap-2">
              <FiImage /> Select Field Avatar
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

          {/* Section 3: Crops */}
          <div className="form-section">
            <h3 className="section-title">Cultivation Info</h3>
            <div className="form-group-af">
              <label>Current Crop</label>
              <select 
                name="currentCrop" required
                value={formData.currentCrop} onChange={handleChange}
              >
                <option value="">Select Crop...</option>
                {['Jowar', 'Bajra', 'Wheat', 'Rice', 'Soybean', 'Mango', 'Banana', 'Sugarcane', 'Cotton', 'Gram', 'Maize', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group-af">
              <label>Water Availability</label>
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
            {loading ? 'Saving...' : <><FiCheck /> Save Field Record</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddField;