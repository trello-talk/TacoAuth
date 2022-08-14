import Head from 'next/head';

import Spinner from '../components/spinner';

export default function TrelloCallback() {
  return (
    <>
      <Head>
        <title>Connecting...</title>
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
        <Spinner className="animate-spin h-20 w-20 text-white" />
      </div>
    </>
  );
}
