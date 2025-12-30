import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiMapPin, FiCalendar, FiHash, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import farmImg from '../assets/f12.png';
import './Onboard.css';

const Onboarding = () => {
    const nav = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        age: '',
        state: '',
        district: '',
        pincode: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        } else {
            nav('/login');
        }
    }, [nav]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put(
                `http://localhost:3000/api/auth/update-profile/${userInfo._id}`,
                formData
            );
            const completeUser = { ...userInfo, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(completeUser));
            nav('/dashboard');
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!userInfo) return null;

    return (
        <div className="auth-container">
            <div className="auth-split">
                
                {/* LEFT SIDE: AESTHETIC IMAGE */}
                <div className="auth-image-side" style={{ backgroundImage: `url(${farmImg})` }}>
                    <div className="auth-image-overlay"></div>
                    <motion.div 
                        className="brand-overlay"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1>AGROVE</h1>
                        <p>Your profile, perfected.</p>
                    </motion.div>
                </div>

                {/* RIGHT SIDE: ONBOARDING FORM */}
                <div className="auth-form-side">
                    <motion.div 
                        className="auth-card wide"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="auth-header">
                            <h2 className="auth-title">Complete Profile</h2>
                            <p className="auth-subtitle">Hi <strong>{userInfo.name}</strong>, help us tailor your dashboard.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                {/* LOCKED FIELDS */}
                                <div className="form-group">
                                    <label className="form-label">Email (Verified)</label>
                                    <div className="input-wrapper disabled-wrapper">
                                        <FiMail className="input-icon" />
                                        <input type="text" value={userInfo.email} className="auth-input" disabled />
                                        <FiCheckCircle className="valid-icon" color="#39ff14" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <div className="input-wrapper">
                                        <FiCalendar className="input-icon" />
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="auth-input" placeholder="e.g. 28" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <div className="input-wrapper">
                                        <FiMapPin className="input-icon" />
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="auth-input" placeholder="Maharashtra" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">District</label>
                                    <div className="input-wrapper">
                                        <FiMapPin className="input-icon" />
                                        <input type="text" name="district" value={formData.district} onChange={handleChange} className="auth-input" placeholder="Nashik" required />
                                    </div>
                                </div>

                                <div className="form-group full-span">
                                    <label className="form-label">Pincode</label>
                                    <div className="input-wrapper">
                                        <FiHash className="input-icon" />
                                        <input type="number" name="pincode" value={formData.pincode} onChange={handleChange} className="auth-input" placeholder="422001" required />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? "SYNCHRONIZING..." : "FINALIZE PROFILE"} <FiArrowRight />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;