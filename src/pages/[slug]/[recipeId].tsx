import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image"
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";

import { useRouter } from "next/router"

import { api } from "~/utils/api"; 
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";
import { Carousell } from "~/components/imageCarousell";

const SinglePostPage: NextPage<{ recipeId: string }> = ({ recipeId }) => {
  const router = useRouter();
  const params = router.query;
  const username = params.slug;
  const id = params.recipeId;
  if (!username || typeof username !== "string") return <div>Invalid username</div>
  if (!id || typeof id !== "string") return <div>Invalid recipe id</div>
  const { data } = api.recipe.getByUsernameAndId.useQuery({ // Wont let me destruct??
    id,
    username,
  })
  if (!data) return <div>Recipe not found</div>
  if (!data.recipe.pics[0]) return <div>404</div>


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