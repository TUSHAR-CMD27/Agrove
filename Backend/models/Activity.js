const mongoose = require('mongoose')

const activitySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    field: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Field'
  },
  activityType: {
    type: String,
    required: true,
    enum: ['Sowing', 'Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Other']
  },
  activityDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Planned', 'Completed'],
    default: 'Planned' 
  },
  
  // ✅ Detailed Tracking
  productName: { type: String }, // e.g., "Urea 46%" or "Wheat Seeds"
  quantity: { type: Number },    // e.g., 50 (kg/liters)
  unit: { type: String },        // e.g., kg, L, bags
  
  // ✅ Financials
  cost: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }, // Only for 'Harvesting' usually
  
  notes: { type: String }
}, {
  timestamps: true

})

module.exports = mongoose.model('Activity', activitySchema)