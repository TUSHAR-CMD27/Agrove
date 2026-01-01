const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, age, state, district, pincode } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const count = await User.countDocuments();
    const user_id = `AG-2025-${100 + count + 1}`;

    const user = await User.create({
      user_id, name, email, password: hashedPassword,
      authProvider: 'local', age, state, district, pincode,
    });

    if (user) {
      res.status(201).json({
        _id: user.id, name: user.name, email: user.email,
        age: user.age, state: user.state, district: user.district,
        pincode: user.pincode, token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Guard: Only block if user has NO password and is marked as Google
    if (user && user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ message: 'Please login with Google' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, name: user.name, email: user.email,
        age: user.age, state: user.state, district: user.district,
        pincode: user.pincode, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { sub: googleId, email, name } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      const count = await User.countDocuments();
      const user_id = `AG-2025-${100 + count + 1}`;
      user = await User.create({ user_id, name, email, googleId, authProvider: 'google' });
    }

    res.json({
      _id: user.id, name: user.name, email: user.email,
      age: user.age, state: user.state, district: user.district,
      pincode: user.pincode, token: generateToken(user._id)
    });
  } catch (error) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { age, state, district, pincode, password } = req.body;

    const updateData = { age, state, district, pincode };

    // ✅ NEW: Hash password if provided during onboarding
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
      authProvider: updatedUser.authProvider, age: updatedUser.age,
      state: updatedUser.state, district: updatedUser.district,
      pincode: updatedUser.pincode, token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during profile update.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};