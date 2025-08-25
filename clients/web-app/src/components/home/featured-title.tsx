import { cn, getFullUrl } from "@/lib/utils";

import { ArrowRightIcon, ListIcon, PlayIcon } from "lucide-react";

import { motion as m, type Variants } from "motion/react";
import { Fragment, useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { GoBackButton } from "../ui/go-back-button";
import { Tag } from "../ui/tag";
import { TitleGenres } from "../ui/genres";
import { Link } from "react-router";
import type { Title } from "@/api/interfaces/title";

type Props = {
  title: Title;
  withDetails?: boolean;
  goBack?: boolean;
  withAnimations?: boolean;
  children?: ReactNode;
};

const animationVariants = {
  initial: {
    x: -16,
  },
  animate: {
    x: 0,
  },
  exit: {
    x: -16,
  },
} satisfies Variants;

export const FeaturedTitle = ({ title, goBack, children }: Props) => {
  // const currentProgress = await StreamingApi.progress.findProgress(title.id);

  return (
    <m.div
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ staggerChildren: 0.02 }}
      key={title.id}
      className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden max-xl:justify-start max-md:justify-end"
    >
      <div className="w-full max-w-[1600px] aspect-video mx-auto z-20 p-8 cursor-default flex items-center justify-start max-md:pb-64">
        <header className="w-full max-w-2xl">
          <div className="space-y-2">
            {goBack && <GoBackButton href="/" />}
            <m.h1
              key={`${title.id}-h1`}
              variants={animationVariants}
              className="text-6xl font-black text-app-primary-foreground line-clamp-2"
              style={{ lineHeight: 1.3 }}
              title={title.name || undefined}
            >
              {title.name}
            </m.h1>
          </div>

          {title.tagline && (
            <m.div
              key={`${title.id}-tagline`}
              variants={animationVariants}
              className="flex items-center gap-2"
            >
              {/* {title.contentRating && (
                  <ContentRatingTag contentRating={title.contentRating} />
                )} */}
              <p className="text-base text-app-primary-foreground-muted text-nowrap overflow-ellipsis line-clamp-1">
                {title.tagline}
              </p>
            </m.div>
          )}

          <div
            className={cn(
              "mt-2 flex flex-col gap-2 max-w-xl",
              title.type === "TV_SHOW" && "gap-4"
            )}
          >
            <div className="flex items-center gap-2">
              {title.releaseDate && (
                <m.span key={`${title.id}-tag-01`} variants={animationVariants}>
                  <Tag isLink>{new Date(title.releaseDate).getFullYear()}</Tag>
                </m.span>
              )}
              <TitleGenres
                titleId={title.id}
                animationVariants={animationVariants}
              />
              {/* <m.span key={`${title.id}-tag-02`} variants={animationVariants}>
                <Tag isLink>Drama</Tag>
              </m.span>
              <m.span key={`${title.id}-tag-03`} variants={animationVariants}>
                <Tag isLink>Action</Tag>
              </m.span> */}
            </div>

            <m.p
              key={`${title.id}-overview`}
              variants={animationVariants}
              className="text-sm text-app-primary-foreground-muted line-clamp-2"
              title={title.overview || undefined}
            >
              {title.overview}
            </m.p>
          </div>

          {/* {currentProgress && (
            <div className='mt-6 w-full max-w-80 select-none'>
              {currentProgress.currentEpisode && (
                <p className='text-sm text-app-primary-foreground'>
                  T{currentProgress.currentEpisode.season?.seasonNumber || "0"}
                  :E
                  {currentProgress.currentEpisode.episodeNumber}
                  <span className='ml-2 text-app-primary-foreground-muted'>
                    {currentProgress.currentEpisode.name}
                  </span>
                </p>
              )}
              <div className='flex items-center gap-2'>
                <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden relative'>
                  <div
                    className='absolute top-0 left-0 bottom-0 bg-white'
                    style={{
                      width: `${currentProgress.progress.percentage}%`,
                    }}
                  />
                </div>
                <p
                  className='text-xs text-app-primary-foreground-muted text-end text-nowrap'
                  style={{
                    minWidth:
                      currentProgress.progress.currentTime <= 3600 ? 40 : 60,
                  }}
                >
                  {secondsToTime(
                    currentProgress.progress.totalDuration -
                      currentProgress.progress.currentTime
                  )}{" "}
                </p>
              </div>
            </div>
          )} */}

          <div className="mt-6 flex items-center gap-2 select-none">
            <m.span key={`${title.id}-button-01`} variants={animationVariants}>
              <Button
                color="white"
                className="[&_svg]:fill-app-primary-foreground hover:[&_svg]:fill-app-primary-foreground-muted"
                asChild
              >
                <Link to={`/watch/${title.id}`}>
                  <PlayIcon className="size-6 fill" />
                  <p>Watch now</p>
                </Link>
              </Button>
            </m.span>

            <m.span key={`${title.id}-button-02`} variants={animationVariants}>
              <Button color="white" size="icon">
                <ListIcon className="size-6" />
              </Button>
            </m.span>
          </div>

          <m.div
            key={`${title.id}-button-plus`}
            variants={animationVariants}
            className="mt-6 select-none"
          >
            <Button variant="link" size="link" asChild>
              <Link to={`/titles/${title.id}`}>
                See details about{" "}
                {title.type === "MOVIE" ? "the movie" : "the show"}
                <ArrowRightIcon />
              </Link>
            </Button>
          </m.div>

          {children}
        </header>
      </div>

      <Fragment>
        {title.bannerKey && (
          <img
            style={{ zIndex: 10 }}
            className="absolute inset-0 w-full h-full aspect-video object-cover object-top"
            src={getFullUrl(title.bannerKey, "w1920")}
            alt="Episode thumbnail"
            loading="eager"
            decoding="async"
            sizes="100vw"
          />
        )}

        <div
          className="absolute top-40 -bottom-1 -left-1 blur-[96px] opacity-85 "
          style={{ zIndex: 11 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            fill="none"
            viewBox="0 0 943 844"
          >
            <path
              fill="#19191E"
              d="M.5-2v832s742.5 39.5 828-17.5 128-142.5 110-270-103-206.5-145-263.5S526-2 416-2z"
            ></path>
          </svg>
        </div>

        <div
          className="absolute right-0 left-0 top-0 bottom-0 w-full h-full aspect-video z-11"
          style={{
            zIndex: 11,
            background:
              "linear-gradient(180deg, rgba(25, 25, 30, 0%) 56%, rgba(25, 25, 30, 76%) 77%, rgba(25, 25, 30, 84%) 87%, #19191E 100%)",
          }}
        />
      </Fragment>
    </m.div>
  );
};
