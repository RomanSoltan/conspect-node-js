import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import { readFile } from 'fs/promises';

import { getEnvVar } from './getEnvVar.js';

const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');

const oauthConfig = JSON.parse(await readFile(PATH_JSON));

// В зміну googleOAuthClient ми записуємо новий екземпляр класу OAuth2Client, використовуючи дані з імпортованого конфігураційного файлу. Об'єкт OAuth2Client ініціалізується наступними параметрами:
// clientId: Ідентифікатор клієнта, отриманий зі змінних оточення.
// clientSecret: Секрет клієнта, отриманий зі змінних оточення.
// redirectUri: URI, на який буде перенаправлено користувача після аутентифікації.

const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: oauthConfig.web.redirect_uris[0],
});

// Експортуємо фукцію generateAuthUrl, в якій викликається метод generateAuthUrl об'єкта googleOAuthClient. Цей метод генерує URL для аутентифікації користувача за допомогою Google OAuth 2.0. Параметр scope вказує, які права доступу запитуються. У цьому випадку запитуються два дозволи:
export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      // Дозвіл на доступ до електронної пошти користувача.
      'https://www.googleapis.com/auth/userinfo.email',
      // Дозвіл на доступ до профілю користувача.
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
