import Link from "next/link";
import { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";


type picArray = {
  url: string;
  recipeId: string;
}[];

export const Carousell = (props: {pics: picArray, link?: string}) => {
  const slides = props.pics.map((pic) => {
    return { url: pic.url };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  if (!slides) return;
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
    <div className='max-w-[1400px] h-[600px] w-full m-auto pb-8 px-4 relative group'>
      { props.link ? (
        <Link href={props.link}>
          <div
            style={{ backgroundImage: `url(${// @ts-ignore
                                            slides[currentIndex].url})` }}
            className='w-full h-full rounded-2xl bg-center bg-cover duration-500'
          >
          </div>
        </Link>
      ) : (
        <div
          style={{ backgroundImage: `url(${// @ts-ignore
                                          slides[currentIndex]?.url})` }}
          className='w-full h-full rounded-2xl bg-center bg-cover duration-500'
        >
        </div>
      )}
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
  );
};

/*
  Credit to Clint Briley for the carousell:
    https://github.com/fireclint/react-tailwind-slider/blob/main/src/App.js
    https://www.youtube.com/@codecommerce
*/