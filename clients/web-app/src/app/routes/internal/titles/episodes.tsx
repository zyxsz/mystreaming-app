import type { Route } from "./+types/episodes";
import type { Episode as EpisodeType } from "@/types/app";
import { Fragment } from "react/jsx-runtime";
import { Suspense } from "react";
import { Await, useLoaderData, useNavigation } from "react-router";
import { Episode } from "@/components/titles/episode";
import { EpisodeSkeleton } from "@/components/skeletons/episode";
import * as cookie from "cookie";
import { getTitleEpisodes } from "@/api/services/content.service";

export async function loader({ params, request }: Route.LoaderArgs) {
  const titleId = params.titleId;

  const cookies = request.headers.get("Cookie");
  if (!cookies) throw Error("cookies header not found, unauthorized");
  const token = cookie.parse(cookies)["token"];

  const url = new URL(request.url);
  const seasonId = url.searchParams.get("seasonId");

  const episodes = getTitleEpisodes(titleId, seasonId || undefined, token);

  return { episodes };
}

const Fallback = () => (
  <Fragment>
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
    <EpisodeSkeleton />
  </Fragment>
);

export default function Page({ params }: Route.ComponentProps) {
  const { episodes } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2 pb-12">
      <Suspense fallback={<Fallback />}>
        <Await resolve={episodes}>
          {(episodes) =>
            episodes.map((episode) => (
              <Episode
                key={episode.id}
                titleId={params.titleId}
                episode={episode}
              />
            ))
          }
        </Await>
      </Suspense>
    </div>
  );
}
