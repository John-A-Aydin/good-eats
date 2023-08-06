import Link from "next/link";

import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { boolean } from "zod";
import { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';

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

  const slides = recipe.pics.map((pic) => {
    return { url: pic.url };
  });
  
  if (!slides) return;

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length -1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

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

    <div className='max-w-[1400px] h-[600px] w-full m-auto pb-8 px-4 relative group'>
      <div
        style={{ backgroundImage: `url(${// @ts-ignore
          slides[currentIndex].url})` }}
        className='w-full h-full rounded-2xl bg-center bg-cover duration-500'
      ></div>
      {/* Left Arrow */}
      <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
        <BsChevronCompactLeft onClick={prevSlide} size={30} />
      </div>
      {/* Right Arrow */}
      <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
        <BsChevronCompactRight onClick={nextSlide} size={30} />
      </div>
      <div className='flex top-4 justify-center py-2'>
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className='text-2xl cursor-pointer'
          >
            <RxDotFilled />
          </div>
        ))}
    </div>
    </div> 
    



    <p className="">{recipe.description}</p>
  </div>
  );
};

/*
  Credit to Clint Briley for the carousell:
    https://github.com/fireclint/react-tailwind-slider/blob/main/src/App.js
    https://www.youtube.com/@codecommerce
*/