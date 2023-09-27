import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";


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

export const PageLayout= (props: PropsWithChildren) => {
  const { isLoaded: userLoaded, isSignedIn} = useUser();
  return (
    <main className="flex flex-row justify-center">
      {/* {overflow-y-scroll} */}
      <div className="h-screen w-2/12 absolute top-0 left-0">
        testing contents
      </div>
      <div className="h-full w-8/12 border-x border-neutral-600 md:max-w-2xl">
        {props.children}
      </div>
      <div className="h-screen w-2/12 absolute top-0 right-0">
        {isSignedIn && (<SignedInHeader />)}
      </div>
    </main>
  );
};