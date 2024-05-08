import { SignIn, useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";



export const SignInButton = () => {
  const user = useUser();

  const [signingIn, setSigningIn] = useState<boolean>(false);

  if (user.isSignedIn) return (<UserButton/>);

  const SignInHandler = () => {
    setSigningIn(true);
  };
  
  if (signingIn) {
    return (<SignIn/>);
  }

  return (
    <button onClick={SignInHandler} className="bg-gray-500 rounded-full text-lg w-1/4 my-4 p-1">
      Log In
    </button>
  )
}