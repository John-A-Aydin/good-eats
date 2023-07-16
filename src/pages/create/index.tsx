import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import toast from 'react-hot-toast';


const CreateRecipeWizard = () => { // TODO clear input fields on submit
  const { user } = useUser();
  const ctx = api.useContext();
  const [postInfo, setPostInfo] = useState({
    name: "",
    description: "",
    instructions: ""
  });
  const { mutate, isLoading: isPosting} = api.recipe.create.useMutation({
    // If post is successfull clear the input and invalidate something 
    onSuccess: () => {
      setPostInfo({
        name: "",
        description: "",
        instructions: ""
      });
      void ctx.recipe.getAll.invalidate();
    },
    // If something goes wrong with post or zod denies content, post message
    onError: (e) => {
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
    <form onSubmit={handleSubmit} className="flex flex-col rounded-md w-8/12">
      <h3>Name :</h3>
      <input
        type="text"
        name="name"
        onChange={handleChange}
        className="bg-neutral-800 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Give your recipe a unique name"
      />
      <h3>Description :</h3>
      <textarea
        name="description"
        onChange={handleChange}
        className="bg-neutral-800 h-24 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Write about your inspiration for the dish or about its flavor"
      /> 
      <h3>Instructions :</h3>
      <textarea
        name="instructions"
        onChange={handleChange}
        className="bg-neutral-800 h-96 rounded-md m-4 border-[1px] border-gray-400"
        placeholder=" Write detailed instructions with clear steps"
      />
      <button type="submit" className="bg-neutral-800 w-16 rounded-full">Post</button>
    </form>
  );
};

export default CreateRecipeWizard;