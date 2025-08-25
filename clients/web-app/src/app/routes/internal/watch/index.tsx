import { getSession } from "@/app/sessions.server";
import type { Route } from "./+types";
import { apiClient } from "@/services/api";
import {
  replace,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { WatchData } from "@/types/app";
import { Player } from "@/components/old-player";

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  const token = session.get("token");
  if (!token) throw new Error("Token not found");

  const client = apiClient({
    authorization: `Bearer ${token}`,
  });

  const titleId = params.titleId;
  const episodeId = url.searchParams.get("episodeId");

  const data = await client.v1
    .titles({ titleId })
    .watch.get({ query: { episodeId: episodeId || undefined } })
    .then((r) => r.data);

  return { data: data as WatchData };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const { data } = loaderData;

  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get("episodeId");

  useEffect(() => {
    if (!episodeId) return;

    window.history.replaceState(null, "W", `/watch/${params.titleId}`);
  }, [episodeId]);

  if (!data)
    return (
      <div className="w-screen h-screen flex flex-col gap-6 items-center justify-center">
        <Spinner size={64} />
        <p className="text-sm text-app-primary-foreground-muted">
          Loading content...
        </p>
      </div>
    );

  const media = data.current.videos[0];

  if (!media?.id) return null;

  const handleChangeEpisode = (episodeId: string) => {
    console.log("a");
  };

  return (
    <div className="relative w-screen h-screen">
      <Player
        mediaId={media.id}
        title={data.title}
        currentSeasonId={data.current.season?.id}
        currentEpisodeId={data.current.episode?.id}
        handleChangeEpisode={handleChangeEpisode}
        currentProgress={data.current.progress?.currentTime}
        label={
          <div className="pl-4 flex items-center gap-6">
            <h6 className="text-fg font-bold text-app-primary-foreground">
              {data.title.name}
            </h6>

            {data.current.episode && (
              <span className="flex items-center gap-2">
                <p className="text-app-primary-foreground-muted">
                  {data.current.season
                    ? `T${data.current.season.number}:`
                    : null}
                  E{data.current.episode.number}
                </p>
                <p className="text-app-primary-foreground-muted">
                  {data.current.episode.name}
                </p>
              </span>
            )}
          </div>
        }
      />
    </div>
  );
}
