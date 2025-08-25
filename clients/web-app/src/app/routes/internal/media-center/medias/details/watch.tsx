import { Player } from "@/components/player";
import { useParams } from "react-router";
import type { Route } from "./+types/watch";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  createPlayback,
  getPlaybackEncryptionData,
  getPlaybackPreviews,
} from "@/api/services/playbacks.service";
import type { CreatePlaybackResponse } from "@/api/interfaces/http/playbacks/create-playback";

export default function Page({ params: { mediaId } }: Route.ComponentProps) {
  const [playback, setPlayback] = useState<CreatePlaybackResponse | null>(null);
  const [isPlaybackCreationPending, startPlaybackCreationTransition] =
    useTransition();

  const [encryption, setEncryption] = useState(null);
  const [previews, setPreviews] = useState<
    | {
        count: number;
        startAt: number;
        endAt: number;
        data: string;
      }[]
    | null
  >(null);

  const handleCreatePlayback = () => {
    startPlaybackCreationTransition(async () => {
      const playback = await createPlayback({ mediaId });

      const encryptionData = await getPlaybackEncryptionData(playback.token);
      const previews = await getPlaybackPreviews(playback.token).catch(
        () => []
      );

      setEncryption(encryptionData);
      setPreviews(previews as any);

      setPlayback(playback);
    });
  };

  return (
    <div>
      <figure className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
        {playback && encryption && (
          <Player
            src={`${playback.endpoints.manifest}?token=${encodeURIComponent(playback.token)}`}
            encryptionData={encryption}
            previews={previews || undefined}
          />
        )}
        {playback === null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Button
              onClick={handleCreatePlayback}
              size="icon"
              disabled={isPlaybackCreationPending}
            >
              {isPlaybackCreationPending ? (
                <Spinner className="size-6" />
              ) : (
                <PlayIcon />
              )}
            </Button>
          </div>
        )}
      </figure>
    </div>
  );
}
