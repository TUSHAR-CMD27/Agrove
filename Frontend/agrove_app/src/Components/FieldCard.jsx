import React from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiMap } from 'react-icons/fi';
import './FieldCard.css';

const FieldCard = ({ field, onClick }) => {
  return (
    <motion.div 
      className="field-card"
      whileHover={{ y: -5 }}
      onClick={() => onClick(field._id)}
    >
      <div 
        className="card-image" 
        style={{ backgroundImage: `url(${field.fieldImage})` }}
      >
        <span className="crop-badge">{field.currentCrop}</span>
      </div>
      
      <div className="card-info">
        <h3>{field.fieldName}</h3>
        <div className="info-row">
          <span><FiMap /> {field.areaSize} Hectares</span>
          <span><FiDroplet /> {field.waterAvailability}</span>
        </div>
        <p className="soil-tag">Soil: {field.soilType}</p>
      </div>
    </motion.div>
  );
};

export default FieldCard;