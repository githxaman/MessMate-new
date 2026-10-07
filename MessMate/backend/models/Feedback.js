import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firebaseUid: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    foodQuality: { type: Number, min: 1, max: 5 },
    taste: { type: Number, min: 1, max: 5 },
    quantity: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'general'],
      default: 'general',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
