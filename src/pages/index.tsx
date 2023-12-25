import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import { RecipePreview } from "~/components/recipePreview";
import { PageLayout } from "~/components/layout";


const Feed = () => {
  const {data, isLoading: postsLoading } = api.recipe.getAll.useQuery();

  if (postsLoading) return <LoadingPage />
  if (!data) return <div>Something went wrong</div>
  if (data.length == 0) return <div className="text-2xl w-80" >Currently refactoring data, stay tuned for an update.</div>
  return (
    <div className="flex flex-col w-full">
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
  // if (!userLoaded) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Good Eats</title>
        <meta name="description" content="Recipe sharing website with a focus on fitness" />
        <link rel="icon" href="/favicon.jpg" />
      </Head>
      <PageLayout>
        <main className="flex flex-col items-center">
          <Feed />
        </main>
      </PageLayout>
      
    </>
  );
};

export default Home;
