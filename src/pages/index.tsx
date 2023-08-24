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
import { PageLayout } from "~/components/layout";
import { PieChart } from "~/components/piechart";

const Feed = () => {
  const {data, isLoading: postsLoading } = api.recipe.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>
  return (
    <div className="flex flex-col">
      {data.map((fullRecipe) => (
        <RecipePreview {...fullRecipe} key={fullRecipe.recipe.id}/>
        
      ))}
    </div>
  );
};

const Home: NextPage = () => {

  const { isLoaded: userLoaded} = useUser();

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
      <PageLayout>
        <main className="flex flex-col items-center">
          <SignIn/>
          <Feed />
        </main>
        
      </PageLayout>
      
    </>
  );
};

export default Home;
