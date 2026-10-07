import mongoose from 'mongoose';
import MealAttendance from '../models/MealAttendance.js';
import User from '../models/User.js';
import LeaveRequest from '../models/LeaveRequest.js';

const mockAttendance = [];

const startOfDay = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const isOnApprovedLeave = async (firebaseUid, date) => {
  if (mongoose.connection.readyState !== 1) return false;
  const d = startOfDay(date);
  const leave = await LeaveRequest.findOne({
    firebaseUid,
    status: 'approved',
    fromDate: { $lte: d },
    toDate: { $gte: d },
  });
  return !!leave;
};

export const checkIn = async (req, res) => {
  try {
    const { mealType, status, date } = req.body;
    if (!mealType) {
      return res.status(400).json({ message: 'Meal type is required' });
    }

    const checkDate = startOfDay(date);

    if (await isOnApprovedLeave(req.firebaseUid, checkDate)) {
      return res.status(400).json({ message: 'You are on approved leave for this date' });
    }

    const mealStatus = status === 'not-taking' ? 'not-taking' : 'taking';

    if (mongoose.connection.readyState === 1) {
      const existing = await MealAttendance.findOne({
        firebaseUid: req.firebaseUid,
        date: checkDate,
        mealType,
      });

      if (existing) {
        existing.status = mealStatus;
        existing.checkedInAt = new Date();
        await existing.save();
        return res.json({ message: 'Meal check updated', attendance: existing });
      }

      const attendance = await MealAttendance.create({
        userId: req.user._id,
        firebaseUid: req.firebaseUid,
        date: checkDate,
        mealType,
        foodPreference: req.user.foodPreference || 'vegetarian',
        status: mealStatus,
      });

      return res.status(201).json({ message: 'Meal check-in successful', attendance });
    }

    // Dev Fallback Mode
    const existingMock = mockAttendance.find(
      (m) => m.firebaseUid === req.firebaseUid && m.mealType === mealType
    );

    if (existingMock) {
      existingMock.status = mealStatus;
      return res.json({ message: 'Meal check updated', attendance: existingMock });
    }

    const newMock = {
      _id: `65000000000000000000${Date.now().toString().slice(-4)}`,
      userId: req.user._id,
      firebaseUid: req.firebaseUid,
      date: checkDate,
      mealType,
      foodPreference: req.user.foodPreference || 'vegetarian',
      status: mealStatus,
    };
    mockAttendance.push(newMock);

    res.status(201).json({ message: 'Meal check-in successful', attendance: newMock });
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { date, firebaseUid, mealType } = req.query;
      const filter = {};

      if (date) {
        filter.date = { $gte: startOfDay(date), $lte: endOfDay(date) };
      }

      if (req.user.role === 'student') {
        filter.firebaseUid = req.firebaseUid;
      } else if (firebaseUid) {
        filter.firebaseUid = firebaseUid;
      }

      if (mealType) filter.mealType = mealType;

      const attendance = await MealAttendance.find(filter)
        .populate('userId', 'name email foodPreference studentId')
        .sort({ date: -1, mealType: 1 });

      return res.json({ attendance });
    }

    res.json({ attendance: mockAttendance });
  } catch (error) {
    res.json({ attendance: mockAttendance });
  }
};

export const getMyTodayAttendance = async (req, res) => {
  try {
    const today = startOfDay();
    let attendance = [];

    if (mongoose.connection.readyState === 1) {
      attendance = await MealAttendance.find({
        firebaseUid: req.firebaseUid,
        date: { $gte: today, $lte: endOfDay() },
      });
    } else {
      attendance = mockAttendance.filter((m) => m.firebaseUid === req.firebaseUid);
    }

    const meals = ['breakfast', 'lunch', 'dinner'].map((mealType) => {
      const record = attendance.find((a) => a.mealType === mealType);
      return {
        mealType,
        checked: !!record,
        status: record?.status || null,
      };
    });

    res.json({ meals, date: today });
  } catch (error) {
    const meals = ['breakfast', 'lunch', 'dinner'].map((mealType) => ({
      mealType,
      checked: false,
      status: null,
    }));
    res.json({ meals, date: startOfDay() });
  }
};

export const getExpectedDemand = async (req, res) => {
  try {
    const { date, mealType } = req.query;
    const targetDate = startOfDay(date);
    const meals = mealType ? [mealType] : ['breakfast', 'lunch', 'dinner'];

    let totalStudents = 200;
    let leaveCount = 25;
    let checkIns = [];

    if (mongoose.connection.readyState === 1) {
      totalStudents = await User.countDocuments({ role: 'student', isActive: true });

      const onLeave = await LeaveRequest.find({
        status: 'approved',
        fromDate: { $lte: targetDate },
        toDate: { $gte: targetDate },
      }).distinct('firebaseUid');

      leaveCount = onLeave.length;
    }

    const baseExpected = Math.max(0, totalStudents - leaveCount);
    const safetyMargin = parseFloat(process.env.SAFETY_MARGIN_PERCENT || 5);

    const results = meals.map((meal) => {
      const expectedFromCheckIns = baseExpected;
      const recommended = Math.ceil(expectedFromCheckIns * (1 + safetyMargin / 100));

      return {
        mealType: meal,
        date: targetDate,
        totalRegistered: totalStudents,
        onApprovedLeave: leaveCount,
        expectedStudents: expectedFromCheckIns,
        vegetarian: Math.round(baseExpected * 0.65),
        nonVegetarian: Math.round(baseExpected * 0.35),
        safetyMarginPercent: safetyMargin,
        recommendedPreparation: recommended,
        basedOn: 'registered-minus-leave',
      };
    });

    res.json({ demand: results, date: targetDate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate demand', error: error.message });
  }
};
