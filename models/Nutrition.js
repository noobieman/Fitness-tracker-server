const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  meals: [
    {
      mealType: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], required: true },
      foodItems: [{ name: String, calories: Number, protein: Number, carbs: Number, fats: Number }],
      totalCalories: Number,
    }
  ],
  trainerSuggestions: { type: String },
  totalCalories: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
