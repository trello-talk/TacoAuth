import { GetServerSideProps } from 'next';
import Head from 'next/head';

import Button from '../components/button';
import LinkButton from '../components/linkButton';
import TacoLogo from '../components/svg/taco';
import { parseUser } from '../utils';

export default function Login() {
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
            <TacoLogo className="w-12 h-12" />
            <span>Taco Authentication</span>
          </h1>
          <div className="flex flex-col justify-center items-center p-6 gap-4 w-full">
            <div className="flex gap-2 flex-col w-full justify-center items-center">
              <span>Hi, you will need to login with Discord to connect your Trello account to Taco.</span>
              <span>We use cookies to keep you logged in. By logging in, you allow us to store and use them.</span>
            </div>
            <Button type="brand" onClick={() => (location.href = '/api/login')}>
              Login
            </Button>
            <div className="flex gap-4 flex-wrap justify-center">
              <LinkButton name="Home" href="https://tacobot.app/" />
              <LinkButton name="Privacy Policy" href="https://tacobot.app/privacy" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  const user = parseUser(ctx.req);

  if (user)
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };

  return { props: {} };
};
