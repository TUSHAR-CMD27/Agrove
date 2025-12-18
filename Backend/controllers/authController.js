const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Before (in your original code):
// const { name, email, password, age, state, district, pincode } = req.body;
// ...
// const user = await User.create({
//   // ... other fields
//   age, state, district, pincode // <-- REMOVE THESE
// });

// ----------------------------------------------------
// ✅ UPDATE 1: Modified exports.signup
// ----------------------------------------------------
exports.signup = async (req, res) => {
  try {
    // 1. Only de-structure essential account creation fields
    const { name, email, password, age, state, district, pincode } = req.body;

    // 1. Check if user exists (remains the same)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash Password (remains the same)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate Custom User ID (remains the same)
    const count = await User.countDocuments();
    const user_id = `AG-2025-${100 + count + 1}`;

    // 4. Create User (DO NOT pass age, state, etc.)
    const user = await User.create({
      user_id,
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      age,
      state,
      district,
      pincode,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        state: user.state,
        district: user.district,
        pincode: user.pincode,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for user email
    const user = await User.findOne({ email });

    // 2. Check if user uses OAuth (no password)
    if (user && user.authProvider === 'google') {
      return res.status(401).json({ message: 'Please login with Google' });
    }

    // 3. Check password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        state: user.state,
        district: user.district,
        pincode: user.pincode,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      const count = await User.countDocuments();
      const user_id = `AG-2025-${100 + count + 1}`;

      user = await User.create({
        user_id,
        name,
        email,
        googleId,
        authProvider: 'google'
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      state: user.state,
      district: user.district,
      pincode: user.pincode,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// ----------------------------------------------------
// ✅ UPDATE 2: Add exports.updateProfile
// ----------------------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id; // User ID from the URL parameter
    const { age, state, district, pincode } = req.body;

    // 1. Find and update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { age, state, district, pincode },
      { new: true, runValidators: true } // {new: true} returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Return the updated data to the frontend
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      authProvider: updatedUser.authProvider,
      // Include all the newly saved profile data
      age: updatedUser.age,
      state: updatedUser.state,
      district: updatedUser.district,
      pincode: updatedUser.pincode,
      token: generateToken(updatedUser._id) // Keep the token fresh/available
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
};

// Add this to your authController.js
exports.getProfile = async (req, res) => {
  try {
    // Find user by MongoDB _id (which is passed in the URL)
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the full user data back
    res.json(user);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};