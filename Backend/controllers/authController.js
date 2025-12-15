const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, age, state, district, pincode } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate Custom User ID (Simple Logic)
    const count = await User.countDocuments();
    const user_id = `AG-2025-${100 + count + 1}`;

    // 4. Create User
    const user = await User.create({
      user_id,
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      age,
      state,
      district,
      pincode
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
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
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};