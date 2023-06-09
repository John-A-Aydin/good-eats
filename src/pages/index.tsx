import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import toast from 'react-hot-toast';
import { RecipePreview } from "~/components/recipepreview";

const CreateRecipeWizard = () => { // TODO clear input fields on submit
  const { user } = useUser();
  const ctx = api.useContext();
  const [postInfo, setPostInfo] = useState({
    name: "",
    description: "",
    instructions: ""
  });
  const { mutate, isLoading: isPosting} = api.recipe.create.useMutation({
    onSuccess: () => { // If post is successfull clear the input and invalidate something 
      setPostInfo({
        name: "",
        description: "",
        instructions: ""
      });
      void ctx.recipe.getAll.invalidate();
    },
    onError: (e) => { // If something goes wrong with post or zod denies content, post message
      // Grabs error message from zod and prints it
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else { // If there is no error message, shows default message
        toast.error("Failed to post! Please try again later.")
      }
    },
  });
  
  const handleChange = (e: any) => { // TODO fix e type
    
    const name = e.target.name;
    const value = e.target.value;
    setPostInfo((prev) => {
      return {...prev, [name]: value}
    });
  };
  const handleSubmit = (e: any) => { // TODO fix e type
    e.preventDefault();
    if (postInfo.name !== "" && postInfo.description !== "" && postInfo.instructions !== "") {
      mutate(postInfo)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-gray-900 rounded-md w-8/12">
      <h3>Name :</h3>
      <input
        type="text"
        name="name"
        onChange={handleChange}
        className="bg-gray-800 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Give your recipe a unique name"
      />
      <h3>Description :</h3>
      <textarea
        name="description"
        onChange={handleChange}
        className="bg-gray-800 h-24 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Write about your inspiration for the dish or about its flavor"
      /> 
      <h3>Instructions :</h3>
      <textarea
        name="instructions"
        onChange={handleChange}
        className="bg-gray-800 h-96 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Write detailed instructions with clear steps"
      />
      <button type="submit" className="bg-gray-800 w-16 rounded-full">Post</button>
    </form>
  );
};


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
        <CreateRecipeWizard />
        <Feed />
      </main>
    </>
  );
};

export default Home;
