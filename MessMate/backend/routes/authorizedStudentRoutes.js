import { Router } from 'express';
import multer from 'multer';
import {
  verifyAuthorizedStudent,
  getAuthorizedStudents,
  getAuthorizedStudent,
  createAuthorizedStudent,
  updateAuthorizedStudent,
  deleteAuthorizedStudent,
} from '../controllers/userController.js';
import { importAuthorizedStudents } from '../controllers/authorizedStudentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/verify', verifyAuthorizedStudent);
router.get('/', authenticate, authorize('admin', 'staff'), getAuthorizedStudents);
router.get('/:id', authenticate, authorize('admin', 'staff'), getAuthorizedStudent);
router.post('/', authenticate, authorize('admin'), createAuthorizedStudent);
router.put('/:id', authenticate, authorize('admin'), updateAuthorizedStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteAuthorizedStudent);
router.post('/import', authenticate, authorize('admin'), upload.single('file'), importAuthorizedStudents);

export default router;
