import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import toast from 'react-hot-toast';
import { RecipePreview } from "~/components/recipePreview";

const Feed = () => {
  const {data, isLoading: postsLoading } = api.recipe.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>
  return (
    <div className="flex flex-col w-8/12">
      {data.map((fullRecipe) => (
        <RecipePreview {...fullRecipe} key={fullRecipe.recipe.id}/>
        
      ))}
    </div>
  );
};

const SignedInHeader = () => {

  return ( // TODO create recipe route may change
    <div className="flex flex-row">
      <UserButton />
      <Link href="/create">
        <Image src="/createButton.png" alt="Create" width={50} height={50}/>
      </Link>
    </div>
  );
};

const Home: NextPage = () => {

  const { isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching asap
  api.recipe.getAll.useQuery();
  
  // Return empty div if both aren't loaded, since user tends to load faster
  if (!userLoaded) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Good Eats</title>
        <meta name="description" content="Recipe sharing website with a focus on fitness" />
        <link rel="icon" href="/favicon.jpg" /> 
      </Head>
      <main className="flex flex-col items-center">
        <SignIn/>
        {isSignedIn && (<SignedInHeader />)}
        <Feed />
      </main>
    </>
  );
};

export default Home;
