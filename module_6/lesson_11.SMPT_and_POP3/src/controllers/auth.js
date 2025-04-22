import { ONE_DAY } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

// Таким чином, функція loginUserController обробляє HTTP-запит на вхід користувача, викликає функцію аутентифікації loginUser, встановлює куки для збереження токенів та ідентифікатора сесії, і відправляє клієнту відповідь з інформацією про успішний вхід та токеном доступу.

export const loginUserController = async (req, res) => {
  // виконує процес аутентифікації і повертає об'єкт сесії
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    // доступний тільки через HTTP-запити
    httpOnly: true,
    // має термін дії один день.
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  // відповідь клієнту
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  // чи існує кукі sessionId
  if (req.cookies.sessionId) {
    // видалити сесію користувача з бази даних або здійснити інші необхідні дії для виходу користувача.
    await logoutUser(req.cookies.sessionId);
  }

  // Очищення куків
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

// обробляє HTTP-запит на оновлення сесії користувача, викликає функцію для оновлення сесії refreshUsersSession, встановлює нові куки для збереження токенів та ідентифікатора сесії, і відправляє клієнту відповідь з інформацією про успішне оновлення сесії та новим токеном доступу.

export const refreshUsersSessionConteroller = async (req, res) => {
  // Виклик функції оновлення сесії:
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // Встановлення нових куків:
  setupSession(res, session);

  // Відправлення відповіді клієнту:
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
