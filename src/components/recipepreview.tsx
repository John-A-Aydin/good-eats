import Link from "next/link";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

type RecipeWithUser = RouterOutputs["recipe"]["getAll"][number];

export const RecipePreview = (props: RecipeWithUser) => {
  const { recipe, author } = props;
  return (
  <div key={recipe.id} className="p-4 gap-3 border-b border-slate-400 flex flex-col">
    <div className="flex relative">
      <div className="flex flex-col">
        <span className="text-2xl font-semibold">{recipe.name}</span>
        <div className="flex gap-1 text-slate-400">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${recipe.id}`}>
            <span className="font-thin">{` · ${dayjs(recipe.createdAt).fromNow()}`}</span>
          </Link>
        </div>
      </div>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="w-14 h-14 rounded-full absolute end-0"
        width={56}
        height={56}
      />
    </div>
    <p className="">{recipe.description}</p>
  </div>
  );
};