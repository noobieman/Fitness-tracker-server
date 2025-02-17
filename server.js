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
  origin: "https://fitness-tracker-front-end-ivory.vercel.app" || "http://localhost:3000", // Fallback to local during development
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

app.get("/", (req, res) => {
  res.send("Welcome to the Fitness Management API!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
