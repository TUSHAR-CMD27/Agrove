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
  
  productName: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  
  cost: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }, 
  
  notes: { type: String },

  // 📝 NEW FIELDS FOR BACKUP LOGIC
  isDeleted: {
    type: Boolean,
    default: false // This keeps the activity visible initially
  },
  deletedAt: {
    type: Date,
    default: null // This will store the timestamp when deleted
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Activity', activitySchema)