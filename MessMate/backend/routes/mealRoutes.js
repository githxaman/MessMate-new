import { Router } from 'express';
import {
  checkIn,
  getAttendance,
  getMyTodayAttendance,
  getExpectedDemand,
} from '../controllers/mealController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/check-in', authenticate, authorize('student'), checkIn);
router.get('/attendance', authenticate, getAttendance);
router.get('/today', authenticate, authorize('student'), getMyTodayAttendance);
router.get('/demand', authenticate, authorize('staff', 'admin'), getExpectedDemand);

export default router;
