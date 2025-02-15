const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'], required: true },
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  transactionId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
