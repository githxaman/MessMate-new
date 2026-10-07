import { Router } from 'express';
import {
  createLeave,
  getLeaves,
  updateLeaveStatus,
  getUpcomingLeave,
} from '../controllers/leaveController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize('student'), createLeave);
router.get('/', authenticate, getLeaves);
router.get('/upcoming', authenticate, authorize('student'), getUpcomingLeave);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateLeaveStatus);

export default router;
