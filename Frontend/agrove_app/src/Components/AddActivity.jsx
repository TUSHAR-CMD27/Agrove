


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRupeeSign } from "react-icons/fa";
import { FiSave, FiArrowLeft, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './AddActivity.css';

const AddActivity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  
  // Logic: List of allowable actions
  const [allowedTypes, setAllowedTypes] = useState(['Sowing']); 

  // Form State
  const [formData, setFormData] = useState({
    fieldId: '',
    activityType: 'Sowing',
    activityDate: new Date().toISOString().split('T')[0],
    status: 'Planned', // Default to Planned (Timer Icon)
    productName: '',
    quantity: '',
    unit: 'kg',
    cost: '',
    revenue: '',
    notes: ''
  });

  // 1. Fetch User's Fields on Mount
  useEffect(() => {
    const fetchFields = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return navigate('/login');
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('http://localhost:3000/api/fields', config);
        setFields(res.data);
        // Default to first field if available
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, fieldId: res.data[0]._id }));
        }
      } catch (err) {
        console.error("Error fetching fields", err);
      }
    };
    fetchFields();
  }, [navigate]);

  // 2. Check History to Enforce Sequence
  useEffect(() => {
    if (!formData.fieldId) return;

    const checkHistory = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const res = await axios.get(`http://localhost:3000/api/activities/${formData.fieldId}`, config);
        const logs = res.data;

        // Logic: Has Sowing happened? Has Harvesting happened (reset)?
        const hasSowing = logs.some(l => l.activityType === 'Sowing');
        const hasHarvest = logs.some(l => l.activityType === 'Harvesting');

        // If no sowing yet, OR if harvesting was done (cycle reset) -> Restrict to Sowing
        // Note: In a real app, you'd check dates to see if the Harvest is *after* the Sowing.
        if (!hasSowing || (hasHarvest && hasSowing)) { 
          // Simplification: If Harvest exists, we assume cycle is done, start new Sowing.
           // However, if we just harvested, we might want to allow Sowing again.
           // Let's stick to: If NO Sowing found, force Sowing.
           if(!hasSowing) {
               setAllowedTypes(['Sowing']);
               setFormData(prev => ({ ...prev, activityType: 'Sowing' }));
           } else {
               // If Sowing exists, check if Harvest is the LATEST action
               if(logs.length > 0 && logs[0].activityType === 'Harvesting'){
                   setAllowedTypes(['Sowing']); // Start new cycle
                   setFormData(prev => ({ ...prev, activityType: 'Sowing' }));
               } else {
                   setAllowedTypes(['Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']);
                   // Default to next logical step? Or just keep current selection
               }
           }
        } else {
           // Sowing exists and we haven't harvested yet
           setAllowedTypes(['Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']);
        }

      } catch (err) {
        console.error("Error checking history");
        // Fallback: Allow all if error
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
      await axios.post('http://localhost:3000/api/activities', formData, config);
      navigate(`/field/${formData.fieldId}`);
    } catch (err) {
      alert("Error adding activity: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
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
        <h1>Log Farm Activity</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          {/* Field Selection */}
          <div className="form-group-act">
            <label>Select Field Plot</label>
            <select 
              name="fieldId" 
              value={formData.fieldId} 
              onChange={handleChange}
              required
            >
              {fields.map(field => (
                <option key={field._id} value={field._id}>{field.fieldName} ({field.currentCrop})</option>
              ))}
            </select>
          </div>

          <div className="row-split">
            {/* Activity Type (Dynamic based on allowed types) */}
            <div className="form-group-act">
              <label>Task Type</label>
              <select name="activityType" value={formData.activityType} onChange={handleChange}>
                {allowedTypes.map(type => (
                   <option key={type} value={type}>
                     {type === 'Sowing' ? '🌱 ' : 
                      type === 'Irrigation' ? '💧 ' : 
                      type === 'Fertilizer' ? '🧪 ' : 
                      type === 'Pesticide' ? '🛡️ ' : 
                      type === 'Harvesting' ? '🌾 ' : '📝 '} 
                     {type}
                   </option>
                ))}
              </select>
              {/* Warning if restricted */}
              {allowedTypes.length === 1 && allowedTypes[0] === 'Sowing' && (
                <small className="warning-text">
                  <FiAlertCircle /> Start a new cycle with Sowing.
                </small>
              )}
            </div>

            {/* Date */}
            <div className="form-group-act">
              <label>Date</label>
              <div className="input-with-icon">
                <FiCalendar />
                <input 
                  type="date" 
                  name="activityDate" 
                  value={formData.activityDate} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Status Selection (Important for Timer Icon) */}
          <div className="form-group-act">
            <label>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={{ 
                borderColor: formData.status === 'Planned' ? '#fbbf24' : '#39ff14',
                color: formData.status === 'Planned' ? '#fbbf24' : '#39ff14'
              }}
            >
              <option value="Planned">⏳ Planned (Show Timer)</option>
              <option value="Completed">✅ Completed (Show Check)</option>
            </select>
          </div>

          {/* Product Details */}
          <div className="form-group-act">
            <label>Product / Material Used</label>
            <input 
              type="text" 
              name="productName" 
              placeholder="e.g. Urea, Wheat Seeds, Water Pump Diesel"
              value={formData.productName} 
              onChange={handleChange} 
            />
          </div>

          <div className="row-split">
            <div className="form-group-act">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                placeholder="0.00" 
                value={formData.quantity} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group-act">
              <label>Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange}>
                <option value="kg">kg</option>
                <option value="L">Liters</option>
                <option value="bags">Bags</option>
                <option value="hours">Hours</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          {/* Financials */}
          <div className="row-split">
            <div className="form-group-act">
              <label>Total Cost (₹)</label>
              <div className="input-with-icon cost-input">
                <FaRupeeSign/>
                <input 
                  type="number" 
                  name="cost" 
                  placeholder="0.00" 
                  value={formData.cost} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {formData.activityType === 'Harvesting' && (
              <div className="form-group-act">
                <label className="revenue-label">Revenue Generated (₹)</label>
                <div className="input-with-icon revenue-input">
                  <FaRupeeSign />
                  <input 
                    type="number" 
                    name="revenue" 
                    placeholder="0.00" 
                    value={formData.revenue} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group-act">
            <label>Notes (Optional)</label>
            <textarea 
              name="notes" 
              rows="3" 
              placeholder="Any observation about pests, weather, or labor..."
              value={formData.notes} 
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="submit-act-btn" disabled={loading}>
            {loading ? 'Saving...' : <><FiSave /> Save Activity Log</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddActivity;