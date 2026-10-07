import { Router } from 'express';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createFeedback);
router.get('/', authenticate, getFeedback);

export default router;
