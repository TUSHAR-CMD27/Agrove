const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB()

const app = express();
// Middleware
app.use(cors({origin :'http://localhost:5173'}));
app.use(express.json());

//routes
const authROute = require('./routes/authRoutes')

app.use('/api/auth', authROute)
app.use('/api/fields', require('./routes/fieldRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is running at PORT = ${PORT}`)
})