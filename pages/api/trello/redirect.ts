import { NextApiRequest, NextApiResponse } from 'next';

import { getOAuthRequestToken, OAUTH_URL } from '../../../lib/oauth';
import { parseUser } from '../../../utils';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).send({ error: 'Method not allowed' });
  const user = parseUser(req);
  if (!user) return res.status(401).send({ error: 'Unauthorized' });

  const token = await getOAuthRequestToken(user.id);
  res.redirect(OAUTH_URL(token));
};
