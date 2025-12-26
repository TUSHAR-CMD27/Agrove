

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // --- IMPORTED TOAST ---
import { 
  FiSave, FiArrowLeft, FiCalendar, FiPackage 
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import './AddActivity.css'; 

const EditPage = () => {
  const { type, id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  
  // Constant fields
  const [fieldName, setFieldName] = useState('');
  const [activityType, setActivityType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.token) return navigate('/login');

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      try {
        if(type === 'field') {
          const res = await axios.get(`http://localhost:3000/api/fields/${id}`, config);
          setFormData(res.data);
        } else {
          const res = await axios.get(`http://localhost:3000/api/activities/${id}`, config);
          setFormData(res.data);
          setFieldName(res.data.fieldName || ''); 
          setActivityType(res.data.activityType || '');
        }
      } catch (err) {
        console.error("Error loading data", err);
        // --- ADDED ERROR TOAST ---
        toast.error("Failed to load details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === 'cost' || name === 'quantity' || name === 'revenue') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if(!userInfo?.token) return navigate('/login');

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    // --- ADDED LOADING TOAST ---
    const loadingToast = toast.loading("Updating records...");

    try {
      const endpoint = type === 'field'
        ? `http://localhost:3000/api/fields/${id}`
        : `http://localhost:3000/api/activities/${id}`;
      
      await axios.put(endpoint, formData, config);
      
      // --- SUCCESS TOAST ---
      toast.success(`${type === 'field' ? 'Field' : 'Activity'} updated successfully!`, {
        id: loadingToast, // Replaces the loading toast
        icon: '📝'
      });

      navigate(-1);
    } catch (err) {
      console.error(err);
      // --- ERROR TOAST ---
      toast.error("Update failed. Check your connection.", {
        id: loadingToast // Replaces the loading toast
      });
    }
  };

  if(loading) return <div className="loading-screen">Loading Data...</div>;

  return (
    <div className="add-activity-container">
      <div className="activity-header-section">
        <button onClick={() => navigate(-1)} className="back-btn-simple">
          <FiArrowLeft size={24} />
        </button>
        <h1>Edit {type === 'field' ? 'Field Plot' : 'Planned Task'}</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {type === 'field' ? (
            <>
              <div className="form-group-act">
                <label>Field Name</label>
                <input type="text" name="fieldName" value={formData.fieldName || ''} readOnly />
              </div>
              <div className="form-group-act">
                <label>Current Crop</label>
                <input type="text" name="currentCrop" value={formData.currentCrop || ''} onChange={handleChange} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group-act">
                <label>Task Type</label>
                <input type="text" value={activityType} readOnly />
              </div>

              <div className="form-group-act">
                <label>Planned Date</label>
                <input type="date" name="activityDate" value={formData.activityDate?.split('T')[0] || ''} onChange={handleChange} />
              </div>
              
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

              <div className="form-group-act">
                <label>Product / Material</label>
                <input type="text" name="productName" value={formData.productName || ''} onChange={handleChange} />
              </div>

              <div className="row-split">
                <div className="form-group-act">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} />
                </div>
                <div className="form-group-act">
                  <label>Unit</label>
                  <select name="unit" value={formData.unit || 'kg'} onChange={handleChange}>
                    <option value="kg">kg</option>
                    <option value="L">Liters</option>
                    <option value="bags">Bags</option>
                    <option value="hours">Hours</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>

              <div className="row-split">
                <div className="form-group-act">
                  <label>Cost (₹)</label>
                  <div className="input-with-icon cost-input">
                    <FaRupeeSign />
                    <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group-act">
                  <label>Revenue (₹)</label>
                  <div className="input-with-icon cost-input">
                    <FaRupeeSign />
                    <input type="number" name="revenue" value={formData.revenue || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-group-act">
                <label>Notes / Instructions</label>
                <textarea name="notes" rows="3" value={formData.notes || ''} onChange={handleChange}></textarea>
              </div>
            </>
          )}

          <button type="submit" className="submit-act-btn">
            <FiSave /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPage;