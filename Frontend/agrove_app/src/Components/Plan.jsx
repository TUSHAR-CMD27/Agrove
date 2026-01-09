import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaRupeeSign } from "react-icons/fa";
import { FiSave, FiArrowLeft, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import './AddActivity.css';

const PlanTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  
  // Logic: List of allowable actions (matching AddActivity logic)
  const [allowedTypes, setAllowedTypes] = useState(['Sowing', 'Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']); 

  // Extract pre-selected data from navigation state
  const preSelectedFieldId = location.state?.fieldId || '';
  const preSelectedFieldName = location.state?.fieldName || '';

  // Form State including all fields from AddActivity
  const [formData, setFormData] = useState({
    fieldId: preSelectedFieldId,
    activityType: 'Sowing',
    activityDate: new Date().toISOString().split('T')[0],
    status: 'Planned', // Default to Planned for this page
    productName: '',
    quantity: '',
    unit: 'kg',
    cost: '',
    revenue: '',
    notes: ''
  });

  // Fetch fields if none are pre-selected
  useEffect(() => {
    const fetchFields = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fields`, config);
        setFields(res.data);
      } catch (err) {
        console.error("Error fetching fields:", err);
      }
    };
    if (!preSelectedFieldId) fetchFields();
  }, [preSelectedFieldId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/activities`, formData, config);
      navigate(`/field/${formData.fieldId}`);
    } catch (err) {
      alert("Error planning task: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-activity-container">
      <div className="dash-blob blob-dash-1"></div>
      
      <div className="activity-header-section">
        <button onClick={() => navigate(-1)} className="back-btn-simple">
          <FiArrowLeft size={24} />
        </button>
        <h1>Plan Future Task</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          {/* Field Selection Logic */}
          <div className="form-group-act">
            <label>Field Plot</label>
            {preSelectedFieldId ? (
              <div className="read-only-field-box">
                <strong>📍 {preSelectedFieldName}</strong>
                <input type="hidden" name="fieldId" value={formData.fieldId} />
              </div>
            ) : (
              <select name="fieldId" value={formData.fieldId} onChange={handleChange} required>
                <option value="">Select a Plot</option>
                {fields.map(field => (
                  <option key={field._id} value={field._id}>{field.fieldName}</option>
                ))}
              </select>
            )}
          </div>

          <div className="row-split">
            {/* Task Type */}
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
            </div>

            {/* Planned Date */}
            <div className="form-group-act">
              <label>Planned Date</label>
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

          {/* Product Details */}
          <div className="form-group-act">
            <label>Product / Material to be Used</label>
            <input 
              type="text" 
              name="productName" 
              placeholder="e.g. Urea, Wheat Seeds"
              value={formData.productName} 
              onChange={handleChange} 
            />
          </div>

          <div className="row-split">
            {/* Quantity */}
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
            {/* Unit */}
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

          <div className="row-split">
            {/* Financials: Cost */}
            <div className="form-group-act">
              <label>Estimated Cost (₹)</label>
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

            {/* Financials: Revenue (Only for Harvesting) */}
            {formData.activityType === 'Harvesting' && (
              <div className="form-group-act">
                <label className="revenue-label">Expected Revenue (₹)</label>
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
            <label>Notes / Instructions</label>
            <textarea 
              name="notes" 
              rows="3" 
              placeholder="Any specific instructions for this planned task..."
              value={formData.notes} 
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="submit-act-btn" disabled={loading}>
            {loading ? 'Scheduling...' : <><FiSave /> Schedule Task</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanTask;