import Link from "next/link";

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Carousell } from "./imageCarousell";
import { PieChart } from "./pieChart";

/*
  TODO:
   - Only render pie chart if nutrition exists
*/


dayjs.extend(relativeTime);

// type RecipeWithUser = RouterOutputs["recipe"]["getAll"][number];

export type RecipeWithPicsAndAuthor = {
  recipe: (
    { 
      pics: {
        url: string;
        recipeId: string;
      }[];
      nutrition: {
        recipeId: string;
        carbs: number;
        protien: number;
        fat: number;
      } | null;
    } & {
      id: string;
      authorId: string;
      name: string;
      createdAt: Date;
      starRating: number;
      description: string;
      instructions: string;
    }
  )
  author: {
    id: string;
    username: string;
    profileImageUrl: string;
  }
}
// TODO add the nutrition numbers back

export const RecipePreview = (props: RecipeWithPicsAndAuthor) => {
  const { recipe, author } = props;

  // const nutrition = recipe.nutrition; // TODO Figrue out wtf this is 
  return (
  <div key={recipe.id} className="p-4 gap-3 border-b border-neutral-600 flex flex-col">
    <div className="flex relative">
      <div className="flex flex-col">
        <Link href={`/${author.username}/${recipe.id}`}>
          <span className="text-2xl font-semibold">{recipe.name}</span>
        </Link>
        
        <div className="flex gap-1 text-neutral-400">
          <Link href={`/${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/${author.username}/${recipe.id}`}>
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
    <Carousell pics={recipe.pics} link={`/${author.username}/${recipe.id}`}/>
    <div className="flex flex-row justify-evenly">
      <p className="w-full">{recipe.description}</p>
      { recipe.nutrition ? (
        <>
        <PieChart size={100} carbs={recipe.nutrition.carbs} protien={recipe.nutrition.protien} fat={recipe.nutrition.fat}/>
        <div className="flex flex-col mt-2 w-full">
          <div className="flex flex-row py-2">
            <svg height={15} width={15} viewBox={`0 0 ${15} ${15}`}><circle r={7.5} cx={7.5} cy={7.5} fill="#FF1700"/></svg>
            <span className="px-2">{`Protien: ${recipe.nutrition.protien} g`}</span> 
          </div>
          <div className="flex flex-row py-2">
            <svg height={15} width={15} viewBox={`0 0 ${15} ${15}`}><circle r={7.5} cx={7.5} cy={7.5} fill="#4D6910"/></svg>
            <span className="px-2">{`Carbs: ${recipe.nutrition.carbs} g`}</span>
          </div>
          <div className="flex flex-row py-2">
            <svg height={15} width={15} viewBox={`0 0 ${15} ${15}`}><circle r={7.5} cx={7.5} cy={7.5} fill="#FFA600"/></svg>
            <span className="px-2">{`Fat: ${recipe.nutrition.fat} g`}</span>
          </div>
        </div>
        </>
      ) : (
        <div>No nutrition info</div>
      )}
      
    </div>
    
  </div>
  );
};
