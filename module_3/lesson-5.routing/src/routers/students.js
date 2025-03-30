import { Router } from 'express';
import {
  getStudentByIdController,
  getStudentsController,
} from '../controllers/students.js';

const router = Router();

// Маршрут для обробки GET-запитів на '/students'
router.get('/students', getStudentsController);

// Маршрут для обробки GET-запитів на '/students:studentId'
router.get('/students/:studentId', getStudentByIdController);

export default router;
