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
      </Head>
      <div className="min-h-screen bg-gradient-to-t from-neutral-800 to-zinc-900 text-white font-body flex items-center justify-center flex-col py-12 sm:px-12">
        <Spinner className="animate-spin h-20 w-20 text-white" />
      </div>
    </>
  );
}
