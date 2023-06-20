import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";
import toast from 'react-hot-toast';

const CreateRecipeWizard = () => {
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
  
  const handleChange = (e) => {
    
    const name = e.target.name;
    const value = e.target.value;
    setPostInfo((prev) => {
      return {...prev, [name]: value}
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (postInfo.name !== "" && postInfo.description !== "" && postInfo.instructions !== "") {
      mutate(postInfo)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex-col">
      <h3>Name :</h3> <input type="text" name="name" onChange={handleChange}/>
      <h3>Description :</h3> <textarea name="description" onChange={handleChange}></textarea> 
      {/* <input type="text" name="description" onChange={handleChange}/> */}
      <h3>Instructions :</h3> <textarea name="instructions" onChange={handleChange}></textarea>  
      {/* <input type="text" name="instructions" onChange={handleChange}/> */}
      <button type="submit">Post</button>
    </form>
  );
};

const CreatePostWizard = () => {
  // Grabing user from clerk
  const { user } = useUser();

  const [input, setInput] = useState<string>("");
  // Grabbing context for form submission
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting} = api.recipe.create.useMutation({
    onSuccess: () => { // If post is successfull clear the input and invalidate something 
      setInput("");
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

  if (!user) return null;

  return (
    <div className="flex gap-3 w-full">
      
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ name: input, description: input, instructions: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ name: input, description: input, instructions: input })} disabled={isPosting}>
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20}/>
        </div>
      )}
    </div>
  );
};


const Home: NextPage = () => {


  return (
    <>
      <Head>
        <title>Good Eats</title>
        <meta name="description" content="Recipe sharing website with a focus on fitness" />
        <link rel="icon" href="/favicon.jpg" /> 
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <SignIn/>
        <UserButton/>
        <CreateRecipeWizard />
      </main>
    </>
  );
};

export default Home;
