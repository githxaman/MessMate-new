import { Router } from 'express';
import { getExpectedDemand } from '../controllers/mealController.js';
import { getAnalytics } from '../controllers/foodWasteController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/demand', authenticate, authorize('staff', 'admin'), getExpectedDemand);
router.get('/', authenticate, authorize('staff', 'admin'), getAnalytics);

export default router;
