import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import { useTranslation } from 'react-i18next'; // 1. Import
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  FiArrowLeft, FiTrash2, 
  FiEdit, FiSettings 
} from 'react-icons/fi';
import farmBg from '../assets/f17.png'; 
import './FieldDetails.css';

const FieldDetails = () => {
  const { t } = useTranslation(); // 2. Initialize
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showEditMenu, setShowEditMenu] = useState(false);
  
  const [stats, setStats] = useState({
    progress: 0,
    totalCost: 0,
    totalRevenue: 0,
    currentStage: 'Planning'
  });

  const COLORS = ['#39ff14', '#111'];

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) return navigate('/login');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      try {
        const [fieldRes, actRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/fields/${id}`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/activities?fieldId=${id}`, config)
        ]);
        setField(fieldRes.data);
        setActivities(actRes.data);
        calculateStats(actRes.data);
      } catch (err) { 
        toast.error(t('details.error_load')); 
      }
    };
    fetchData();
  }, [id, navigate, t]);

  const calculateStats = (logs) => {
    const cost = logs.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const revenue = logs.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const completed = logs.filter(l => l.status === 'Completed');
    
    let progress = 0;
    let stage = "Planning";

    if (completed.some(l => l.activityType === 'Sowing')) { progress = 25; stage = "Sowed"; }
    if (completed.some(l => l.activityType === 'Irrigation')) { progress = 50; stage = "Growing"; }
    if (completed.some(l => l.activityType === 'Fertilizer')) { progress = 75; stage = "Maturing"; }
    if (completed.some(l => l.activityType === 'Harvesting')) { progress = 100; stage = "Harvested"; }

    setStats({ progress, totalCost: cost, totalRevenue: revenue, currentStage: stage });
  };

  const handleDeleteActivity = async (activityId) => {
    toast((t_toast) => (
      <div className="custom-confirm-toast">
        <p>{t('details.confirm_delete_id')} {activityId.slice(-4)}</p>
        <div className="toast-actions">
          <button className="confirm" onClick={async () => {
            toast.dismiss(t_toast.id);
            try {
              const userInfo = JSON.parse(localStorage.getItem('userInfo'));
              const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
              await axios.patch(`${import.meta.env.VITE_API_URL}/api/activities/${activityId}/delete`, {}, config);
              const updated = activities.filter(act => act._id !== activityId);
              setActivities(updated);
              calculateStats(updated);
              toast.success(t('details.data_purged'));
            } catch (err) { toast.error(t('details.access_denied')); }
          }}>{t('details.yes')}</button>
          <button className="cancel" onClick={() => toast.dismiss(t_toast.id)}>{t('details.no')}</button>
        </div>
      </div>
    ));
  };

  if (!field) return <div className="loading-screen">{t('details.initializing')}</div>;

  const pieData = [{ value: stats.progress }, { value: 100 - stats.progress }];
  const netProfit = stats.totalRevenue - stats.totalCost;

  return (
    <div className="field-detail-container" style={{ backgroundImage: `url(${farmBg})` }}>
      <div className="detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn-detail">
          <FiArrowLeft size={15}/>
        </button>
        <div className="header-content">
          <span className="crop-pill">{t(`fields.crops_list.${field.currentCrop}`) || field.currentCrop}</span>
          <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            {field.fieldName}
          </motion.h1>
        </div>
      </div>

      <div className="detail-content-grid">
        <div className="left-panel">
          <motion.div className="info-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h3>{t('details.progress_metrics')}</h3>
            <div className="chart-row">
              <div className="chart-mini big-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={80} outerRadius={105} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      <Cell fill="#39ff14" />
                      <Cell fill="#111" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="center-text bigger">{stats.progress}%</div>
              </div>
              <div className="progress-labels">
                <p>{t('details.label_stage')}: <span className="neon-text">{t(`details.stages.${stats.currentStage.toLowerCase()}`)}</span></p>
                <p>{t('details.label_status')}: <span className="neon-text">{t('details.operational')}</span></p>
              </div>
            </div>
          </motion.div>

          <motion.div className="info-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3>{t('details.financial_arch')}</h3>
            <div className="finance-horizontal-bars">
              <div className="bar-group">
                <div className="bar-header"><span>{t('details.op_cost')}</span><span>₹{stats.totalCost.toLocaleString()}</span></div>
                <div className="bar-track"><motion.div className="bar-fill cost" initial={{ width: 0 }} animate={{ width: '100%' }} /></div>
              </div>

              <div className="bar-group">
                <div className="bar-header"><span>{t('details.proj_revenue')}</span><span>₹{stats.totalRevenue.toLocaleString()}</span></div>
                <div className="bar-track">
                  <motion.div className="bar-fill revenue" initial={{ width: 0 }} animate={{ width: stats.totalRevenue > 0 ? (stats.totalRevenue / (stats.totalCost || 1) * 50) + '%' : '0%' }} />
                </div>
              </div>

              <div className="net-profit-footer">
                <label>{t('details.net_gain')}</label>
                <span className={`profit-val ${netProfit >= 0 ? 'positive' : 'negative'}`}>
                  ₹{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="right-panel">
          <div className="activity-header">
            <h3>{t('details.ops_history')}</h3>
            <button className="add-log-btn" onClick={() => navigate('/plan')}>+ {t('details.add_log')}</button>
          </div>
          
          <div className="terminal-timeline">
            {activities.length === 0 ? (
              <p className="no-logs">{t('details.no_data')}</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="terminal-log-item">
                  <div className={`status-line ${act.status === 'Completed' ? 'done' : 'pending'}`} />
                  <div className="log-body">
                    <div className="log-main">
                      <span className="log-type">{t(`activity.types.${act.activityType.toLowerCase()}`)}</span>
                      <span className="log-cost">₹{act.cost}</span>
                    </div>
                    <span className="log-date">{new Date(act.activityDate).toLocaleDateString()} // {act.status === 'Completed' ? t('details.status_ok') : t('details.status_pending')}</span>
                  </div>
                  <div className="log-actions">
                    <button onClick={() => navigate(`/edit/activity/${act._id}`)}><FiEdit /></button>
                    <button onClick={() => handleDeleteActivity(act._id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="edit-fab-container">
        <AnimatePresence>
          {showEditMenu && (
            <motion.div className="fab-options-horizontal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="fab-option-wrapper">
                <button className="fab-sub-btn field-color" onClick={() => navigate(`/edit/field/${id}`)}><FiSettings /></button>
                <span className="fab-label-bottom">{t('details.fab_field')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button className={`fab-main-btn ${showEditMenu ? 'active' : ''}`} onClick={() => setShowEditMenu(!showEditMenu)} whileTap={{ scale: 0.9 }}>
          <FiEdit />
        </motion.button>
      </div>
    </div>
  );
};

export default FieldDetails;