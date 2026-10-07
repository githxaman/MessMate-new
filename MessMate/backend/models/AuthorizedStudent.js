import mongoose from 'mongoose';

const authorizedStudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    collegeEmail: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@giet\.edu$/i,
    },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    hostel: { type: String, default: '', trim: true },
    roomNumber: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    isRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

authorizedStudentSchema.index({ status: 1, isRegistered: 1 });
authorizedStudentSchema.index({ name: 'text', studentId: 'text', collegeEmail: 'text' });

export default mongoose.model('AuthorizedStudent', authorizedStudentSchema);
