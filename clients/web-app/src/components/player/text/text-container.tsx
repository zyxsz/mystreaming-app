import { Fragment, useEffect, useState, type ReactNode } from "react";
import { playerState } from "../controls/state";
import { playerTextStore } from "./state";
import type { Cue } from "./types";
import { cn } from "@/lib/utils";

export const TextContainer = () => {
  const currentTime = playerState((state) => state.currentTime);
  const isVisible = playerTextStore((state) => state.isVisible);

  const [cues, setCues] = useState<Cue[]>([]);

  const isControlsVisible = playerState(
    (state) => state.isControlsVisible || state.isControlsFocused
  );
  // const isControlsFocused = usePlayerStore((state) => state.isControlsFocused);

  // const isControlsVisible = true;

  // const isControlsVisible = playerState(
  //   (state) =>
  //     state.isControlsVisible ||
  //     state.isControlsFocused ||
  //     state.isControlsHovered
  // );

  useEffect(() => {
    const cues = playerTextStore.getState().getChunk(currentTime);

    setCues(cues || []);
  }, [currentTime]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-29 pointer-events-none flex items-end justify-center p-0">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 transition-all",
          !isControlsVisible && "delay-150"
        )}
        style={{
          paddingBottom: !isControlsVisible ? 32 : 188,
        }}
      >
        {cues.length > 0 &&
          cues.map((cue, index) => {
            const texts = cue.payload.split("\n");

            return (
              <Fragment key={index}>
                {texts.map((text: ReactNode, index: number) => (
                  <h1
                    key={index}
                    className="text-white font-medium text-3xl text-center"
                    style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.6)" }}
                  >
                    {text}
                  </h1>
                ))}
              </Fragment>
            );
          })}
      </div>
    </div>
  );
};
