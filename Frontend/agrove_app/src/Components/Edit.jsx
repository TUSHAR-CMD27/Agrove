import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"; // 1. Import hook
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

const EditPage = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

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
            ? `${import.meta.env.VITE_API_URL}/api/fields/${id}`
            : `${import.meta.env.VITE_API_URL}/api/activities/${id}`;

        const res = await axios.get(endpoint, config);
        const data = res.data;

        if (type === "activity" && data.activityDate) {
          data.activityDate = data.activityDate.split("T")[0];
        }

        setFormData(data);
      } catch (err) {
        toast.error(t("edit.error_load"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, navigate, t]);

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
    // Map soil to database values (keep keys in English for DB logic)
    setFormData({
      ...formData,
      soilType: soil,
    });
  };

  const selectAvatar = (src) => {
    setFormData({ ...formData, fieldImage: src });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const loadingToast = toast.loading(t("edit.updating"));

    try {
      const endpoint =
        type === "field"
          ? `${import.meta.env.VITE_API_URL}/api/fields/${id}`
          : `${import.meta.env.VITE_API_URL}/api/activities/${id}`;

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

      toast.success(t("edit.success_msg"), { id: loadingToast, icon: "📝" });
      navigate(-1);
    } catch (err) {
      toast.error(t("edit.error_update"), { id: loadingToast });
    }
  };

  if (loading) return <div className="loading-screen">{t("dash.loading")}</div>;

  return (
    <div className="add-activity-container">
      <button onClick={() => navigate(-1)} className="back-btn-simple">
        <FiArrowLeft size={24} />
      </button>

      <h1>
        {t("edit.title")} {type === "field" ? t("nav.add_field") : t("nav.add_activity")}
      </h1>

      <form className="form-card" onSubmit={handleSubmit}>
        {/* ================= FIELD EDIT UI ================= */}
        {type === "field" && (
          <>
            <div className="form-group-act">
              <label>{t("fields.label_name")}</label>
              <input
                type="text"
                name="fieldName"
                value={formData.fieldName || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-act">
              <label>{t("fields.label_area")}</label>
              <input
                type="number"
                step="0.01"
                name="areaSize"
                value={formData.areaSize || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-act">
              <label>{t("fields.label_soil")}</label>
              <select
                name="soilType"
                value={formData.soilType || ""}
                onChange={handleSoilChange}
              >
                <option value="">{t("fields.select_soil")}</option>
                {["Black", "Red", "Alluvial", "Laterite", "Arid", "Coastal", "Forest"].map((s) => (
                  <option key={s} value={s}>{t(`${s}`)}</option>
                ))}
              </select>
            </div>

            <div className="form-group-act">
              <label>{t("fields.current_crop")}</label>
              <input
                type="text"
                name="currentCrop"
                value={formData.currentCrop || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group-act">
              <label>{t("fields.select_avatar")}</label>
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
              <label>{t("activity.task_type")}</label>
              <input
                type="text"
                value={t(`activity.types.${(formData.activityType || formData.taskType || "").toLowerCase()}`)}
                readOnly
              />
            </div>

            <div className="form-group-act">
              <label>{t("activity.label_date")}</label>
              <input
                type="date"
                name="activityDate"
                value={formData.activityDate || ""}
                onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              />
            </div>

            <div className="form-group-act">
              <label>{t("activity.label_status")}</label>
              <select name="status" value={formData.status || "Planned"} onChange={handleChange}>
                <option value="Planned">{t("activity.status_planned")}</option>
                <option value="Completed">{t("activity.status_completed")}</option>
              </select>
            </div>

            <div className="row-split">
              <div className="form-group-act">
                <label>{t("activity.label_quantity")}</label>
                <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleChange} />
              </div>

              <div className="form-group-act">
                <label>{t("activity.label_unit")}</label>
                <select name="unit" value={formData.unit || "kg"} onChange={handleChange}>
                  <option value="kg">{t("activity.units.kg")}</option>
                  <option value="L">{t("activity.units.L")}</option>
                  <option value="bags">{t("activity.units.bags")}</option>
                </select>
              </div>
            </div>

            <div className="row-split">
              <div className="form-group-act">
                <label>{t("activity.label_cost")}</label>
                <div className="input-with-icon cost-input">
                  <FaRupeeSign />
                  <input type="number" name="cost" value={formData.cost || ""} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group-act">
                <label>{t("activity.label_revenue")}</label>
                <div className="input-with-icon cost-input">
                  <FaRupeeSign />
                  <input type="number" name="revenue" value={formData.revenue || ""} onChange={handleChange} />
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="submit-act-btn">
          <FiSave /> {t("edit.save_btn")}
        </button>
      </form>
    </div>
  );
};

export default EditPage;