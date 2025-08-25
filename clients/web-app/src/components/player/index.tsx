import axios from "axios";
import { useEffect, useRef } from "react";
import { Controls } from "./controls";
import { TextDisplay } from "./text/text-display";
import { playerState } from "./controls/state";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  encryptionData?: object;
  previews?: {
    count: number;
    startAt: number;
    endAt: number;
    data: string;
  }[];
}

export const Player = ({ src, encryptionData, previews }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isObjectFitCover = playerState((state) => state.isObjectFitCover);

  useEffect(() => {
    async function init() {
      if (!videoRef.current) return;

      const shaka = await import("shaka-player/dist/shaka-player.compiled");

      const player = new shaka.Player();
      await player.attach(videoRef.current);

      playerState.setState({ player, previews: previews ? previews : [] });

      // @ts-ignore
      window.player = player;

      // Listen for error events.
      player.addEventListener("error", console.log);

      // shaka.log.setLevel(shaka.log.Level.DEBUG);

      // Try to load a manifest.
      // This is an asynchronous process.

      const manifestData = await axios
        .get(src, { responseType: "arraybuffer" })
        .then((r) => r.data);
      const manifestBlob = new Blob([manifestData], {
        type: "application/dash+xml",
      });

      player.configure({
        textDisplayFactory: () => new TextDisplay(),

        streaming: {
          bufferingGoal: 100,
          bandwidthUpgradeTarget: 0.55,
          bandwidthDowngradeTarget: 0.99,
        },
        drm: encryptionData,
      });

      try {
        await player.load(
          URL.createObjectURL(manifestBlob),
          null,
          "application/dash+xml"
        );
        // This runs if the asynchronous load is successful.
        console.log("The video has now been loaded!");
      } catch (e) {
        // onError is executed if the asynchronous load fails.
        console.log(e);
      }
    }

    init();
  }, [src, videoRef]);

  return (
    <div
      className="relative z-5 w-full h-full bg-black"
      ref={wrapperRef}
      tabIndex={-1}
    >
      <video
        className={cn(
          "absolute inset-0 w-full h-full z-5",
          isObjectFitCover && "object-cover"
        )}
        ref={videoRef}
        autoPlay={false}
      />
      <Controls videoRef={videoRef} wrapperRef={wrapperRef} />
    </div>
  );
};
