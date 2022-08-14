import { OAuth } from 'oauth';

import redis from './redis';

const REQUEST_URL = 'https://trello.com/1/OAuthGetRequestToken';
const ACCESS_URL = 'https://trello.com/1/OAuthGetAccessToken';
const AUTH_URL = 'https://trello.com/1/OAuthAuthorizeToken';
export const OAUTH_URL = (token: string): string =>
  `${AUTH_URL}?oauth_token=${token}&name=${encodeURIComponent(
    process.env.TRELLO_NAME || 'Taco Self-hosted'
  )}&scope=read,write,account&expiration=never`;

const oauth = new OAuth(
  REQUEST_URL,
  ACCESS_URL,
  process.env.TRELLO_KEY,
  process.env.TRELLO_SECRET,
  '1.0A',
  process.env.APP_URI + '/trello-callback',
  'HMAC-SHA1'
);

async function getSecret(token: string, type: 'oauth' | 'access' = 'oauth'): Promise<string | null> {
  return redis.get(`secret:${type}:${token}`);
}

async function setSecret(token: string, secret: string, type: 'oauth' | 'access' = 'oauth'): Promise<'OK'> {
  return redis.set(`secret:${type}:${token}`, secret, 'EX', 60 * 10);
}

export const validAccessToken = async (token: string): Promise<boolean> => !!(await getSecret(token, 'access'));

export async function getOAuthRequestToken(userId: string): Promise<string> {
  const lastToken = await redis.get(`oauthtoken:${userId}`);
  if (lastToken) return lastToken;

  function getOAuthRequestToken(): Promise<{ token: string; tokenSecret: string }> {
    return new Promise((resolve, reject) => {
      oauth.getOAuthRequestToken(function (error, token, tokenSecret) {
        if (error) return reject(error);
        resolve({ token, tokenSecret });
      });
    });
  }

  const { token, tokenSecret } = await getOAuthRequestToken();
  await setSecret(token, tokenSecret);
  await redis.set(`oauthtoken:${userId}`, token, 'EX', 60 * 10);

  console.info(`[${new Date().toISOString()}}] User ${userId} generated oauth request token`);
  return token;
}

export async function getAuthHeader(accessToken: string, method: string, url: string, extra: Record<string, unknown> = {}) {
  const accessTokenSecret = await getSecret(accessToken, 'access');
  if (!accessTokenSecret) throw new Error('No token secret found');
  // @ts-ignore
  const orderedParameters = oauth._prepareParameters(accessToken, accessTokenSecret, method, url, extra);
  // @ts-ignore
  const authorization = oauth._buildAuthorizationHeaders(orderedParameters);
  return authorization;
}

export async function getAccessToken(oauthToken: string, verifier: string, userId: string) {
  function getOAuthAccessToken(tokenSecret: string): Promise<{ accessToken: string; accessTokenSecret: string }> {
    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(oauthToken, tokenSecret, verifier, function (error, accessToken, accessTokenSecret) {
        if (error) return reject(error);
        resolve({ accessToken, accessTokenSecret });
      });
    });
  }

  const tokenSecret = await getSecret(oauthToken);
  if (!tokenSecret) throw new Error('No token secret found');
  const { accessToken, accessTokenSecret } = await getOAuthAccessToken(tokenSecret);
  await setSecret(accessToken, accessTokenSecret, 'access');
  await redis.del(`oauthtoken:${userId}`);
  return { accessToken, accessTokenSecret };
}
