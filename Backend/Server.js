const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize Database
connectDB();

const app = express();

// Middleware
// FIX: origins are now explicitly allowed and credentials enabled for tokens
// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://agrove.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoute = require('./routes/authRoutes');
const fieldRoute = require('./routes/fieldRoutes');
const activityRoute = require('./routes/activityRoutes');


app.use('/api/auth', authRoute);
app.use('/api/fields', fieldRoute);
app.use('/api/activities', activityRoute);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server is running at PORT = ${PORT}`);
});