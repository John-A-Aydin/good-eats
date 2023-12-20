import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import toast from 'react-hot-toast';

import { useRouter } from "next/router"

import { api } from "~/utils/api"; 
import { Carousell } from "~/components/imageCarousell";
import { useUser } from "@clerk/nextjs";
import { assert } from "console";



const SinglePostPage: NextPage<{ recipeId: string }> = ({ recipeId }) => {
  const router = useRouter();
  const params = router.query;
  const username = params.slug;

  const id = params.recipeId;
  const ctx = api.useContext();
  const viewer = useUser();
  
  if (!username || typeof username !== "string") return <div>Invalid username</div>
  
  const { mutate, isLoading: isPosting} = api.recipe.delete.useMutation({
    // If delete is successfull invalidate getall to remove deleted post
    // IDK IF I NEED THIS
    onSuccess: () => {
      void ctx.recipe.getAll.invalidate();
      window.location.href = `/${username}`;
    },
    // If something goes wrong with post or zod denies content, post message
    onError: (e) => {
      // Grabs error message from zod and prints it
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else { // If there is no error message, shows default message
        toast.error("Failed to delete. Please try again later.");
      }
    },
  });

  
  if (!id || typeof id !== "string") return <div>Invalid recipe id</div>
  const { data } = api.recipe.getByUsernameAndId.useQuery({ // Wont let me destruct??
    id,
    username,
  })
  if (!data) return <div>Recipe not found</div>
  if (!data.recipe.pics[0]) return <div>404</div>

  const ownsPost = viewer.user?.id == data.author.id;


  const deleteHandler = () => {
    if (!ownsPost) {
      toast.error("You can't delete this post.");
      return;
    }
    mutate({recipeId: id});
  }

  return (
    <>
      <Head>
        <title>{`${data.recipe.name}`}</title>
        <meta name="description" content={data.recipe.description} />
        <link rel="icon" href="/favicon.jpg" />
      </Head>
      <PageLayout>
        <main className="flex flex-col items-center">
          <h1 className="text-3xl font-semibold my-4">{data.recipe.name}</h1>
          <Carousell pics={data.recipe.pics}/>
          <p>{data.recipe.description}</p>
          <br/>
          <p>{data.recipe.instructions}</p>
          {ownsPost ? (
            <div>
              <button className = "bg-rose-500" onClick={deleteHandler}>
                Delete
              </button>
            </div>
          ) : (
            <div></div>
          )}
          
        </main>
        
      </PageLayout>
    </>
  );
  

 
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const recipeId = context.params?.recipeId;
  const username = context.params?.slug;
  // It would be better if this returned to a differnet page instaed of throwing error
  if (typeof recipeId !== "string") throw new Error("no id");
  if (typeof username !== "string") throw new Error("no username");

  await ssg.recipe.getByUsernameAndId.prefetch({ username, id: recipeId });

  return {
    props: {
      trcpState: ssg.dehydrate(),
      id: recipeId,
    },
  }
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
};

export default SinglePostPage;