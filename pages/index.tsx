import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import Button from '../components/button';
import Row from '../components/row';
import Spinner from '../components/spinner';
import TrelloLogo from '../components/svg/trello';
import prisma from '../lib/prisma';
import { getAvatarUrl, parseUser } from '../utils';
import usePopout from '../utils/popout';
import type { DiscordUser, TrelloMember } from '../utils/types';

interface Props {
  user: DiscordUser;
  trelloId: string | null;
}

export default function Index(props: Props) {
  const [loading, setLoading] = useState(false);
  const [oauthError, setOAuthError] = useState('');
  const [trelloMember, setTrelloMember] = useState<TrelloMember>(null);
  const [trelloId, setTrelloId] = useState(props.trelloId);

  const [openPopout, popoutOpen] = usePopout({
    url: '/api/trello/redirect',
    title: 'Authenticating to Trello...',
    onError: setOAuthError,
    async onCode(token, verifier) {
      setLoading(true);

      const response = await fetch('/api/trello/connect', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, verifier })
      });

      if (!response.ok) {
        const error = await response
          .json()
          .then(({ message }) => message)
          .catch(() => null);
        setOAuthError(error ?? 'Internal Server Error');
        setLoading(false);
        return;
      }

      const member: TrelloMember = await response.json().then(({ data }) => data);
      setTrelloMember(member);
      setTrelloId(member.id);
      setLoading(false);
    }
  });

  return (
    <>
      <Head>
        <title>Taco Authentication</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="Content-Language" content="en" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#93a01e" />
        <meta name="og:site_name" content="Taco" />
        <meta name="og:title" content="Taco Authentication" />
        <meta name="og:description" content="Connect your Trello account to Taco, a Discord bot that manages Trelllo boards." />
        <meta name="og:locale" content="en_US" />
        <meta name="og:image" content="/android-chrome-512x512.png" />
        <meta name="msapplication-TileColor" content="#93a01e" />
        <meta name="theme-color" content="#93a01e" />
      </Head>
      <div className="min-h-screen bg-gradient-to-t from-neutral-800 to-zinc-900 text-white font-body flex items-center justify-center flex-col py-12 sm:px-12">
        <div className="bg-zinc-700 sm:rounded flex justify-center items-center sm:shadow-md w-full flex-col sm:w-4/5 sm:max-w-4xl">
          <h1 className="text-3xl flex justify-center p-3 gap-4 items-center relative bg-black bg-opacity-20 w-full font-body">
            <img src={getAvatarUrl(props.user)} className="w-12 h-12 rounded-full" />
            <span>
              Hello, <span className="font-medium">{props.user.username}</span>
              <span className="opacity-50">#{props.user.discriminator}</span>
            </span>
          </h1>
          <div className="flex flex-col justify-center items-center p-6 gap-4 w-full">
            {oauthError && (
              <div className="p-2 border-2 rounded-md border-red-500 bg-red-500/25 w-full text-center">
                <b>Error:</b> {oauthError}
              </div>
            )}
            {trelloMember && (
              <div className="flex w-full p-2 border-2 rounded-md border-green-500 bg-green-500/25 gap-2 justify-center items-center">
                <span>Connected as</span>{' '}
                {trelloMember.avatarUrl && <img src={trelloMember.avatarUrl + '/170.png'} className="w-8 h-8 rounded-full" />}
                {trelloMember.fullName ? (
                  <>
                    <b>{trelloMember.fullName}</b>
                    <span>({trelloMember.username})</span>
                  </>
                ) : (
                  <b>{trelloMember.username}</b>
                )}
              </div>
            )}
            <Row title="Trello" icon={<TrelloLogo className="w-8 h-8" />}>
              {trelloId ? (
                <b className="font-display">Connected</b>
              ) : (
                <Button
                  type="brand"
                  onClick={() => {
                    openPopout();
                    setOAuthError('');
                  }}
                  disabled={popoutOpen || loading}
                >
                  {popoutOpen || loading ? <Spinner className="animate-spin h-5 w-5 text-white mx-5 my-0.5" /> : 'Connect'}
                </Button>
              )}
            </Row>
            <div className="flex flex-col w-full">
              <span>
                <b>Note:</b> To disconnect your Trello account, use the <code>/clear-auth</code> command within Discord.
              </span>
            </div>
            <Button type="danger" onClick={() => (location.href = '/api/logout')}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async function (ctx) {
  const user = parseUser(ctx.req);

  if (!user)
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };

  const dbUser = await prisma.user.findUnique({ where: { userID: user.id } });

  return {
    props: {
      user,
      trelloId: dbUser?.trelloID || null
    }
  };
};
