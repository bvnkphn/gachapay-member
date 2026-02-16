const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
// const emailService = require('./services/emailService');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// emailService.testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Add this for Google OAuth callback

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
