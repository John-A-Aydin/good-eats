import Link from "next/link";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { boolean } from "zod";
import { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import { Carousell } from "./imageCarousell";

/*
  TODO:
   - Make everything clickable to go to full recipe
   - 
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

export const RecipePreview = (props: RecipeWithPicsAndAuthor) => {
  const { recipe, author } = props;

  return (
  <div key={recipe.id} className="p-4 gap-3 border-b border-neutral-600 flex flex-col">
    <div className="flex relative">
      <div className="flex flex-col">
        <Link href={`/${author.username}/${recipe.id}`}>
          <span className="text-2xl font-semibold">{recipe.name}</span>
        </Link>
        
        <div className="flex gap-1 text-slate-400">
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
    <p className="">{recipe.description}</p>
  </div>
  );
};

/*
  Credit to Clint Briley for the carousell:
    https://github.com/fireclint/react-tailwind-slider/blob/main/src/App.js
    https://www.youtube.com/@codecommerce
*/