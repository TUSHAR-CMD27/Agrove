const mongoose = require('mongoose');

const fieldSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  fieldName: { type: String, required: true },
  areaSize: { type: Number, required: true }, 
  
  soilType: { 
    type: String, 
    enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Forest', 'Arid', 'Coastal'],
    required: true 
  },
  fieldImage: { type: String, required: true },

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
  
  recommendedCrops: { type: String },
  waterRequirement: { type: String },

  // 📝 NEW FIELDS FOR BACKUP LOGIC
  isDeleted: {
    type: Boolean,
    default: false // Field is active when created
  },
  deletedAt: {
    type: Date,
    default: null // Empty until the farmer clicks delete
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Field', fieldSchema);