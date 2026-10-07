import mongoose from 'mongoose';

const mealAttendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firebaseUid: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    foodPreference: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian'],
      required: true,
    },
    status: {
      type: String,
      enum: ['taking', 'not-taking'],
      default: 'taking',
    },
    checkedInAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mealAttendanceSchema.index({ firebaseUid: 1, date: 1, mealType: 1 }, { unique: true });

export default mongoose.model('MealAttendance', mealAttendanceSchema);
