import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft, FiCheck } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import "./AddActivity.css";

/* ======================
    FIELD IMAGES
====================== */
import Arid from "../assets/arid.jpg";
import BlackSoil from "../assets/black.jpg";
import RedSoil from "../assets/red.jpg";
import Alluvial from "../assets/alluvial.jpg";
import Laterite from "../assets/laterite.jpg";
import Coastal from "../assets/coastal.jpg";
import Forest from "../assets/forest.jpg";

const fieldAvatars = [
  { name: "Arid", src: Arid },
  { name: "Black", src: BlackSoil },
  { name: "Red", src: RedSoil },
  { name: "Alluvial", src: Alluvial },
  { name: "Laterite", src: Laterite },
  { name: "Coastal", src: Coastal },
  { name: "Forest", src: Forest },
];

const soilDatabase = {
  Black: { crops: "Cotton, Soybean, Wheat", water: "Medium" },
  Red: { crops: "Millets, Pulses", water: "High" },
  Alluvial: { crops: "Rice, Sugarcane", water: "Very High" },
  Laterite: { crops: "Cashew, Coffee", water: "High" },
  Arid: { crops: "Bajra, Jowar", water: "Scarce" },
  Coastal: { crops: "Coconut, Rice", water: "Very High" },
  Forest: { crops: "Spices, Tea", water: "High" },
};

const EditPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  /* ======================
     FETCH DATA
  ====================== */
  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) return navigate("/login");

      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        const endpoint =
          type === "field"
            ? `http://localhost:3000/api/fields/${id}`
            : `http://localhost:3000/api/activities/${id}`;

        const res = await axios.get(endpoint, config);
        const data = res.data;

        // ✅ FIX: convert ISO → YYYY-MM-DD ONLY when loading activity
        if (type === "activity" && data.activityDate) {
          data.activityDate = data.activityDate.split("T")[0];
        }

        setFormData(data);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["cost", "quantity", "revenue"].includes(name)) {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSoilChange = (e) => {
    const soil = e.target.value;
    const soilData = soilDatabase[soil];

    setFormData({
      ...formData,
      soilType: soil,
      recommendedCrops: soilData?.crops || "",
      waterRequirement: soilData?.water || "",
      waterAvailability: soil === "Arid" ? "Scarce" : formData.waterAvailability,
    });
  };

  const selectAvatar = (src) => {
    setFormData({ ...formData, fieldImage: src });
  };

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    };

    const loadingToast = toast.loading("Updating...");

    try {
      const endpoint =
        type === "field"
          ? `http://localhost:3000/api/fields/${id}`
          : `http://localhost:3000/api/activities/${id}`;

      // ✅ FIX: convert date back to ISO ONLY for activity
      const payload =
        type === "activity" && formData.activityDate
          ? {
              ...formData,
              activityDate: new Date(
                formData.activityDate + "T00:00:00"
              ).toISOString(),
            }
          : formData;

      await axios.put(endpoint, payload, config);

      toast.success("Updated successfully!", {
        id: loadingToast,
        icon: "📝",
      });

      navigate(-1);
    } catch (err) {
      toast.error("Update failed", { id: loadingToast });
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="add-activity-container">
      <button onClick={() => navigate(-1)} className="back-btn-simple">
        <FiArrowLeft size={24} />
      </button>

      <h1>Edit {type === "field" ? "Field" : "Activity"}</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        {/* ================= FIELD EDIT UI ================= */}
        {type === "field" && (
          <>
            <div className="form-group-act">
              <label>Field Name</label>
              <input
                type="text"
                name="fieldName"
                value={formData.fieldName || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-act">
              <label>Area Size (Acres)</label>
              <input
                type="number"
                step="0.01"
                name="areaSize"
                value={formData.areaSize || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-act">
              <label>Soil Type</label>
              <select
                name="soilType"
                value={formData.soilType || ""}
                onChange={handleSoilChange}
              >
                <option value="">Select Soil</option>
                {Object.keys(soilDatabase).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group-act">
              <label>Current Crop</label>
              <input
                type="text"
                name="currentCrop"
                value={formData.currentCrop || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-act">
              <label>Field Image</label>
              <div className="avatar-grid">
                {fieldAvatars.map((img) => (
                  <div
                    key={img.name}
                    onClick={() => selectAvatar(img.src)}
                    className={`avatar-card ${
                      formData.fieldImage === img.src ? "selected" : ""
                    }`}
                  >
                    <img src={img.src} alt={img.name} />
                    {formData.fieldImage === img.src && <FiCheck />}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= ACTIVITY EDIT UI ================= */}
        {type === "activity" && (
          <>
            <div className="form-group-act">
              <label>Task Type</label>
              <input
                type="text"
                value={formData.activityType || formData.taskType || ""}
                readOnly
              />
            </div>

            <div className="form-group-act">
              <label>Planned Date</label>
              <input
                type="date"
                name="activityDate"
                value={formData.activityDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activityDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group-act">
              <label>Status</label>
              <select
                name="status"
                value={formData.status || "Planned"}
                onChange={handleChange}
              >
                <option value="Planned">⏳ Planned</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>

            <div className="row-split">
              <div className="form-group-act">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group-act">
                <label>Unit</label>
                <select
                  name="unit"
                  value={formData.unit || "kg"}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="L">Liters</option>
                  <option value="bags">Bags</option>
                </select>
              </div>
            </div>

            <div className="row-split">
              <div className="form-group-act">
                <label>Cost (₹)</label>
                <div className="input-with-icon cost-input">
                  <FaRupeeSign />
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-act">
                <label>Revenue (₹)</label>
                <div className="input-with-icon cost-input">
                  <FaRupeeSign />
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="submit-act-btn">
          <FiSave /> Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditPage;
