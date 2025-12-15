const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  googleId: { type: String }, // Google OAuth ID
  authProvider: { type: String, default: 'local' }, // 'local' or 'google'
  age: { type: Number },
  state: { type: String },
  district: { type: String },
  pincode: { type: String }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', UserSchema)