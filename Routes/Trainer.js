const express = require('express');
const router = express.Router();
const { verifyTrainer } = require("../middleware/TrainerAuth"); // Middleware to verify admin access
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan')
const Nutrition = require('../models/Nutrition')
const Appointment = require("../models/Appointment");

//get user appointments
router.get('/appointments', verifyTrainer, async (req, res) => {
  try {
      const trainer = req.user;
      console.log("Trainer ID:", trainer._id); // Debugging output

      // Fetch appointments where trainerId matches
      const newAppointments = await Appointment.find({ trainerId: trainer._id })
          .populate("userId", "name email") // Populate user details
          .sort({ date: -1 });

      res.status(200).json({ appointments: newAppointments });
  } catch (error) { 
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Error fetching appointments', error });
  }
});

// update user appointment status
router.put('/appointments/:id', verifyTrainer, async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

      // Find the appointment by ID
      const appointment = await Appointment.findById(id); 

      if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found' });
      }

      // Update the appointment status
      appointment.status = status;

      // Save the updated appointment
      await appointment.save();

      res.status(200).json({ message: 'Appointment status updated successfully', appointment });
  } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ message: 'Error updating appointment status', error });
  }
});

// View Assigned Clients
router.get('/clients', verifyTrainer, async (req, res) => {
  try {
    // Trainer is already validated in the middleware
    const trainer = req.user;

    // Find clients assigned to the trainer
    const assignedClients = await User.find({ assignedTrainer: trainer._id }).select(
      'name email profileDetails'
    );

    // Respond with the list of assigned clients
    res.status(200).json({ clients: assignedClients });
  } catch (error) {
    console.error('Error fetching assigned clients:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// POST /workout-plans
router.post('/workout', verifyTrainer, async (req, res) => {
    try {
      const { clientId, exercises } = req.body;
  
      // Check if the trainer is assigned to the client
      const isClientAssigned = await User.findOne({ _id: clientId, assignedTrainer: req.user._id });
      if (!isClientAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this client.' });
      }
  
      const workoutPlan = new WorkoutPlan({
        trainer: req.user._id,
        client: clientId,
        exercises,
      });
  
      await workoutPlan.save();
      res.status(201).json({ message: 'Workout plan created successfully', workoutPlan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating workout plan', error });
    }
  });
  
  // GET /workout-plans/:clientId
router.get('/:clientId', verifyTrainer, async (req, res) => {
    try {
      const { clientId } = req.params;
  
      // Check if the trainer is assigned to the client
      const isClientAssigned = await User.findOne({ _id: clientId, assignedTrainer: req.user._id });
      if (!isClientAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this client.' });
      }
  
      const workoutPlans = await WorkoutPlan.find({ client: clientId }).populate('client', 'name email');
      res.status(200).json({ workoutPlans });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching workout plans', error });
    }
  });

  // PUT /workout-plans/:id
router.put('/:id', verifyTrainer, async (req, res) => {
    try {
      const { id } = req.params;
      const { exercises, suggestedExercises } = req.body;
  
      // Find the workout plan and check if the trainer owns it
      const workoutPlan = await WorkoutPlan.findOne({ _id: id, trainer: req.user._id });
      if (!workoutPlan) {
        return res.status(403).json({ message: 'Access denied. You cannot update this workout plan.' });
      }
  
      workoutPlan.exercises = exercises;
      workoutPlan.updatedAt = Date.now();
      workoutPlan.suggestion = suggestedExercises;
  
      await workoutPlan.save();
      res.status(200).json({ message: 'Workout plan updated successfully', workoutPlan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating workout plan', error });
    }
  });
  

  // DELETE /workout-plans/:id
router.delete('/:id', verifyTrainer, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the workout plan exists and belongs to the trainer
      const workoutPlan = await WorkoutPlan.findOne({ _id: id, trainer: req.user._id });
      if (!workoutPlan) {
        return res.status(403).json({ message: 'Access denied. You cannot delete this workout plan.' });
      }
  
      await workoutPlan.deleteOne();
      res.status(200).json({ message: 'Workout plan deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting workout plan', error });
    }
  });

 

// Get nutrition plans for users assigned to a trainer
router.get('/user-diet/:userId', verifyTrainer, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = userId;
        const trainer = req.user._id;

        // Check if the trainer is assigned to the user
        const isUserAssigned = await User.findOne({ _id: user, assignedTrainer: trainer });
        if (!isUserAssigned) {
            return res.status(403).json({ message: 'Access denied. You are not assigned to this user.' });
        }

        // Fetch nutrition plans for the user
        const nutritionPlans = await Nutrition.find({ userId: user });

        res.status(200).json({ nutritionPlans });   

    } catch (error) {
        console.error("Error fetching nutrition plans:", error);
        res.status(500).json({ message: "Error fetching nutrition plans", error });
    }
});







module.exports = router;

