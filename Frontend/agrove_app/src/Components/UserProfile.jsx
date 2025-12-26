import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMapPin, FiMail, FiHash, FiCalendar, FiLogOut, FiLock, FiArrowRight } from 'react-icons/fi';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Auth & Data Check ---
  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = localStorage.getItem('userInfo');

      if (userInfo) {
        const storedUser = JSON.parse(userInfo);

        try {
          // 2. Fetch fresh data from MongoDB using the User's ID
          // Added Authorization header to ensure the request is protected
          const config = {
            headers: { Authorization: `Bearer ${storedUser.token}` }
          };
          
          const res = await axios.get(
            `http://localhost:3000/api/auth/profile/${storedUser._id}`, 
            config
          );

          // 3. FIX: Merge fresh DB data with the existing token
          // This prevents the token from being lost, which was causing the logout.
          const updatedUserData = {
            ...res.data,
            token: storedUser.token 
          };

          setUser(updatedUserData);

          // 4. Update localStorage with merged data
          localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
        } catch (err) {
          console.error("Error fetching fresh profile:", err);
          // Fallback to local data if fetch fails
          setUser(storedUser);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // --- 2. Logout Logic ---
  const handleLogout = () => {
    localStorage.removeItem('userInfo'); //
    navigate('/');
    window.location.reload();
  };

  // --- 3. Render: Locked State (Not Logged In) ---
  if (!loading && !user) {
    return (
      <div className="profile-container locked-mode">
        <div className="profile-blob blob-profile-1"></div>
        <div className="profile-blob blob-profile-2"></div>

        <motion.div
          className="access-denied-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="lock-icon-wrapper">
            <FiLock size={40} />
          </div>
          <h2>Guest Mode</h2>
          <p>Please log in to view and manage your profile settings.</p>
          <Link to="/login" className="profile-btn-primary">
            Login Now <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- 4. Render: Profile (Logged In) ---
  return (
    <div className="profile-container">
      <div className="profile-blob blob-profile-1"></div>
      <div className="profile-blob blob-profile-3"></div>

      <div className="profile-content">
        <motion.div
          className="profile-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="profile-header">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="header-info">
              <h1 className="profile-name">{user?.name || "Agrove User"}</h1>
              <span className="profile-id">ID: {user?.user_id || "N/A"}</span>
              <span className="status-badge">Active Farmer</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="details-grid">
            <DetailItem
              icon={<FiMail />}
              label="Email Address"
              value={user?.email}
            />
            <DetailItem
              icon={<FiMapPin />}
              label="Location"
              value={`${user?.district || 'Unknown'}, ${user?.state || 'India'}`}
            />
            <DetailItem
              icon={<FiHash />}
              label="Pincode"
              value={user?.pincode || "---"}
            />
            <DetailItem
              icon={<FiCalendar />}
              label="Age"
              value={user?.age ? `${user.age} Years` : "---"}
            />
          </div>

          <div className="action-footer">
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut /> Logout
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="detail-row">
    <div className="detail-icon">{icon}</div>
    <div className="detail-text">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  </div>
);

export default UserProfile;