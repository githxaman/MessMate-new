import { Router } from 'express';
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  publishMenu,
} from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getMenus);
router.post('/', authenticate, authorize('staff', 'admin'), createMenu);
router.put('/:id', authenticate, authorize('staff', 'admin'), updateMenu);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deleteMenu);
router.patch('/:id/publish', authenticate, authorize('staff', 'admin'), publishMenu);

export default router;
