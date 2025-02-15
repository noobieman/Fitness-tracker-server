const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Trainer ID
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Client ID
  exercises: [
    {
      name: { type: String, required: true }, // Exercise name
      sets: { type: Number, required: true }, // Number of sets
      reps: { type: Number, required: true }, // Number of reps
      weight: { type: Number }, // Weight (optional)
      duration: { type: String }, // Duration (e.g., "30 minutes")
    },
  ],
  suggestion: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);

