const mongoose = require('mongoose');

const fieldSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  fieldName: { type: String, required: true },
  areaSize: { type: Number, required: true }, // In Hectares
  
  // Updated Soil Enum
  soilType: { 
    type: String, 
    enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Forest', 'Arid', 'Coastal'],
    required: true 
  },
  fieldImage: { type: String, required: true },

  // ✅ Updated Crop List
  currentCrop: { 
    type: String,
    enum: [
      'Jowar', 'Bajra', 'Wheat', 'Rice', 'Soybean', 
      'Mango', 'Banana', 'Sugarcane', 'Cotton', 'Gram', 
      'Maize', 'Other'
    ],
    required: true
  }, 

  waterAvailability: { 
    type: String, 
    enum: ['Scarce', 'Medium', 'High', 'Very High'],
    default: 'Medium'
  },
  
  // Smart Data (Auto-filled by Frontend)
  recommendedCrops: { type: String },
  waterRequirement: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Field', fieldSchema);