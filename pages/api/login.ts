import { serialize } from 'cookie';
import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

import { getAuthHeader } from '../../lib/oauth';
import prisma from '../../lib/prisma';
import { config } from '../../utils/config';
import { DiscordUser, TrelloMember } from '../../utils/types';

const scope = ['identify', 'role_connections.write'].join(' ');
const REDIRECT_URI = `${config.appUri}/api/login`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.clientId,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.redirect('/');

  const { code = null, error = null } = req.query;

  if (error) return res.redirect(`/?error=${req.query.error}&from=discord`);

  if (!code || typeof code !== 'string') return res.redirect(OAUTH_URI);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
    scope
  }).toString();

  const {
    access_token = null,
    refresh_token = null,
    token_type = 'Bearer'
  } = await fetch('https://discord.com/api/oauth2/token', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'TacoAuth (https://github.com/trello-talk/TacoAuth, v1.0.0)' },
    method: 'POST',
    body
  }).then((res) => res.json() as Promise<Record<string, string>>);

  if (!access_token || typeof access_token !== 'string') return res.redirect(OAUTH_URI);

  const me = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `${token_type} ${access_token}`,
      'User-Agent': 'TacoAuth (https://github.com/trello-talk/TacoAuth, v1.0.0)'
    }
  }).then((res) => res.json() as Promise<DiscordUser | { unauthorized: true }>);

  if (!('id' in me)) return res.redirect(OAUTH_URI);

  const user = await prisma.user.upsert({
    where: { userID: me.id },
    create: {
      userID: me.id,
      discordToken: access_token,
      discordRefresh: refresh_token
    },
    update: {
      discordToken: access_token,
      discordRefresh: refresh_token
    }
  });

  let trelloMember: TrelloMember | null = null;

  if (user.trelloID && user.trelloToken) {
    const params = new URLSearchParams({
      fields: ['id', 'username', 'fullName', 'avatarUrl', 'initials', 'url'].join(',')
    });

    trelloMember = await fetch(`https://api.trello.com/1/members/me/?${params.toString()}`, {
      headers: { Authorization: await getAuthHeader(user.trelloToken, 'GET', 'https://api.trello.com/1/members/me') }
    })
      .then((res) => res.json() as unknown as TrelloMember)
      .catch(() => null);
  }

  const memberConnected = trelloMember && !!trelloMember.id && !!trelloMember.username;
  await fetch(`https://discord.com/api/users/@me/applications/${config.clientId}/role-connection`, {
    method: 'PUT',
    headers: {
      Authorization: `${token_type} ${access_token}`,
      'User-Agent': 'TacoAuth (https://github.com/trello-talk/TacoAuth, v1.0.0)',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      memberConnected
        ? {
            platform_name: 'Trello',
            platform_username: trelloMember.username,
            metadata: { connected: true }
          }
        : { metadata: { connected: false } }
    )
  });

  const token = sign(me, config.jwtSecret, { expiresIn: '7d' });

  res.setHeader(
    'Set-Cookie',
    serialize(config.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
  );

  res.redirect('/');
};
