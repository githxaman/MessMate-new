import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initFirebase } from './config/firebase.js';

import userRoutes from './routes/userRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import foodWasteRoutes from './routes/foodWasteRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authorizedStudentRoutes from './routes/authorizedStudentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
initFirebase();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'MessMate API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/food-waste', foodWasteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/authorized-students', authorizedStudentRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MessMate server running on port ${PORT}`);
});
