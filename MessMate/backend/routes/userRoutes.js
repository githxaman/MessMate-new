import { Router } from 'express';
import {
  registerUser,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  toggleStudentVerification,
  getAuthorizedStudents,
  createAuthorizedStudent,
  updateAuthorizedStudent,
  deleteAuthorizedStudent,
  verifyAuthorizedStudent,
  registerDemoStudent,
  loginDemoStudent,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { importAuthorizedStudents } from '../controllers/authorizedStudentController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', registerUser);
router.post('/demo/register', registerDemoStudent);
router.post('/demo/login', loginDemoStudent);
router.post('/verify-student', verifyAuthorizedStudent);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/', authenticate, authorize('admin', 'staff'), getAllUsers);
router.put('/:id', authenticate, authorize('admin'), updateUserRole);
router.put('/verify/:id', authenticate, authorize('admin'), toggleStudentVerification);

// Authorized Roster routes (Admin)
router.get('/authorized', authenticate, authorize('admin'), getAuthorizedStudents);
router.post('/authorized', authenticate, authorize('admin'), createAuthorizedStudent);
router.post('/authorized/import', authenticate, authorize('admin'), upload.single('file'), importAuthorizedStudents);
router.put('/authorized/:id', authenticate, authorize('admin'), updateAuthorizedStudent);
router.delete('/authorized/:id', authenticate, authorize('admin'), deleteAuthorizedStudent);

export default router;
