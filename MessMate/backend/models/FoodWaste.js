import mongoose from 'mongoose';

const foodWasteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    foodPrepared: { type: Number, required: true, min: 0 },
    studentsServed: { type: Number, required: true, min: 0 },
    remainingFood: { type: Number, default: 0, min: 0 },
    foodWasted: { type: Number, default: 0, min: 0 },
    expectedStudents: { type: Number, default: 0 },
    vegServed: { type: Number, default: 0 },
    nonVegServed: { type: Number, default: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

foodWasteSchema.index({ date: 1, mealType: 1 }, { unique: true });

export default mongoose.model('FoodWaste', foodWasteSchema);
