import { Router } from 'express';
import {
  getStudentByIdController,
  getStudentsController,
} from '../controllers/students.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

// Маршрут для обробки GET-запитів на '/students'
router.get('/students', ctrlWrapper(getStudentsController));

// Маршрут для обробки GET-запитів на '/students:studentId'
router.get('/students/:studentId', ctrlWrapper(getStudentByIdController));

export default router;
