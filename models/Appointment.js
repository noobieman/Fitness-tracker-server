const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Cancelled'], default: 'Pending' },
  notes: String,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
