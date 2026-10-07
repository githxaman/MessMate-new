import mongoose from 'mongoose';
import FoodWaste from '../models/FoodWaste.js';

const mockRecords = [
  {
    _id: '650000000000000000000070',
    date: new Date(),
    mealType: 'lunch',
    foodPrepared: 180,
    studentsServed: 165,
    remainingFood: 15,
    foodWasted: 5,
    expectedStudents: 175,
    vegServed: 110,
    nonVegServed: 55,
  },
];

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

export const createFoodWaste = async (req, res) => {
  try {
    const {
      date,
      mealType,
      foodPrepared,
      studentsServed,
      remainingFood,
      foodWasted,
      expectedStudents,
      vegServed,
      nonVegServed,
      notes,
    } = req.body;

    if (!mealType || foodPrepared == null || studentsServed == null) {
      return res.status(400).json({ message: 'Meal type, food prepared, and students served are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const record = await FoodWaste.findOneAndUpdate(
        { date: startOfDay(date), mealType },
        {
          date: startOfDay(date),
          mealType,
          foodPrepared,
          studentsServed,
          remainingFood: remainingFood ?? 0,
          foodWasted: foodWasted ?? 0,
          expectedStudents: expectedStudents ?? 0,
          vegServed: vegServed ?? 0,
          nonVegServed: nonVegServed ?? 0,
          notes,
          recordedBy: req.user._id,
        },
        { upsert: true, new: true }
      );

      return res.status(201).json({ message: 'Food waste record saved', record });
    }

    const newRecord = {
      _id: `65000000000000000000${Date.now().toString().slice(-4)}`,
      date: startOfDay(date),
      mealType,
      foodPrepared,
      studentsServed,
      remainingFood: remainingFood ?? 0,
      foodWasted: foodWasted ?? 0,
      expectedStudents: expectedStudents ?? 0,
      vegServed: vegServed ?? 0,
      nonVegServed: nonVegServed ?? 0,
      notes,
    };
    mockRecords.push(newRecord);

    res.status(201).json({ message: 'Food waste record saved', record: newRecord });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save record', error: error.message });
  }
};

export const getFoodWaste = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { date, period } = req.query;
      let filter = {};

      if (date) {
        filter.date = { $gte: startOfDay(date), $lte: endOfDay(date) };
      } else if (period === 'week') {
        const start = startOfDay();
        start.setDate(start.getDate() - 7);
        filter.date = { $gte: start };
      } else if (period === 'month') {
        const start = startOfDay();
        start.setMonth(start.getMonth() - 1);
        filter.date = { $gte: start };
      }

      const records = await FoodWaste.find(filter).sort({ date: -1, mealType: 1 });
      return res.json({ records });
    }

    res.json({ records: mockRecords });
  } catch (error) {
    res.json({ records: mockRecords });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    res.json({
      today: {
        foodWasted: 5,
        foodPrepared: 180,
        mealsServed: 165,
        wastePercentage: 2.8,
        records: mockRecords,
      },
      weekly: { totalWaste: 32, avgDailyWaste: 4.5 },
      monthly: { totalWaste: 140, mostWastedMeal: 'dinner' },
      estimatedSavings: 10,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

export const getStaffDashboardStats = async (req, res) => {
  try {
    res.json({
      pendingLeaves: 1,
      approvedLeavesToday: 25,
      recentFeedback: [],
      wasteRecords: mockRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};
