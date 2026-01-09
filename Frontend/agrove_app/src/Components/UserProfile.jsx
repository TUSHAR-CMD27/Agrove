import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiMail, FiHash, FiCalendar, FiLogOut, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import farmImg from '../assets/f13.png';
import './UserProfile.css';

const UserProfile = () => {
  const { t } = useTranslation(); // 2. Initialize translation
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const storedUser = JSON.parse(userInfo);
        try {
          const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile/${storedUser._id}`, config);
          const updatedUserData = { ...res.data, token: storedUser.token };
          setUser(updatedUserData);
          localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
        } catch (err) {
          setUser(storedUser);
          toast.error(t('profile.offline_msg'));
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [t]);

  const handleLogout = () => {
    toast.success(t('profile.logout_success'));
    localStorage.removeItem('userInfo');
    setTimeout(() => { navigate('/'); }, 1000);
  };

  if (!loading && !user) {
    return (
      <div className="profile-container locked-mode">
        <div className="profile-split">
            <div className="profile-image-side" style={{ backgroundImage: `url(${farmImg})` }}>
                <div className="profile-image-overlay"></div>
                <div className="brand-overlay">
                    <h1>AGROVE</h1>
                    <p>{t('profile.access_denied')}</p>
                </div>
            </div>
            <div className="profile-info-side">
                <motion.div className="access-denied-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="lock-icon-wrapper"><FiLock size={40} /></div>
                    <h2>{t('profile.guest_mode')}</h2>
                    <p>{t('profile.establish_connection')}</p>
                    <Link to="/login" className="profile-btn-primary">{t('nav.login')} <FiArrowRight /></Link>
                </motion.div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-split">
        
        {/* LEFT SIDE: AESTHETIC IMAGE */}
        <div className="profile-image-side" style={{ backgroundImage: `url(${farmImg})` }}>
          <div className="profile-image-overlay"></div>
          <motion.div 
            className="brand-overlay"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1>{t('profile.hero_title')}</h1>
            <p>{t('profile.hero_subtitle')}</p>
          </motion.div>
        </div>

        {/* RIGHT SIDE: PROFILE DATA */}
        <div className="profile-info-side">
          <motion.div 
            className="profile-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="profile-header">
              <div className="avatar-square">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="header-info">
                <h1 className="profile-name">{user?.name}</h1>
                <span className="profile-id">UID // {user?._id?.slice(-8).toUpperCase()}</span>
                <span className="status-tag"><FiShield size={12}/> {t('profile.verified')}</span>
              </div>
            </div>

            <div className="details-grid">
              <DetailItem icon={<FiMail />} label={t('profile.label_network')} value={user?.email} />
              <DetailItem icon={<FiMapPin />} label={t('profile.label_coordinates')} value={`${user?.district}, ${user?.state}`} />
              <DetailItem icon={<FiHash />} label={t('profile.label_zip')} value={user?.pincode} />
              <DetailItem icon={<FiCalendar />} label={t('profile.label_age')} value={`${user?.age} ${t('profile.cycles')}`} />
            </div>

            <button onClick={handleLogout} className="logout-btn">
              {t('profile.terminate_btn')} <FiLogOut />
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="detail-row">
    <div className="detail-icon">{icon}</div>
    <div className="detail-text">
      <span className="label">{label}</span>
      <span className="value">{value || "NOT_SET"}</span>
    </div>
  </div>
);

export default UserProfile;