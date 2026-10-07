import { Router } from 'express';
import {
  createFoodWaste,
  getFoodWaste,
  getAnalytics,
} from '../controllers/foodWasteController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, authorize('staff', 'admin'), getFoodWaste);
router.post('/', authenticate, authorize('staff', 'admin'), createFoodWaste);
router.get('/analytics', authenticate, authorize('staff', 'admin'), getAnalytics);

export default router;
