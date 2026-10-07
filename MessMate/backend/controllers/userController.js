import mongoose from 'mongoose';
import User from '../models/User.js';
import AuthorizedStudent from '../models/AuthorizedStudent.js';

const requireDatabase = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'MongoDB is unavailable. Student verification requires the database.' });
    return false;
  }
  return true;
};

const normalizeEmail = (email) => email?.trim().toLowerCase();
const gietEmailPattern = /^[^\s@]+@giet\.edu$/i;
const isDemoMode = () => {
  const projectId = (process.env.FIREBASE_PROJECT_ID || '').toLowerCase();
  return projectId.startsWith('demo-') || process.env.ALLOW_DEMO_REGISTRATION === 'true';
};

export const verifyAuthorizedStudent = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const studentId = req.body.studentId?.trim().toUpperCase();
    const collegeEmail = normalizeEmail(req.body.collegeEmail);

    if (isDemoMode()) {
      return res.json({
        verified: true,
        message: 'Demo mode is enabled: student verification has been bypassed for local development.',
        student: {
          studentId: studentId || 'DEMO-001',
          name: 'Demo Student',
          collegeEmail: collegeEmail || 'demo@giet.edu',
        },
      });
    }

    const student = await AuthorizedStudent.findOne({ studentId, collegeEmail }).select('studentId name collegeEmail status');
    if (student?.status === 'Inactive') {
      return res.status(403).json({ verified: false, message: 'This student is currently inactive. Please contact the Mess Administrator.' });
    }
    if (!student) {
      return res.status(403).json({ verified: false,
        message: 'Your Student ID and college email could not be verified. Please contact the Mess Administrator.',
      });
    }
    return res.json({
      verified: true,
      message: 'College student verified successfully',
      student: { studentId: student.studentId, name: student.name, collegeEmail: student.collegeEmail },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Student verification failed', error: error.message });
  }
};

export const getAuthorizedStudent = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const student = await AuthorizedStudent.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Authorized student not found' });
    return res.json({ student });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load authorized student', error: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      firebaseUid,
      name,
      email,
      phone,
      studentId,
      department,
      semester,
      hostel,
      roomNumber,
      foodPreference,
    } = req.body;

    if (!firebaseUid || !name || !email || !foodPreference) {
      return res.status(400).json({ message: 'Missing required registration fields' });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanStudentId = studentId ? studentId.trim() : '';

    if (!requireDatabase(res)) return;
    const existing = await User.findOne({ $or: [{ firebaseUid }, { email: cleanEmail }] });
    if (existing) return res.status(409).json({ message: 'User already registered with this email' });

    if (!isDemoMode()) {
      const match = await AuthorizedStudent.findOne({
        studentId: cleanStudentId.toUpperCase(),
        collegeEmail: cleanEmail,
        status: 'Active',
      });
      if (!match) {
        return res.status(403).json({
          message: 'Your Student ID and college email could not be verified. Please contact the Mess Administrator.',
        });
      }
    }

    const user = await User.create({
      firebaseUid,
      name,
      email: cleanEmail,
      phone,
      studentId: cleanStudentId.toUpperCase() || 'DEMO-001',
      department,
      semester,
      hostel,
      roomNumber,
      isVerified: true,
      foodPreference: foodPreference === 'non-vegetarian' ? 'non-vegetarian' : 'vegetarian',
      role: 'student',
    });

    if (!isDemoMode()) {
      const match = await AuthorizedStudent.findOne({
        studentId: cleanStudentId.toUpperCase(),
        collegeEmail: cleanEmail,
        status: 'Active',
      });
      if (match) {
        match.isRegistered = true;
        await match.save();
      }
    }

    return res.status(201).json({ message: 'College student verified. Registration successful!', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, hostel, roomNumber, foodPreference } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (hostel !== undefined) updates.hostel = hostel;
      if (roomNumber !== undefined) updates.roomNumber = roomNumber;
      if (foodPreference && ['vegetarian', 'non-vegetarian'].includes(foodPreference)) {
        updates.foodPreference = foodPreference;
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      return res.json({ message: 'Profile updated', user: sanitizeUser(user) });
    }

    const updated = { ...req.user, ...req.body };
    res.json({ message: 'Profile updated', user: sanitizeUser(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const { role, isVerified } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    const users = await User.find(filter).select('-__v').sort({ createdAt: -1 });
    return res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const { role, isActive, isVerified } = req.body;
    const updates = {};
    if (role && ['student', 'staff', 'admin'].includes(role)) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User updated', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

export const toggleStudentVerification = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: !!req.body.isVerified },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'Student verification updated', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Verification update failed', error: error.message });
  }
};

export const getAuthorizedStudents = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const { search, department, semester, status, isRegistered } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    if (isRegistered !== undefined) filter.isRegistered = isRegistered === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { collegeEmail: { $regex: search, $options: 'i' } },
      ];
    }
    const [students, total] = await Promise.all([
      AuthorizedStudent.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuthorizedStudent.countDocuments(filter),
    ]);
    return res.json({ students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load authorized students', error: error.message });
  }
};

export const createAuthorizedStudent = async (req, res) => {
  try {
    const { studentId, name, collegeEmail, department, semester, hostel, roomNumber, status } = req.body;
    if (!studentId || !name || !collegeEmail) {
      return res.status(400).json({ message: 'Student ID, Name, and College Email are required' });
    }
    if (!gietEmailPattern.test(normalizeEmail(collegeEmail))) {
      return res.status(400).json({ message: 'College email must use the @giet.edu domain' });
    }
    if (!department || !semester) {
      return res.status(400).json({ message: 'Department and Semester are required' });
    }

    if (!requireDatabase(res)) return;
    const student = await AuthorizedStudent.create({
      studentId: studentId.trim().toUpperCase(),
      name: name.trim(),
      collegeEmail: normalizeEmail(collegeEmail),
      department,
      semester,
      hostel,
      roomNumber,
      status: status || 'Active',
    });
    return res.status(201).json({ message: 'Authorized student created', student });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'student';
      return res.status(409).json({ message: `A student with this ${duplicateField} already exists` });
    }
    res.status(500).json({ message: 'Failed to create authorized student', error: error.message });
  }
};

export const updateAuthorizedStudent = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const updates = { ...req.body };
    if (updates.studentId) updates.studentId = updates.studentId.trim().toUpperCase();
    if (updates.collegeEmail) updates.collegeEmail = normalizeEmail(updates.collegeEmail);
    if (updates.collegeEmail && !gietEmailPattern.test(updates.collegeEmail)) {
      return res.status(400).json({ message: 'College email must use the @giet.edu domain' });
    }
    const student = await AuthorizedStudent.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: 'Authorized student entry not found' });
    return res.json({ message: 'Authorized student updated', student });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'student';
      return res.status(409).json({ message: `A student with this ${duplicateField} already exists` });
    }
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

export const deleteAuthorizedStudent = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;
    const student = await AuthorizedStudent.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Authorized student entry not found' });
    return res.json({ message: 'Authorized student entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

const sanitizeUser = (user) => ({
  id: user._id || user.id,
  firebaseUid: user.firebaseUid,
  name: user.name,
  email: user.email,
  phone: user.phone,
  studentId: user.studentId,
  department: user.department,
  semester: user.semester,
  hostel: user.hostel,
  roomNumber: user.roomNumber,
  isVerified: user.isVerified ?? false,
  foodPreference: user.foodPreference,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});
