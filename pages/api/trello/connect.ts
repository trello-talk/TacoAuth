import { NextApiRequest, NextApiResponse } from 'next';

import { getAccessToken, getAuthHeader } from '../../../lib/oauth';
import prisma from '../../../lib/prisma';
import { parseUser } from '../../../utils';
import { config as appConfig } from '../../../utils/config';
import { TrelloMember } from '../../../utils/types';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1kb'
    }
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') return res.status(405).send({ error: 'Method not allowed' });
  const user = parseUser(req);
  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const { token = null, verifier = null } = req.body;
  if (typeof token !== 'string' && typeof verifier !== 'string') return res.status(400).send({ error: 'Invalid body' });

  const tokens = await getAccessToken(token, verifier, user.id).catch(() => null);
  if (!tokens) return res.status(400).send({ error: 'Invalid token' });

  const params = new URLSearchParams({
    fields: ['id', 'username', 'fullName', 'avatarUrl', 'initials', 'url'].join(',')
  });

  const body: TrelloMember = await fetch(`https://api.trello.com/1/members/me/?${params.toString()}`, {
    headers: { Authorization: await getAuthHeader(tokens.accessToken, 'GET', 'https://api.trello.com/1/members/me') }
  })
    .then((res) => res.json())
    .catch(() => null);
  if (!body) return res.status(400).send({ error: 'Invalid body was given by Trello...' });
  if (!body.id) return res.status(400).send({ error: 'A Trello user ID body was not given by Trello...' });

  const dbUser = await prisma.user.upsert({
    where: { userID: user.id },
    create: {
      userID: user.id,
      trelloID: body.id,
      trelloToken: tokens.accessToken
    },
    update: {
      trelloID: body.id,
      trelloToken: tokens.accessToken
    }
  });

  if (dbUser.discordToken)
    await fetch(`https://discord.com/api/users/@me/applications/${appConfig.clientId}/role-connection`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${dbUser.discordToken}`,
        'User-Agent': 'TacoAuth (https://github.com/trello-talk/TacoAuth, v1.0.0)',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform_name: 'Trello',
        platform_username: body.username,
        metadata: { connected: true }
      })
    });

  console.info(`[${new Date().toISOString()}}] User ${user.username}#${user.discriminator} (${user.id}) authorized Trello account ${body.username}`);

  return res.status(200).send({ data: body });
};
