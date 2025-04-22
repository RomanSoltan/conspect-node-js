import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// Імпортуємо роутер
import router from './routers/index.js';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { logger } from './middlewares/logger.js';

dotenv.config();

// Читаємо змінну оточення PORT
const PORT = Number(getEnvVar('PORT', '3000'));

export const startServer = () => {
  const app = express();

  // Вбудований у express middleware для обробки (парсингу) JSON-даних у запитах
  // наприклад, у запитах POST або PATCH
  app.use(
    express.json({
      type: ['application/json', 'application/vnd.api+json'],
      limit: '100kb',
    }),
  );
  app.use(cors());

  // Для роботи із куками
  app.use(cookieParser());

  // app.use(logger);

  // Маршрут для обробки GET-запитів на '/'
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  // Додаємо роутер до app як middleware
  app.use(router);

  // обробка неіснуючого маршруту
  app.use('*', notFoundHandler);

  // Middleware для обробки помилок (приймає 4 аргументи)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
