import { cn, getFullUrl } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ArrowRightIcon, PlayIcon } from "lucide-react";

import { Fragment, type ReactNode } from "react";
import type { Episode as EpisodeType } from "@/api/interfaces/episode";
import { Link } from "react-router";

type Props = {
  episode: EpisodeType;
  titleId: string;
  isCurrent?: boolean;
};

export const Episode = ({ episode, titleId, isCurrent }: Props) => {
  const className = cn(
    "relative group bg-app-secondary text-start p-4 rounded-2xl shadow-md flex gap-6 justify-between border border-white/10 transition-colors hover:border-white/25",
    "cursor-pointer",
    isCurrent && "border-neutral-500/35 hover:border-white/25"
  );

  const Element = ({ children }: { className?: string; children: ReactNode }) =>
    //isAvailable
    episode.relations?.isAvailable ? (
      <Link
        to={`/watch/${titleId}?episodeId=${encodeURIComponent(episode.id)}`}
        className={className}
      >
        {children}
      </Link>
    ) : (
      <div className={className}>{children}</div>
    );

  return (
    <Fragment>
      <Element>
        <div className="flex gap-6 items-center">
          <figure
            className="relative rounded-2xl overflow-hidden"
            style={{ minWidth: 320, minHeight: 180 }}
          >
            {episode.bannerKey && (
              <img
                src={getFullUrl(episode.bannerKey, "w500")}
                alt="Episode thumbnail"
                className="absolute inset-0 object-cover"
              />
            )}
            <div
              className="w-full h-full bg-black/25 -z-10"
              style={{ minWidth: 320, minHeight: "100%" }}
            />
            <div className="absolute inset-0 bg-black/30 z-10" />

            {/* //isAvailable */}
            {episode.relations?.isAvailable ? (
              <div
                className={cn(
                  "absolute inset-0 z-20 flex items-center justify-center bg-black/30 transition-all opacity-0 group-hover:opacity-100"
                )}
              >
                <div className="p-4 bg-black/80 rounded-full">
                  <PlayIcon className="size-6 fill-white text-white" />
                </div>
              </div>
            ) : null}

            {/* //episode.currentProgress */}
            {false ? (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-21">
                <div
                  className="absolute bottom-0 left-0 h-1 bg-white z-22"
                  style={{
                    width: `${(episode as any).currentProgress.percentage}%`,
                  }}
                />
              </div>
            ) : null}
          </figure>

          <header className="flex flex-col justify-center w-full h-full">
            <div className="flex gap-4 items-center">
              {episode.name !== `Episode ${episode.number}` && (
                <h3 className="text-sm text-app-secondary-foreground-muted">
                  Episode {episode.number}
                </h3>
              )}
              <p className="text-xs  text-app-secondary-foreground-muted">
                {episode.airDate &&
                  format(parseISO(episode.airDate), "MMMM dd',' yyyy")}
              </p>
            </div>
            <h4 className="mt-2 text-lg font-bold app-secondary-foreground">
              {episode.name}
            </h4>

            <p className="text-sm text-app-secondary-foreground-muted line-clamp-3">
              {episode.overview}
            </p>

            {/* //episode.isAvailable */}
            {episode.relations?.isAvailable ? (
              <button className="mt-4 flex items-center gap-2 text-app-secondary-foreground-muted hover:decoration-solid hover:underline">
                <p className="text-sm">Watch now</p>

                <ArrowRightIcon className="size-4" />
              </button>
            ) : (
              <p className="mt-4 text-sm text-app-secondary-foreground-muted line-clamp-3">
                Not available
              </p>
            )}
          </header>
        </div>
      </Element>
    </Fragment>
  );
};
