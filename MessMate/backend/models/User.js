import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    demoPasswordHash: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    studentId: { type: String, trim: true, sparse: true },
    department: { type: String, trim: true },
    semester: { type: String, trim: true },
    hostel: { type: String, trim: true },
    roomNumber: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    foodPreference: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian'],
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
