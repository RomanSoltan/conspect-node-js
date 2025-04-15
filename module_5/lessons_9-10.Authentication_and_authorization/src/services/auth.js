import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';

export const registerUser = async (payload) => {
  // Нам варто перевіряти email на унікальність під
  // час реєстрації та, у разі дублювання, повертати відповідь зі статусом 409
  // і відповідним повідомленням.
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  // ми застосуємо хешування для зберігання паролю і скористаємось бібліотекою bcrypt
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

// створимо функціонал по створенню сесій
//функція забезпечує аутентифікацію користувача, перевіряє його дані для входу,
// видаляє попередню сесію, генерує нові токени та створює нову сесію в базі даних.
export const loginUser = async (payload) => {
  // шукає користувача в базі даних за наданою електронною поштою
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // порівнює введений користувачем пароль з хешованим паролем, збереженим у базі даних
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  // видаляє попередню сесію користувача, якщо така існує, з колекції сесій.
  // для уникнення конфліктів з новою сесією.
  await SessionsCollection.deleteOne({ userId: user._id });

  // генеруються нові токени доступу та оновлення.
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  //  створює нову сесію в базі даних
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

// Функція refreshUsersSession обробляє запит на оновлення сесії користувача, перевіряє наявність і термін дії існуючої сесії, генерує нову сесію та зберігає її в базі даних.
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  // Пошук існуючої сесії:
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевірка терміну дії токена сесії
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // Створення нової сесії:
  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  // Збереження нової сесії в базі даних:
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
