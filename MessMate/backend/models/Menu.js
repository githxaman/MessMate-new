import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'common'],
    default: 'common',
  },
  estimatedQuantity: { type: String, trim: true },
});

const menuSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    day: { type: String, required: true, trim: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    items: [menuItemSchema],
    mealCategory: {
      type: String,
      enum: ['common', 'vegetarian', 'non-vegetarian'],
      default: 'common',
    },
    description: { type: String, trim: true },
    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

menuSchema.index({ date: 1, mealType: 1 }, { unique: true });

export default mongoose.model('Menu', menuSchema);
