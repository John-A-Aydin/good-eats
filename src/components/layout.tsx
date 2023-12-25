import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { SignInButton } from "./signinButton";


const SignedInSidebar = () => {
  return ( // TODO create recipe route may change
    <div className="flex flex-col">
      <div className="flex flex-row"> 
        <Link href="/">
          <Image src="/home-icon.png" alt="oops" width={50} height={50}/>
        </Link>
        <div className="h-full">
          Hello
        </div>
      </div>
      <Link href="/create">
        <Image src="/createButton.png" alt="Create" width={50} height={50}/>
      </Link>
      
      <UserButton />
      <SignInButton/>
    </div>
  );
};

const NotSignedInSidebar = () => {
  return (
    <div className="flex flex-col">
      <Link href="/">
        <Image src="/home-icon.png" alt="oops" width={50} height={50}/>
      </Link>
      <SignInButton/>
    </div>
  )
}

export const PageLayout= (props: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  return (
    <main className="flex flex-row justify-center">
      {/* {overflow-y-scroll} */}
      <div className="h-screen w-2/12 fixed top-0 left-0 flex flex-col p-8">
        {isSignedIn ? (
          <SignedInSidebar/>
        ) : (
          <NotSignedInSidebar/>
        )
        }
      </div>
      <div className="h-full w-8/12 border-x border-neutral-600 md:max-w-2xl">
        {props.children}
      </div>
      <div className="h-screen w-2/12 fixed top-0 right-0">
        
      </div>
    </main>
  );
};