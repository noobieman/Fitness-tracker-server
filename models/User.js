const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User', 'Trainer'], required: true },
  profileDetails: {
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    weight: Number,
    height: Number,
  },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Trainer
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Reference to Users assigned to this Trainer
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

