const express = require("express");
const router = express.Router();
const {verifyUser} = require("../middleware/userAuth"); // Middleware to authenticate users
const User = require("../models/User");
const WorkoutPlan = require('../models/WorkoutPlan');
const Appointment = require("../models/Appointment");
const Nutrition = require("../models/Nutrition");

// Route to fetch all users
router.get("/user/users", verifyUser, async (req, res) => {
  try {
    // Extract query parameters for filtering, pagination, and searching
    const { page = 1, limit = 10, role, search } = req.query;

    // Build query object
    const query = {};
    if (role) query.role = role; // Filter by role (e.g., "user", "trainer", "admin")
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
        { email: { $regex: search, $options: "i" } } // Case-insensitive search by email
      ];
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);

    // Return response
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Update Profile
router.put("/update-profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from the authenticated user
    const { age, gender, weight, height } = req.body; // Destructure profile details from request body

    // Validate gender
    const validGenders = ["Male", "Female", "Other"];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value." });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profileDetails.age": age,
          "profileDetails.gender": gender,
          "profileDetails.weight": weight,
          "profileDetails.height": height,
        },
      },
      { new: true, runValidators: true } // Return the updated user and validate inputs
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      profile: updatedUser.profileDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error.", error });
  }
});

// Get User Profile Details
router.get('/profile', verifyUser, async (req, res) => {
    try {
      // `req.user` is set by the authMiddleware
      const userId = req.user._id;
  
      // Find user by ID and return their profile details
      const user = await User.findById(userId).select('name email profileDetails');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ profile: user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Route to view assigned workout plan
router.get('/workout-plan', verifyUser, async (req, res) => {
    try {
      const userId = req.user._id; // Extract user ID from the request object (set by authMiddleware)
  console.log(userId)
      // Find the workout plan assigned to the user
      const workoutPlan = await WorkoutPlan.find({ client: userId });
  
      if (!workoutPlan) {
        return res.status(404).json({ message: 'No workout plan assigned to this user.' });
      }
  
      // Respond with the workout plan details
      res.status(200).json({ workoutPlan });
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
  // book appointment
  router.post("/book", verifyUser, async (req, res) => {
    try {
      const { trainerId, date } = req.body;
  
      // Validate inputs
      if (!trainerId || !date) {
        return res.status(400).json({ message: "Trainer ID and date are required." });
      }
  
      const newAppointment = new Appointment({
        userId: req.user._id,
        trainerId,
        date,
        status: "Pending",
      });
  
      await newAppointment.save();
      res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
  
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Server error." });
    }
  })

//  View user appointments
router.get("/my-appointments", verifyUser, async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.user._id })
        
  
      res.status(200).json({ appointments });
  
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Server error." });
    }
  });
  
  // Cancel appointment
  // ❌ Cancel an appointment
router.delete("/cancel/:id", verifyUser, async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);
  
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }
  
      if (appointment.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized to cancel this appointment." });
      }
  
      if (appointment.status !== "Pending") {
        return res.status(400).json({ message: "Only pending appointments can be canceled." });
      }
  
      await appointment.deleteOne();
      res.status(200).json({ message: "Appointment canceled successfully." });
  
    } catch (error) {
      console.error("Error canceling appointment:", error);
      res.status(500).json({ message: "Server error." });
    }
  });
  
// Add a meal entry
router.post("/add-meal", verifyUser, async (req, res) => {
    try {
        const { mealType, foodItems } = req.body;

        // Calculate total calories
        const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);

        // Find the user's assigned trainer
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const assignedTrainer = user.assignedTrainer || null; // Ensure assignedTrainer exists

        // Find or update Nutrition entry for today
        const mealEntry = await Nutrition.findOneAndUpdate(
            { userId: req.user._id, trainerId: assignedTrainer, createdAt: new Date().toISOString().split("T")[0] }, 
            { $push: { meals: { mealType, foodItems, totalCalories } } },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Meal added successfully", mealEntry });
    } catch (error) {
        console.error("Error adding meal:", error);
        res.status(500).json({ message: "Server error" });
    }
});
  // Get user's nutrition history
router.get("/my-meals", verifyUser, async (req, res) => {
    try {
      const meals = await Nutrition.find({ userId: req.user._id }).sort({ date: -1 });
  
      res.status(200).json({ meals });
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Server error" });
    }
  })

  // Delete a meal entry
router.delete("/delete-meal/:mealId", verifyUser, async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.user._id;

    // Check if the meal exists
    const nutrition = await Nutrition.findOne({ 
      _id: mealId });

   
    if (!nutrition) { 
      return res.status(404).json({ message: "Meal not found" });
    }

    // Check if the meal belongs to the user
    if (nutrition.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this meal" });
    }

    // Delete the meal entry
    await Nutrition.findByIdAndDelete(nutrition);
    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).json({ message: "Server error" });
  }
});
  


module.exports = router;
