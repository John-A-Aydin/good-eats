import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Home: NextPage = () => {


  return (
    <>
      <Head>
        <title>Good Eats</title>
        <meta name="description" content="Recipe sharing website with a focus on fitness" />
        <link rel="icon" href="/favicon.jpg" /> 
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        
      </main>
    </>
  );
};

export default Home;
