import { FeaturedTitle } from "./featured-title";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { FeaturedTitleType } from "@/types/app";
import type { Title } from "@/api/interfaces/title";

type Props = {
  titles: Title[];
};

export const FeaturedContainer = ({ titles }: Props) => {
  console.log(titles);

  const [currentTitle, setCurrentTitle] = useState<Title>(titles[0]);

  const handleNext = () => {
    const index = titles.findIndex((t) => t.id === currentTitle.id);

    if (titles[index + 1]) {
      setCurrentTitle(titles[index + 1]);
    } else {
      setCurrentTitle(titles[0]);
    }
  };

  const handlePrevious = () => {
    const index = titles.findIndex((t) => t.id === currentTitle.id);

    if (titles[index - 1]) {
      setCurrentTitle(titles[index - 1]);
    } else {
      setCurrentTitle(titles[titles.length - 1]);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence key="FEATUREDCONTAINER" mode="popLayout">
        <FeaturedTitle title={currentTitle} withAnimations />
      </AnimatePresence>

      <Button
        className="absolute top-1/2 left-0 translate-x-1/2 z-20 py-10 px-4 shadow-2xl bg-transparent hover:bg-white/20 max-2xl:top-auto max-2xl:bottom-40 max-2xl:translate-y-0"
        onClick={handlePrevious}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 z-20 py-10 px-4  bg-transparent hover:bg-white/20 max-2xl:top-auto max-2xl:bottom-40 max-2xl:translate-y-0 shadow-2xl"
        onClick={handleNext}
      >
        <ChevronRightIcon />
      </Button>

      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
        {titles.map((title) => (
          <button
            key={title.id}
            className={cn(
              "size-4 bg-white/20 rounded-full hover:w-8 hover:bg-white/30 transition-all cursor-pointer origin-center",
              currentTitle.id === title.id && "w-8 bg-white hover:bg-white"
            )}
            onClick={() => setCurrentTitle(title)}
            title={title.name || undefined}
          />
        ))}
      </div>
    </div>
  );
};
