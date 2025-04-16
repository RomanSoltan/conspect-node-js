import createHttpError from 'http-errors';

import { StudentsCollection } from '../db/models/student.js';
import { ROLES } from '../constants/index.js';

export const checkRoles =
  (...roles) =>
  async (req, res, next) => {
    // Перевірка наявності користувача:
    const { user } = req;
    if (!user) {
      next(createHttpError(401));
      return;
    }

    // Перевірка ролі користувача:
    const { role } = user;
    if (roles.includes(ROLES.TEACHER) && role === ROLES.TEACHER) {
      next();
      return;
    }

    // Перевірка ролі батька (PARENT):
    if (roles.includes(ROLES.PARENT) && role === ROLES.PARENT) {
      const { studentId } = req.params;
      if (!studentId) {
        next(createHttpError(403));
        return;
      }

      const student = await StudentsCollection.findOne({
        _id: studentId,
        parentId: user._id,
      });

      if (student) {
        next();
        return;
      }
    }

    // Заборона доступу:
    next(createHttpError(403));
  };
