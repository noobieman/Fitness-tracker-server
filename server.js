const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./Routes/auth'); // Replace with the correct path to the file
const admin = require('./Routes/Admin');
const trainer = require('./Routes/Trainer')
const user = require('./Routes/User');
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json()); // Ensure JSON parsing
// Middleware
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // Allow frontend
  credentials: true, // Allow cookies & headers
}));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Use Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', admin);
app.use('/api/trainer', trainer);
app.use('/api/user', user);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
