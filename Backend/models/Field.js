const mongoose = require('mongoose');

const fieldSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  fieldName: { type: String, required: true },
  areaSize: { type: Number, required: true }, 
  soilType: { type: String, required: true },
  fieldImage: { type: String, required: true },
  currentCrop: { type: String, required: true }, 
  
  // Bin Logic
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  
  // TTL Index: Auto-deletes document when current time passes expireAt
  expireAt: { 
    type: Date, 
    default: null, 
    index: { expires: 0 } 
  }
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);