const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    // trainerId is a reference to the User model
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: [String], // Example: ['Weight Loss', 'Bodybuilding', 'Cardio']
  experience: { type: Number, required: true }, // Number of years
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Trainer', trainerSchema);
