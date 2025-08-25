/* eslint-disable @next/next/no-img-element */

import type { Title } from "@/api/interfaces/title";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { Link } from "react-router";

type Props = {
  data: Title;
};

export const TitlePoster = ({ data }: Props) => {
  // if (!title.mainBannerKey) return null;

  const image = data.relations?.images?.[0];

  return (
    <Link
      to={`/titles/${data.id}`}
      className="flex items-center flex-col justify-center shadow-2xl"
    >
      <div className="w-full relative rounded-2xl transition-all hover:opacity-65 overflow-hidden cursor-pointer select-none border border-white/8">
        <figure className="w-full h-full relative aspect-[2_/_3]">
          {image && image.extras?.url && (
            <Fragment>
              <img
                className={cn("w-full transition-opacity")}
                src={image.extras.url}
                alt="Content title banner"
                style={{ width: "100%", height: "100%", aspectRatio: "2 / 3" }}
                loading="lazy"
                decoding="async"
              />

              {/* <div className='absolute inset-0 bg-app-primary/20' /> */}
            </Fragment>
          )}
          <div className="absolute inset-0 w-full h-full bg-app-primary-button aspect-[2_/_3] -z-10" />
        </figure>
      </div>
    </Link>
  );
};
