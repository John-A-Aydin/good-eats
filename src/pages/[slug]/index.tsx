import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image"
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";

import { api } from "~/utils/api";
import { RecipePreview } from "~/components/recipePreview";

const ProfileFeed = (props: {userId: string}) => {
  const { data, isLoading } = api.recipe.getByUserId.useQuery({ userId: props.userId})

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map( (fullPost) => (
        <RecipePreview {...fullPost} key={fullPost.recipe.id} />
      ))}
    </div>
  );
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}

            className="mb-16 absolute bottom-0 left-0 ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-16"></div>
        <div className="p-4 text-2xl font-semibold">{`@${data.username ?? ""}`}</div>
        <div className="border-b border-neutral-600 w-full" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;
  // It would be better if this returned to a differnet page instaed of throwing error
  if (typeof slug !== "string") throw new Error("no slug");

  // Since the slug is just the end of the url, it still has an @ so we have to remove it
  const username = slug; // TODO dont need this

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trcpState: ssg.dehydrate(),
      username,
    },
  }
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
};

export default ProfilePage;