import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiMapPin, FiCalendar, FiHash, FiCheckCircle } from 'react-icons/fi';
import './Authentication.css';

const Onboarding = () => {
    const nav = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        age: '',
        state: '',
        district: '',
        pincode: ''
    });

    // 1. Load the data we got from Google (Name, Email, ID)
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        } else {
            nav('/login'); // Kick them out if they aren't logged in
        }
    }, [nav]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 2. Send the missing details to your backend to update the user
            // Note: You need a backend route like: PUT /api/auth/update-profile/:id
            const res = await axios.put(
                `http://localhost:3000/api/auth/update-profile/${userInfo._id}`,
                formData
            );

            // 3. Update local storage with the complete data
            const completeUser = { ...userInfo, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(completeUser));

            // 4. Finally, go to Dashboard
            nav('/dashboard');
            window.location.reload();

        } catch (err) {
            alert("Error updating profile: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!userInfo) return null; // Wait for data to load

    return (
        <div className="auth-container">
            <div className="auth-blob blob-auth-1"></div>

            <motion.div
                className="auth-card wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="auth-header">
                    <h2 className="auth-title">One Last Step!</h2>
                    <p className="auth-subtitle">
                        Hi <strong>{userInfo.name}</strong>, please complete your profile details.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">

                        {/* --- FIELDS FROM GOOGLE (READ ONLY) --- */}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-wrapper disabled-wrapper">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    value={userInfo.name}
                                    className="auth-input"
                                    disabled // Locked
                                />
                                <FiCheckCircle className="valid-icon" color="green" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrapper disabled-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    value={userInfo.email}
                                    className="auth-input"
                                    disabled // Locked
                                />
                                <FiCheckCircle className="valid-icon" color="green" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">User ID</label>
                            <div className="input-wrapper disabled-wrapper">
                                <FiHash className="input-icon" />
                                <input
                                    type="text"
                                    value={userInfo._id || "Generating..."}
                                    className="auth-input"
                                    disabled // Locked
                                />
                            </div>
                        </div>

                        {/* --- MISSING FIELDS (USER MUST FILL) --- */}

                        <div className="form-group">
                            <label className="form-label">Age <span style={{ color: 'red' }}>*</span></label>
                            <div className="input-wrapper">
                                <FiCalendar className="input-icon" />
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="auth-input"
                                    placeholder="24"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">State <span style={{ color: 'red' }}>*</span></label>
                            <div className="input-wrapper">
                                <FiMapPin className="input-icon" />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="auth-input"
                                    placeholder="Maharashtra"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">District <span style={{ color: 'red' }}>*</span></label>
                            <div className="input-wrapper">
                                <FiMapPin className="input-icon" />
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="auth-input"
                                    placeholder="Thane"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Pincode <span style={{ color: 'red' }}>*</span></label>
                            <div className="input-wrapper">
                                <FiHash className="input-icon" />
                                <input
                                    type="number"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="auth-input"
                                    placeholder="421202"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Completing Profile..." : "Complete & Go to Dashboard"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Onboarding;









