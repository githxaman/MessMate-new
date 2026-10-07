import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest.js';

const mockLeaves = [
  {
    _id: '650000000000000000000050',
    userId: { name: 'Alex Johnson', studentId: 'STU1001' },
    firebaseUid: 'demo-uid-student',
    fromDate: new Date(),
    toDate: new Date(Date.now() + 86400000 * 2),
    reason: 'Family function at home',
    status: 'approved',
  },
];

const startOfDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: 'From date, to date, and reason are required' });
    }

    const from = startOfDay(fromDate);
    const to = startOfDay(toDate);

    if (from > to) {
      return res.status(400).json({ message: 'From date cannot be after to date' });
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.create({
        userId: req.user._id,
        firebaseUid: req.firebaseUid,
        fromDate: from,
        toDate: to,
        reason,
      });

      return res.status(201).json({ message: 'Leave request submitted', leave });
    }

    const newLeave = {
      _id: `65000000000000000000${Date.now().toString().slice(-4)}`,
      userId: req.user,
      firebaseUid: req.firebaseUid,
      fromDate: from,
      toDate: to,
      reason,
      status: 'pending',
    };
    mockLeaves.push(newLeave);

    res.status(201).json({ message: 'Leave request submitted', leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit leave', error: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const filter = req.user.role === 'student' ? { firebaseUid: req.firebaseUid } : {};
      const { status } = req.query;
      if (status) filter.status = status;

      const leaves = await LeaveRequest.find(filter)
        .populate('userId', 'name email studentId')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 });

      return res.json({ leaves });
    }

    res.json({ leaves: mockLeaves });
  } catch (error) {
    res.json({ leaves: mockLeaves });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.findByIdAndUpdate(
        req.params.id,
        {
          status,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
        { new: true }
      ).populate('userId', 'name email studentId');

      if (!leave) return res.status(404).json({ message: 'Leave request not found' });

      return res.json({ message: `Leave ${status}`, leave });
    }

    const match = mockLeaves.find((l) => l._id === req.params.id);
    if (match) match.status = status;

    res.json({ message: `Leave ${status}`, leave: match || mockLeaves[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leave', error: error.message });
  }
};

export const getUpcomingLeave = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const leave = await LeaveRequest.findOne({
        firebaseUid: req.firebaseUid,
        status: 'approved',
        toDate: { $gte: today },
      }).sort({ fromDate: 1 });

      return res.json({ leave });
    }

    res.json({ leave: mockLeaves[0] });
  } catch (error) {
    res.json({ leave: null });
  }
};
