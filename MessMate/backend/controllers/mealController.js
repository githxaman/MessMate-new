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
    const targetEnd = endOfDay(date);
    let students = [];
    let onLeave = [];
    let checkIns = [];

    if (mongoose.connection.readyState === 1) {
      students = await User.find({ role: 'student', isActive: true })
        .select('firebaseUid foodPreference')
        .lean();
      onLeave = await LeaveRequest.find({
        status: 'approved',
        fromDate: { $lte: targetDate },
        toDate: { $gte: targetDate },
      }).distinct('firebaseUid');
      checkIns = await MealAttendance.find({
        date: { $gte: targetDate, $lte: targetEnd },
        mealType: { $in: meals },
      }).select('firebaseUid mealType status foodPreference').lean();
    } else {
      checkIns = mockAttendance.filter(
        (record) => record.date >= targetDate && record.date <= targetEnd && meals.includes(record.mealType)
      );
    }

    const activeStudentIds = new Set(students.map((student) => student.firebaseUid));
    const studentsOnLeave = new Set(onLeave.filter((uid) => activeStudentIds.has(uid)));
    const studentPreferences = new Map(students.map((student) => [student.firebaseUid, student.foodPreference]));
    const totalStudents = students.length;
    const safetyMarginSetting = Number.parseFloat(process.env.SAFETY_MARGIN_PERCENT || '5');
    const safetyMargin = Number.isFinite(safetyMarginSetting) ? safetyMarginSetting : 5;

    const results = meals.map((meal) => {
      const mealResponses = checkIns.filter((record) => {
        if (record.mealType !== meal || studentsOnLeave.has(record.firebaseUid)) return false;
        return mongoose.connection.readyState !== 1 || activeStudentIds.has(record.firebaseUid);
      });
      const respondedStudents = new Set(mealResponses.map((record) => record.firebaseUid));
      const taking = mealResponses.filter((record) => record.status === 'taking');
      const notTakingCount = mealResponses.filter((record) => record.status === 'not-taking').length;
      const leaveCount = studentsOnLeave.size;
      const notResponded = Math.max(0, totalStudents - leaveCount - respondedStudents.size);
      const vegetarian = taking.filter(
        (record) => studentPreferences.get(record.firebaseUid) === 'vegetarian' ||
          (!studentPreferences.has(record.firebaseUid) && record.foodPreference === 'vegetarian')
      ).length;
      const nonVegetarian = taking.filter(
        (record) => studentPreferences.get(record.firebaseUid) === 'non-vegetarian' ||
          (!studentPreferences.has(record.firebaseUid) && record.foodPreference === 'non-vegetarian')
      ).length;
      const expectedFromCheckIns = taking.length;
      const recommended = Math.ceil(expectedFromCheckIns * (1 + safetyMargin / 100));

      return {
        mealType: meal,
        date: targetDate,
        totalRegistered: totalStudents,
        onApprovedLeave: leaveCount,
        expectedStudents: expectedFromCheckIns,
        confirmedEating: expectedFromCheckIns,
        notTaking: notTakingCount,
        notResponded,
        vegetarian,
        nonVegetarian,
        safetyMarginPercent: safetyMargin,
        recommendedPreparation: recommended,
        basedOn: 'meal-check-ins',
      };
    });

    res.json({ demand: results, date: targetDate });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate demand', error: error.message });
  }
};
