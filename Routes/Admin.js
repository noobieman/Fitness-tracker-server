const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming the User schema is in the models folder
const { verifyAdmin } = require("../middleware/authmiddleware"); // Middleware to verify admin access

// Route to fetch all users
router.get("/admin/users", verifyAdmin, async (req, res) => {
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


// Edit User (Admin only)
router.put("/users/:id", verifyAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, email, role } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email, role },
        { new: true, runValidators: true } // Return the updated document and validate the input
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ message: "User updated successfully.", user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  });

// Deleting user 
  router.delete("/users/:id", verifyAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
  
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  });
  
// promot or demote users
  router.patch("/users/:id/role", verifyAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body; // Role to assign or unassign
  
      // Validate input
      const validRoles = ["User", "Trainer", "Admin"]; // Define allowed roles
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role provided." });
      }
  
      // Find and update the user's role
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({
        message: `User role updated to '${role}' successfully.`,
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  });
  

// Route to assign a trainer to a user
router.put('/assign-trainer',verifyAdmin, async (req, res) => {
  const { userId, trainerId } = req.body;

  try {
    // Ensure both the user and trainer exist
    const user = await User.findById(userId);
    const trainer = await User.findById(trainerId);

    if (!user || user.role !== 'User') {
      return res.status(404).json({ message: 'User not found or is not a client' });
    }

    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Assign trainer to user
    user.assignedTrainer = trainerId;
    await user.save();

    // Add user to trainer's client list
    trainer.clients.push(userId);
    await trainer.save();

    res.status(200).json({ message: 'Trainer assigned successfully', user, trainer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

//Remove assigned trainer
router.put('/remove-trainer/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and validate
    const user = await User.findById(userId);
    if (!user || user.role !== 'User') {
      return res.status(404).json({ message: 'User not found or is not a client' });
    }

    if (!user.assignedTrainer) {
      return res.status(400).json({ message: 'No trainer assigned to this user' });
    }

    // Remove user from trainer's client list
    const trainer = await User.findById(user.assignedTrainer);
    if (trainer) {
      trainer.clients = trainer.clients.filter(clientId => clientId.toString() !== userId);
      await trainer.save();
    }

    // Remove trainer assignment from user
    user.assignedTrainer = null;
    await user.save();

    res.status(200).json({ message: 'Trainer removed successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

  
// Route to get all users with their assigned trainers
router.get('/users-with-trainers', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'User' }).populate('assignedTrainer', 'name');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

  
module.exports = router;
