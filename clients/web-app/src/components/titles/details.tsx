import { cn, formatNumber, getFullUrl, secondsToTime } from "@/lib/utils";
import type { CurrentProgress, Genre } from "@/types/app";
import { GoBackButton } from "../ui/go-back-button";
import { RatingStars } from "../ui/rating-stars";
import { Tag } from "../ui/tag";
import { TitleGenres } from "../ui/genres";
import { Button } from "../ui/button";
import { Await, Link } from "react-router";
import { ListIcon, PlayIcon } from "lucide-react";
import { SeasonsButton } from "./seasons-button";
import { Suspense } from "react";
import type { Title } from "@/api/interfaces/title";

interface Props {
  title: Title;
  genres?: Promise<Genre[]>;
  currentProgress: CurrentProgress | null;
}

export const TitleDetails = ({ title, genres, currentProgress }: Props) => {
  return (
    <div className="w-full h-[76vh] relative flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-2xl mx-auto z-20 p-8 cursor-default">
        <header className="mt-10 w-full max-w-2xl">
          <div className="space-y-2">
            <GoBackButton href="/" />
            <h1
              className="text-6xl font-black text-app-primary-foreground line-clamp-2"
              style={{ lineHeight: 1.3 }}
              title={title.name || undefined}
            >
              {title.name}
            </h1>
          </div>

          <div className="mb-6 flex gap-3 items-center">
            {title.rating && <RatingStars count={5} value={title.rating / 2} />}

            {title.ratingCount && (
              <p className="text-base text-app-primary-foreground-muted select-none">
                {formatNumber(title.ratingCount)} ratings
              </p>
            )}
          </div>

          <div
            className={cn(
              "mt-2 flex flex-col gap-2 max-w-xl",
              title.type === "TV_SHOW" && "gap-4"
            )}
          >
            {title.type === "MOVIE" ? (
              <div className="flex items-center gap-2">
                {title.releaseDate && (
                  <p className="text-sm text-app-primary-foreground-muted ">
                    {new Date(title.releaseDate).getFullYear()}
                  </p>
                )}

                {/* <TitleGenres titleId={title.id} /> */}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SeasonsButton
                  titleId={title.id}
                  // currentSeasonId={currentProgress?.currentEpisode?.seasonId}
                />

                {title.releaseDate && (
                  <Tag isLink>
                    {new Date(title.releaseDate).getFullYear() ||
                      new Date().getFullYear()}
                  </Tag>
                )}
                {genres ? (
                  <Suspense fallback={<p>Loading..</p>}>
                    <Await resolve={genres}>
                      {(genres) =>
                        genres.map((genre) => (
                          <Tag key={genre.id + title.id} isLink>
                            {genre.name}
                          </Tag>
                        ))
                      }
                    </Await>
                  </Suspense>
                ) : (
                  <TitleGenres titleId={title.id} />
                )}
              </div>
            )}

            {title.tagline && (
              <div className="flex items-center gap-2">
                {/* {title.contentRating && (
            <ContentRatingTag contentRating={title.contentRating} />
          )} */}
                <p className="text-base text-app-primary-foreground-muted text-nowrap overflow-ellipsis line-clamp-1">
                  {title.tagline}
                </p>
              </div>
            )}

            <p
              className="text-sm text-app-primary-foreground-muted line-clamp-5"
              title={title.overview || undefined}
            >
              {title.overview}
            </p>
          </div>

          {currentProgress && (
            <div className="mt-6 w-full max-w-80 select-none">
              {currentProgress.currentEpisode && (
                <p className="text-sm text-app-primary-foreground">
                  T{currentProgress.currentEpisode.seasonNumber || "0"}
                  :E
                  {currentProgress.currentEpisode.number}
                  <span className="ml-2 text-app-primary-foreground-muted">
                    {currentProgress.currentEpisode.name}
                  </span>
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-white"
                    style={{
                      width: `${currentProgress.percentage}%`,
                    }}
                  />
                </div>
                <p
                  className="text-xs text-app-primary-foreground-muted text-end text-nowrap"
                  style={{
                    minWidth: currentProgress.currentTime <= 3600 ? 40 : 60,
                  }}
                >
                  {secondsToTime(
                    currentProgress.totalDuration - currentProgress.currentTime
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 select-none">
            <Button
              className="[&_svg]:fill-app-primary-foreground hover:[&_svg]:fill-app-primary-foreground-muted"
              asChild
            >
              <Link to={`/watch/${title.id}`}>
                <PlayIcon className="size-6" />
                <p>Watch now</p>
              </Link>
            </Button>

            <Button size="icon">
              <ListIcon className="size-6" />
            </Button>
          </div>

          {/* <FriendsFeedback /> */}
        </header>
      </div>

      <figure className="w-full h-full absolute z-10 select-none overflow-hidden">
        <img
          className="!absolute !right-0 !top-0 !inset-auto w-full max-w-screen-xl"
          src={getFullUrl(title.bannerKey as string)}
          alt="Episode thumbnail"
        />
        <div
          className="absolute aspect-video right-0 top-0 w-full max-w-screen-xl"
          style={{
            background:
              "linear-gradient(0deg,rgba(25, 25, 30, 1) 0%, rgba(25, 25, 30, 0.78) 36%, rgba(255, 255, 255, 0) 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{
            background:
              "linear-gradient(79deg, #19191e 0%, #19191e 37%, rgba(25, 25, 30, 33%) 68%, rgba(25, 25, 30, 0%) 100%)",
          }}
        />
      </figure>
    </div>
  );
};
