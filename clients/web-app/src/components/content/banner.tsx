/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import { Fragment, use, useEffect, useId, useRef, useState } from "react";
// import { Portal } from "@radix-ui/react-portal";
import { AnimatePresence, motion as m } from "motion/react";
// import { ListIcon, PlayIcon, XIcon } from "lucide-react";
import type { CollectionContent } from "@/types/app";
import { Link, NavLink } from "react-router";
import { Spinner } from "../ui/spinner";
import type { Title } from "@/api/interfaces/title";
// import { Tag } from "../ui/tag";
// import { TitleGenres } from "../ui/genres";
// import { Button } from "../ui/button";

type Props = {
  data: Title;
  collectionId: string;
};

export const TitleBanner = ({ data, collectionId }: Props) => {
  const id = useId();
  const elementRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(false);

  const banner = data.relations?.images?.[0];

  const exitAnimationDelay = 0.3 + 0.3 + 0.15;

  useEffect(() => {
    if (isHovered) setMaxZIndex(true);

    // if (timeout.current) clearTimeout(timeout.current);

    // if (!isHovered) {
    //   timeout.current = setTimeout(() => {
    //     setMaxZIndex(false);
    //   }, exitAnimationDelay * 1000);
    // }
  }, [isHovered]);

  return (
    <NavLink
      to={
        data.type == "MOVIE"
          ? `/titles/${data.id}/related`
          : `/titles/${data.id}/episodes`
      }
      className="relative flex items-center flex-col justify-center shadow-2xl group"
      style={maxZIndex ? { zIndex: "999" } : { zIndex: "auto" }}
    >
      {({ isPending }) => (
        <div
          className="w-full h-auto aspect-video relative rounded-2xl transition-all hover:opacity-65 cursor-pointer select-none border border-white/8 bg-app-primary-button"
          style={maxZIndex ? { zIndex: 980 } : { zIndex: "auto" }}
        >
          <m.figure
            layoutId={data.id + id}
            className="w-full h-full relative aspect-video"
          >
            {banner && banner.extras?.url && (
              <img
                className={cn("absolute inset-0 rounded-2xl")}
                src={banner.extras.url}
                alt="Content title banner"
              />
            )}
          </m.figure>

          {isPending && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-2xl z-20 bg-black/50 flex flex-col items-center justify-center"
            >
              <Spinner className="size-12" />
            </m.div>
          )}
        </div>
      )}
    </NavLink>
  );
};

/*
<AnimatePresence key={`${id}-banner-presence`}>
        {isHovered && (
          <m.div
            key={`${id}-banner-1`}
            initial="initial"
            animate="animate"
            whileHover="animate"
            exit="exit"
            variants={{
              initial: { scale: 1 },
              animate: {
                scale: 1.25,
              },
              exit: {
                scale: 1,
                transition: {
                  when: "afterChildren",
                  duration: 0.3,
                  delay: 0.15,
                },
              },
            }}
            className="absolute top-0 left-0 right-0 rounded-2xl overflow-hidden cursor-pointer z-999 shadow-2xl"
          >
            <figure
              className="w-full h-full relative aspect-video"
              style={{ zIndex: 998 }}
            >
              {banner && (
                <img
                  className={cn("absolute inset-0 rounded-2xl")}
                  src={banner.url}
                  alt="Content title banner"
                />
              )}
            </figure>
            <m.div
              variants={{
                initial: {
                  height: 0,
                },
                animate: {
                  height: "auto",
                  transition: {
                    delay: 0.4,
                    duration: 0.3,
                  },
                },
                exit: {
                  height: 0,
                  transition: {
                    duration: 0.3,
                  },
                },
              }}
              // className='scale-75'
            >
              <div className="bg-app-secondary rounded-b-2xl p-4">
                <h1
                  className="text-sm font-bold text-app-primary-foreground "
                  title={data.name}
                >
                  {data.name}
                </h1>
                <h6
                  className="text-xs text-app-primary-foreground-muted"
                  title={data.tagline}
                >
                  {data.tagline}
                </h6>

                <div className="mt-2 flex gap-1 flex-wrap">
                  {data.seasonCount ? (
                    <Tag
                      style={{
                        padding: "0.25rem 0.40rem",
                        fontSize: "0.55rem",
                      }}
                    >
                      {data.seasonCount}{" "}
                      {data.seasonCount === 1 ? "season" : "seasons"}
                    </Tag>
                  ) : data.releaseDate ? (
                    <Tag
                      style={{
                        padding: "0.25rem 0.40rem",
                        fontSize: "0.55rem",
                      }}
                      isLink
                    >
                      {new Date(data.releaseDate).getFullYear()}
                    </Tag>
                  ) : null}
                  <TitleGenres
                    titleId={data.id}
                    tagProps={{
                      style: {
                        padding: "0.25rem 0.40rem",
                        fontSize: "0.55rem",
                      },
                    }}
                  />
                </div>

                <p
                  className="mt-4 text-app-primary-foreground-muted line-clamp-2"
                  style={{ fontSize: "0.65rem" }}
                  title={data.overview}
                >
                  {data.overview}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="white"
                    size="iconSm"
                    className="rounded-full"
                  >
                    <PlayIcon className="fill" />
                  </Button>
                  <Button
                    variant="white"
                    size="iconSm"
                    className="rounded-full"
                  >
                    <ListIcon />
                  </Button>
                  <Button
                    variant="white"
                    size="iconSm"
                    className="rounded-full"
                  >
                    <XIcon />
                  </Button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
*/

// onMouseEnter={async () => {
//   if (animationTimeout.current) clearTimeout(animationTimeout.current);

//   if (cooldownStore.getState().onCooldown) {
//     hoverTimeout.current = setInterval(() => {
//       if (!cooldownStore.getState().onCooldown) {
//         setIsHovered(true);
//       }
//     }, 100);
//     return;
//   }

//   animationTimeout.current = setTimeout(() => {
//     setIsHovered(true);
//   }, 1000);
// }}
// // onMouseMove={() => {
// //   if (cooldownStore.getState().onCooldown) return;

// //   setIsHovered(true);
// // }}
// onMouseLeave={() => {
//   if (hoverTimeout.current) clearInterval(hoverTimeout.current);
//   if (animationTimeout.current) clearTimeout(animationTimeout.current);

//   setIsHovered(false);
//   cooldownStore.setState({ onCooldown: true });

//   cooldownStore.setState({
//     cooldownTimeout: setTimeout(() => {
//       cooldownStore.setState({ onCooldown: false });
//     }, exitAnimationDelay * 1000 - 300),
//   });
// }}
