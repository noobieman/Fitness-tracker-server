const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    const validRoles = ["Admin", "User", "Trainer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

//login for Admin
router.post('/login/Admin', async (req, res) =>{
  try{
    const {email, password} = req.body;

    //check if user exist
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }

    //compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(401).json({message: "Wrong password"})
    }

    //check user is admin  
    if(user.role !== 'Admin'){
      return res.status(403).json({message: 'Admin only'})
    }

    //generate jwt token 
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
   // Decode and log the token for debugging
   console.log("Generated Token:", token);
   console.log("Decoded Token:", jwt.verify(token, process.env.SECRET_KEY));

   res.status(200).json({ message: "Login successful", token });

} catch(error){
  res.status(500).json({ message: "Error logging in" });
}
});

//login for Trainer
router.post('/login/Trainer', async (req, res) =>{
  try{
    const {email, password} = req.body;

    //check if user exist
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }

    //compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(401).json({message: "Wrong password"})
    }

    //check user is trainer  
    if(user.role !== 'Trainer'){
      return res.status(403).json({message: 'Trainer only'})
    }

    //generate jwt token 
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
   // Decode and log the token for debugging
   console.log("Generated Token:", token);
   console.log("Decoded Token:", jwt.verify(token, process.env.SECRET_KEY));

   res.status(200).json({ message: "Login successful", token });

} catch(error){
  res.status(500).json({ message: "Error logging in" });
}
});

//login for User
router.post('/login/User', async (req, res) =>{
  try{
    const {email, password} = req.body;

    //check if user exist
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }

    //compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(401).json({message: "Wrong password"})
    }

    //check user is trainer  
    if(user.role !== 'User'){
      return res.status(403).json({message: 'User only'})
    }

    //generate jwt token 
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
   // Decode and log the token for debugging
   console.log("Generated Token:", token);
   console.log("Decoded Token:", jwt.verify(token, process.env.SECRET_KEY));

   res.status(200).json({ message: "Login successful", token });

} catch(error){
  res.status(500).json({ message: "Error logging in" });
}
});



module.exports = router;
