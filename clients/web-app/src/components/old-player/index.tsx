import { Fragment, useEffect, useRef, type ReactNode } from "react";
import {
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeIcon,
  VolumeOffIcon,
  VolumeXIcon,
} from "lucide-react";
import { usePlayerStore } from "./state";

import { cn } from "@/lib/utils";

import { AnimatePresence, motion as m } from "motion/react";
import { Controls } from "./controls";
import type { Title } from "@/types/app";
import { Spinner } from "../ui/spinner";

type Props = {
  mediaId: string;
  label?: ReactNode;
  title?: Title;
  currentSeasonId?: string;
  currentEpisodeId?: string;
  handleChangeEpisode?: (episodeId: string) => void;
  currentProgress?: number;
};

let animationTimeout: NodeJS.Timeout;

const animationIcons = {
  PLAY: <PlayIcon className="size-10 text-white fill-white" />,
  PAUSE: <PauseIcon className="size-10 text-white fill-white" />,
  MINUS_VOLUME: <Volume1Icon className="size-10 text-white " />,
  PLUS_VOLUME: <Volume2Icon className="size-10 text-white " />,
  FULLSCREEN: <MaximizeIcon className="size-10 text-white" />,
  EXIT_FULLSCREEN: <MinimizeIcon className="size-10 text-white" />,
  BACKWARD: <RotateCcwIcon className="size-10 text-white " />,
  FORWARD: <RotateCwIcon className="size-10 text-white" />,
  MUTE_VOLUME: <VolumeXIcon className="size-10 text-white" />,
  VOLUME_75: <Volume2Icon className="size-10 text-white" />,
  VOLUME_25: <Volume1Icon className="size-10 text-white" />,
  VOLUME_1: <VolumeIcon className="size-10 text-white" />,
  VOLUME_0: <VolumeOffIcon className="size-10 text-white" />,
};

const Animation = () => {
  const currentAnimation = usePlayerStore(
    (state) => state.playerState?.currentAnimation || null
  );

  useEffect(() => {
    if (!currentAnimation) return;
    if (animationTimeout) clearTimeout(animationTimeout);

    animationTimeout = setTimeout(() => {
      usePlayerStore.setState((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentAnimation: null }
          : state.playerState,
      }));
    }, 500);
  }, [currentAnimation]);

  const Element = currentAnimation && animationIcons[currentAnimation];

  return (
    <Fragment>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <AnimatePresence key="player-animations" mode="popLayout">
          {currentAnimation && (
            <m.div
              key={`current-animation-${currentAnimation}`}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ bounce: 0.6, duration: 0.15 }}
              className="p-8 bg-black/55 rounded-full"
            >
              {Element}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Fragment>
  );
};

const Captions = () => {
  const isControlsVisible = usePlayerStore(
    (state) =>
      state.playerState?.isControlsVisible ||
      state.playerState?.isControlsFocused ||
      false
  );
  const currentCues = usePlayerStore((state) => state.captionState.currentCues);

  if (currentCues.length <= 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-end justify-center p-8">
      <div
        className="flex flex-col items-center justify-center gap-1 transition-all"
        style={{
          paddingBottom: !isControlsVisible ? 32 : 132,
        }}
      >
        {currentCues.length > 0 &&
          currentCues.map((cue, index) => {
            return (
              <h1
                key={index + (cue.content?.toString() || "")}
                className="text-white font-medium text-3xl text-center"
                style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.6)" }}
                dangerouslySetInnerHTML={{ __html: cue.content }}
              />
            );
          })}
      </div>
    </div>
  );
};

const LoadingSpinner = () => {
  const isLoading = usePlayerStore(
    (state) => state.isLoading || state.playerState?.isLoading
  );

  return (
    <div
      className={cn(
        "absolute inset-0 z-11 bg-black/50 flex items-center justify-center opacity-0 transition-all",
        isLoading && "opacity-100"
      )}
    >
      <Spinner size={80} />
    </div>
  );
};

export const Player = ({
  mediaId,
  label,
  title,
  currentEpisodeId,
  currentSeasonId,
  handleChangeEpisode,
  currentProgress,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitlesContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isControlsVisible = usePlayerStore(
    (state) =>
      state.isLoading ||
      state.playerState?.isControlsVisible ||
      state.playerState?.isControlsFocused ||
      false
  );

  useEffect(() => {
    if (!videoRef.current) return;
    if (!subtitlesContainerRef.current) return;
    if (!containerRef.current) return;

    usePlayerStore
      .getState()
      .init(
        videoRef.current,
        subtitlesContainerRef.current,
        containerRef.current,
        mediaId,
        {
          titleId: title?.id,
          episodeId: currentEpisodeId,
          currentProgress,
        }
      );

    //adc

    return () => {
      usePlayerStore.getState().destroy();
    };
  }, [mediaId, videoRef, containerRef]);

  return (
    <div
      tabIndex={1}
      className={cn(
        "absolute inset-0 bg-black overflow-hidden",
        !isControlsVisible && "cursor-none"
      )}
      ref={containerRef}
    >
      <video className="w-full h-full" ref={videoRef} />
      <div ref={subtitlesContainerRef} />
      <Animation />
      <LoadingSpinner />
      <Controls
        label={label}
        title={title}
        currentEpisodeId={currentEpisodeId}
        currentSeasonId={currentSeasonId}
        handleChangeEpisode={handleChangeEpisode}
      />
      <Captions />
    </div>
  );
};
