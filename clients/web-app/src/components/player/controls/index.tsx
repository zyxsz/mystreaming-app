import { cn, parseLanguage } from "@/lib/utils";
import {
  CaptionsIcon,
  CogIcon,
  Maximize,
  PauseIcon,
  PlayIcon,
  RotateCcw,
  RotateCw,
  SettingsIcon,
  SkipForwardIcon,
  Volume1Icon,
  Volume2,
  Volume2Icon,
  VolumeIcon,
  VolumeOffIcon,
  VolumeXIcon,
} from "lucide-react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ControlProgressBar } from "./progress-bar";
import { playerState } from "./state";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VerticalSlider } from "@/components/ui/vertical-slider";
import lodash from "lodash";
import { TextContainer } from "../text/text-container";
import { ControlButton } from "./buttons";
import { CaptionsButton } from "./buttons/captions";
import { SettingsButton } from "./buttons/settings";
import { PlayerAnimations } from "./animations";
import { VolumeButton } from "./buttons/volume";

const { throttle } = lodash;

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
}

let mouseLeaveTimeout: NodeJS.Timeout;
let mouseMoveTimeout: NodeJS.Timeout;
let onClickTimeout: NodeJS.Timeout;

// Buttons

const PlayButton = () => {
  const isPlaying = playerState((state) => state.isPlaying);
  const isBuffering = playerState((state) => state.isBuffering);

  const togglePlay = playerState((state) => state.actions.togglePlay);

  return (
    <ControlButton onClick={togglePlay} disabled={isBuffering} fill>
      {isBuffering ? (
        <Spinner className="size-10" />
      ) : (
        <Fragment>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Fragment>
      )}
    </ControlButton>
  );
};

const CwButtons = () => {
  // Actions
  const seekPlus = playerState((state) => state.actions.seekPlus);

  return (
    <Fragment>
      <ControlButton onClick={() => seekPlus(-10)}>
        <RotateCcw />
      </ControlButton>
      <ControlButton onClick={() => seekPlus(10)}>
        <RotateCw />
      </ControlButton>
    </Fragment>
  );
};

// Containers

const LoadingContainer = () => {
  // States
  const isBuffering = playerState((state) => state.isBuffering);

  const isVisible = isBuffering;

  return (
    <div
      className={cn(
        //pb-32
        "absolute bg-black/25 z-15 inset-0 flex items-center justify-center flex-col gap-2 opacity-0 transition-opacity pointer-events-none",
        isVisible && "opacity-100"
      )}
    >
      <div className="relative w-full h-full">
        {isBuffering && (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <Spinner className="size-20" />
          </div>
        )}
      </div>
    </div>
  );
};

// Functions

const handleScreenClick = (event: MouseEvent<HTMLDivElement>) => {
  if (event.detail === 2) {
    if (onClickTimeout) clearTimeout(onClickTimeout);

    // usePlayerStore.getState().toggleFullscreen();

    return;
  }

  onClickTimeout = setTimeout(() => {
    playerState.getState().actions.togglePlay();
    // usePlayerStore.getState().playerActions.togglePlay();
  }, 150);
};

export const Controls = ({ videoRef, wrapperRef }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const isLoading = playerState((state) => state.isLoading);
  const isControlsVisible = playerState(
    (state) => state.isControlsVisible || state.isControlsFocused
  );

  // Events

  useEffect(() => {
    function initEvents() {
      if (!videoRef.current) return;

      playerState.setState({
        isLoading: true,
        videoRef: videoRef.current,
      });

      const handleLoaded = () => {
        if (!videoRef.current) return;

        const { player, storage } = playerState.getState();

        player?.configure("abr.defaultBandwidthEstimate", 8000000);
        player?.configure("abr.switchInterval", 2);

        // Load text tracks

        let partialState = {};

        console.log(player);

        if (player) {
          // Load tracks from manifest

          const textTracks = player.getTextTracks().map((track) => ({
            id: track.id,
            language: track.language,
            original: track,
          }));

          const audioTracks = player.getAudioTracks().map((track, index) => ({
            id: index,
            sampleRating: track.audioSamplingRate,
            language: track.language,
            channels: track.channelsCount,
            original: track,
          }));

          const videoTracks = player.getVideoTracks().map((track, index) => ({
            id: index,
            bandwidth: track.bandwidth,
            original: track,
          }));

          partialState = {
            ...partialState,
            textTracks: textTracks,
            audioTracks,
            videoTracks,
          };
          // Load from storage

          const storagePayload = storage.load();

          if (storagePayload.audioQuality || storagePayload.videoQuality) {
            const audioGoal = storagePayload.audioQuality || 0;
            const videoGoal = storagePayload.videoQuality || 0;
            const audioLanguage = storagePayload.audioLanguage || null;

            const numberOfTracksWithLanguage =
              player
                .getVariantTracks()
                .filter((t) => t.language === audioLanguage)?.length > 0;

            const variant =
              audioLanguage && numberOfTracksWithLanguage
                ? player
                    .getVariantTracks()
                    .filter((t) => t.language === audioLanguage)
                    .reduce((prev, cur) =>
                      Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                        Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                      Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                        Math.abs((prev.videoBandwidth || 0) - videoGoal)
                        ? cur
                        : prev
                    )
                : player
                    .getVariantTracks()
                    .reduce((prev, cur) =>
                      Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                        Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                      Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                        Math.abs((prev.videoBandwidth || 0) - videoGoal)
                        ? cur
                        : prev
                    );

            console.log("Local storage variant", variant);

            if (variant) {
              player.selectVariantTrack(variant, true);
              player?.configure("abr.enabled", false);

              partialState = {
                ...partialState,
                selectedVideoQuality: variant.videoBandwidth || undefined,
                selectedAudioQuality: variant.audioSamplingRate || undefined,
                selectedAudioLanguage: variant.language || undefined,
              };
            } else {
              player?.configure("abr.enabled", true);

              const currentAudioTrack = audioTracks.find(
                (t) => t.original.active
              );

              if (currentAudioTrack) {
                partialState = {
                  ...partialState,
                  selectedAudioLanguage: currentAudioTrack.language,
                };
              }
            }
          } else {
            const currentAudioTrack = audioTracks.find(
              (t) => t.original.active
            );
            if (currentAudioTrack) {
              partialState = {
                ...partialState,
                selectedAudioLanguage: currentAudioTrack.language,
              };
            }
          }

          if (storagePayload.textLanguage) {
            const textTrack = player
              .getTextTracks()
              .find((t) => t.language === storagePayload.textLanguage);

            if (textTrack) {
              player.setTextTrackVisibility(true);
              player.selectTextTrack(textTrack);

              partialState = {
                ...partialState,
                selectedTextTrack: {
                  id: textTrack.id,
                  language: textTrack.language,
                  original: textTrack,
                },
              };
            }
          }

          if (storagePayload.volume) {
            videoRef.current.volume = storagePayload.volume / 100;

            partialState = {
              ...partialState,
              volume: storagePayload.volume,
            };
          }
        }

        playerState.setState({
          isLoading: false,
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration,
          isMuted: videoRef.current.muted,
          isPlaying: !videoRef.current.paused,
          ...partialState,
        });
      };

      const handleWaiting = () => {
        if (!videoRef.current) return;

        playerState.setState({
          isBuffering: true,
          currentTime: videoRef.current.currentTime,
        });
      };

      const handleCanPlay = () => {
        if (!videoRef.current) return;

        playerState.setState({
          isBuffering: false,
          currentTime: videoRef.current.currentTime,
        });
      };

      const handlePlay = () => {
        playerState.setState({ isPlaying: true });
      };

      const handlePause = () => {
        playerState.setState({ isPlaying: false });
      };

      const handleTimeUpdate = () => {
        if (!videoRef.current) return;

        const { buffered, duration, currentTime } = videoRef.current;

        playerState.setState({
          currentTime,
          duration,
          buffered: buffered.length
            ? (buffered.end(buffered.length - 1) / duration) * 100
            : 0,
        });
      };

      const handleVolumeChange = () => {
        if (!videoRef.current) return;

        playerState.setState({
          volume: videoRef.current.volume * 100,
          isMuted: videoRef.current.muted,
        });
      };

      videoRef.current.addEventListener("loadedmetadata", handleLoaded);
      videoRef.current.addEventListener("waiting", handleWaiting);
      videoRef.current.addEventListener("canplay", handleCanPlay);
      videoRef.current.addEventListener("play", handlePlay);
      videoRef.current.addEventListener("pause", handlePause);
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("volumechange", handleVolumeChange);

      return () => {
        if (!videoRef.current) return;

        videoRef.current.removeEventListener("loadedmetadata", handleLoaded);
        videoRef.current.removeEventListener("waiting", handleWaiting);
        videoRef.current.removeEventListener("canplay", handleCanPlay);
        videoRef.current.removeEventListener("play", handlePlay);
        videoRef.current.removeEventListener("pause", handlePause);
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        videoRef.current.removeEventListener(
          "volumechange",
          handleVolumeChange
        );
      };
    }

    const destroy = initEvents();

    return destroy;
  }, [videoRef]);

  useEffect(() => {
    function init() {
      console.log(containerRef.current);

      if (!containerRef.current) return;

      const handleKeyPress = (event: KeyboardEvent) => {
        console.log(event);

        switch (event.code) {
          case "Space":
            event.preventDefault();
            playerState.getState().actions.togglePlay();
            break;
          case "KeyM":
            event.preventDefault();
            playerState.getState().actions.toggleMute();
            break;
          case "KeyF":
            event.preventDefault();
            // usePlayerStore.getState().toggleFullscreen();
            break;

          case "ArrowUp":
            event.preventDefault();
            playerState.getState().actions.changeVolumePlus(10);
            break;

          case "ArrowDown":
            event.preventDefault();
            playerState.getState().actions.changeVolumePlus(-10);
            break;

          case "ArrowLeft":
            event.preventDefault();
            playerState.getState().actions.seekPlus(-10);

            break;

          case "ArrowRight":
            event.preventDefault();

            playerState.getState().actions.seekPlus(10);
            break;
          case "KeyT":
            event.preventDefault();

            playerState.setState((state) => ({
              isObjectFitCover: !state.isObjectFitCover,
            }));

            break;
        }
      };

      const handleMouseLeave = () => {
        mouseLeaveTimeout = setTimeout(() => {
          playerState.setState({ isControlsVisible: false });
        }, 200);
      };
      const handleMouseEnter = () => {
        if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout);

        playerState.setState({ isControlsVisible: true });
      };
      const handleMouseMove = () => {
        if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout);
        if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);

        playerState.setState({ isControlsVisible: true });

        mouseMoveTimeout = setTimeout(() => {
          playerState.setState({ isControlsVisible: false });
        }, 2000);
      };

      containerRef.current.addEventListener("keyup", handleKeyPress, {
        capture: true,
      });
      containerRef.current.addEventListener("mousemove", handleMouseMove);
      containerRef.current.addEventListener("mouseenter", handleMouseEnter);
      containerRef.current.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        console.log("remove", containerRef.current);

        containerRef.current?.removeEventListener("keyup", handleKeyPress, {
          capture: true,
        });
        containerRef.current?.removeEventListener("mousemove", handleMouseMove);
        containerRef.current?.removeEventListener(
          "mouseenter",
          handleMouseEnter
        );
        containerRef.current?.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      };
    }

    const destroy = init();

    return destroy;
  }, [containerRef, isLoading]);

  if (isLoading)
    return (
      <div className="absolute inset-0 z-10">
        <div className="w-full h-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <Spinner className="size-24" />
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-between outline-none cursor-none",
        isControlsVisible && "cursor-default"
      )}
      ref={containerRef}
      tabIndex={1}
    >
      <div>{/* //Header */}</div>

      <div className="absolute inset-0 z-30" onClick={handleScreenClick} />

      <PlayerAnimations />
      <LoadingContainer />
      <TextContainer />

      <div
        className={cn(
          "relative w-full flex flex-col gap-4 p-12 pb-8 z-31 opacity-0 pointer-events-none transition-all",
          isControlsVisible && "opacity-100 pointer-events-auto"
        )}
      >
        <ControlProgressBar />

        <div className="flex items-center justify-between gap-12">
          <div className="flex items-center justify-start gap-2">
            <PlayButton />
            <VolumeButton />
            <CwButtons />
          </div>
          <div className="flex items-center justify-end gap-2">
            <ControlButton>
              <SkipForwardIcon />
            </ControlButton>

            <SettingsButton />

            <CaptionsButton />
            <ControlButton>
              <Maximize />
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
};
