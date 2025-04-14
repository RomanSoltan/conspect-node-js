import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';

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

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  // Порівнюємо хеші паролів
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  // далі ми доповнемо цей сервіс
};
