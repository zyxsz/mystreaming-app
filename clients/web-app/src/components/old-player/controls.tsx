/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { cn, getFullUrl, parseLanguage, secondsToTime } from "@/lib/utils";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import { usePlayerStore } from "./state";
import { PlayerButton } from "./button";
import {
  ArrowLeft,
  ArrowLeftIcon,
  ArrowRightIcon,
  CaptionsIcon,
  CheckIcon,
  ChevronDownIcon,
  CogIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SkipForwardIcon,
  TvIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeIcon,
  VolumeOffIcon,
  VolumeXIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { VerticalSlider } from "../ui/vertical-slider";
import lodash from "lodash";
import { Slider } from "../ui/slider";
import { useQuery } from "@tanstack/react-query";

import { format, parseISO } from "date-fns";
import { motion as m } from "motion/react";
import type { Episode, Preview, Season, Title } from "@/types/app";
import { apiClient } from "@/services/api";
import { useNavigate } from "react-router";

const throttle = lodash.throttle;

let onClickTimeout: NodeJS.Timeout;
const Episode = ({
  episode,
  selectedEpisode,
  setSelectedEpisode,
  currentEpisodeId,
  handleChangeEpisode,
}: {
  episode: Episode;
  selectedEpisode: string | null;
  setSelectedEpisode: Dispatch<SetStateAction<string | null>>;
  currentEpisodeId: string | null;
  handleChangeEpisode: (id: string) => void;
}) => {
  return (
    <div
      id={episode.id}
      className={cn(
        "border border-white/10 p-2 rounded-md hover:bg-app-primary-button-hover cursor-pointer select-none",
        selectedEpisode === episode.id && "bg-app-primary-button-hover"
      )}
      onClick={() =>
        setSelectedEpisode((e) => (e === episode.id ? null : episode.id))
      }
      style={{ scrollPaddingTop: 8 }}
    >
      <header className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-4 w-full">
          <h6>Episode {episode.number}</h6>

          {episode.currentProgress ? (
            <div className="relative w-full max-w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-white z-10"
                style={{ width: `${episode.currentProgress.percentage}%` }}
              />
            </div>
          ) : null}
        </div>
        <button className="[&_svg]:size-4 text-app-primary-foreground-muted group-hover:text-app-primary-foreground">
          <ChevronDownIcon />
        </button>
      </header>

      <m.div
        initial={
          selectedEpisode === episode.id ? { height: "auto" } : { height: 0 }
        }
        animate={
          selectedEpisode === episode.id ? { height: "auto" } : { height: 0 }
        }
        className="overflow-hidden"
        key={episode.id + "animation"}
      >
        <div className="pt-4 pb-2 flex items-start gap-4">
          <figure
            className={cn(
              "group relative rounded-md w-full max-w-36 aspect-video overflow-hidden shrink-0",
              currentEpisodeId !== episode.id &&
                episode.isAvailable &&
                "cursor-pointer"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (currentEpisodeId !== episode.id && episode.isAvailable) {
                handleChangeEpisode(episode.id);
              }
            }}
          >
            <img
              src={getFullUrl(episode.bannerKey, "w300")}
              alt="Episode thumbnail"
              style={{ width: "100%", height: "100%", maxWidth: 320 }}
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/30 z-10" />

            {currentEpisodeId !== episode.id && episode.isAvailable ? (
              <div
                className={cn(
                  "absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                )}
              >
                <div className="p-2 bg-black/50 rounded-full">
                  <PlayIcon className="size-4 fill-white text-white" />
                </div>
              </div>
            ) : null}

            {episode.currentProgress ? (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-9">
                <div
                  className="absolute bottom-0 left-0 h-1 bg-white z-10"
                  style={{ width: `${episode.currentProgress.percentage}%` }}
                />
              </div>
            ) : null}
          </figure>

          <div>
            <div className="flex gap-4 items-center">
              <p className="text-xs  text-app-secondary-foreground-muted">
                {episode.airDate &&
                  format(parseISO(episode.airDate), "MMMM dd',' yyyy")}
              </p>
            </div>
            <h4
              className="mt-2 text-sm font-bold app-secondary-foreground line-clamp-1"
              title={episode.name}
            >
              {episode.name}
            </h4>

            <p
              className="text-xs text-app-secondary-foreground-muted line-clamp-3"
              title={episode.overview}
            >
              {episode.overview}
            </p>

            {currentEpisodeId === episode.id ? (
              <p className="mt-2 text-xs text-app-secondary-foreground-muted line-clamp-3">
                Watching now...
              </p>
            ) : (
              <Fragment>
                {episode.isAvailable ? (
                  <button
                    className="mt-2 flex items-center gap-2 text-app-secondary-foreground-muted hover:decoration-solid hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (
                        currentEpisodeId !== episode.id &&
                        episode.isAvailable
                      ) {
                        handleChangeEpisode(episode.id);
                      }
                    }}
                  >
                    <p className="text-xs">Watch now</p>

                    <ArrowRightIcon className="size-4" />
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-app-secondary-foreground-muted line-clamp-3">
                    Not available
                  </p>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </m.div>
    </div>
  );
};

const PlayButton = () => {
  const isPaused = usePlayerStore((state) => state.playerState?.isPaused);

  return (
    <PlayerButton
      onClick={() => usePlayerStore.getState().playerActions.togglePlay()}
      fill
    >
      {!isPaused ? <PauseIcon /> : <PlayIcon />}
    </PlayerButton>
  );
};

const VolumeSlider = () => {
  // const volume = usePlayerStore.getState().playerState?.volume || 0;

  const volume = usePlayerStore((state) => state.playerState?.volume || 0);
  const isMuted = usePlayerStore((state) => state.playerState?.isMuted);

  const toggleMute = usePlayerStore((state) => state.playerActions.toggleMute);

  const [isOpen, setIsOpen] = useState(false);

  const handleValue = (value: number) => {
    usePlayerStore.getState().playerActions.changeVolume(value);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <PlayerButton
            className={cn(isOpen && "[&_svg]:scale-125 text-white")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              toggleMute();
            }}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => e.preventDefault()}
          >
            {isMuted ? (
              <VolumeXIcon />
            ) : (
              <Fragment>
                {volume >= 75 && <Volume2Icon />}
                {volume < 75 && volume >= 25 && <Volume1Icon />}
                {volume < 25 && volume >= 1 && <VolumeIcon />}
                {volume === 0 && <VolumeOffIcon />}
              </Fragment>
            )}
          </PlayerButton>
        </TooltipTrigger>
        <TooltipContent className="p-4 ">
          <VerticalSlider
            key="volume-slider"
            defaultValue={[volume]}
            onValueChange={throttle((v) => handleValue(v[0]), 100)}
            max={100}
            step={1}
            orientation="vertical"
            className="min-h-[200px] w-2"
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SeekButtons = () => {
  const seekPlus = usePlayerStore((state) => state.playerActions.seekPlus);

  return (
    <Fragment>
      <PlayerButton onClick={() => seekPlus(-10)}>
        {<RotateCcwIcon />}
      </PlayerButton>
      <PlayerButton onClick={() => seekPlus(10)}>
        {<RotateCwIcon />}
      </PlayerButton>
    </Fragment>
  );
};

const Preview = ({
  sliderRef,
  isHolding,
}: {
  sliderRef: RefObject<HTMLSpanElement | null>;
  isHolding: boolean;
}) => {
  const duration = usePlayerStore(
    (state) => state.playerState?.duration || 100
  );

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewPosition, setPreviewPosition] = useState<number>(0);
  const [previewTime, setPreviewTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sliderRef.current) return;

    const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current?.getBoundingClientRect();

      const previewSize = 256;

      let x = event.clientX - rect.x;
      const width = rect.width;

      if (x < 0) x = 0;
      if (x > width) x = width;

      const currentTime = (duration * x) / width;
      const currentPreview = usePlayerStore
        .getState()
        .previews.find(
          (p) => p.startAt <= currentTime && p.endAt >= currentTime
        );

      let position = x;

      if (x < previewSize / 2) position = previewSize / 2;
      if (width - x < previewSize / 2) position = width - previewSize / 2;

      setPreviewPosition(position);
      setPreviewTime(currentTime);

      if (currentPreview) {
        setPreview(currentPreview);
      }

      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    sliderRef.current.addEventListener("mousemove", handleMouseMove as any);
    sliderRef.current.addEventListener("mouseenter", handleMouseMove as any);
    sliderRef.current.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (!sliderRef.current) return;

      sliderRef.current.removeEventListener(
        "mousemove",
        handleMouseMove as any
      );
      sliderRef.current.removeEventListener(
        "mouseenter",
        handleMouseMove as any
      );
      sliderRef.current.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [sliderRef, duration]);

  if (!preview) return null;

  return (
    <div
      className={cn(
        "opacity-0 absolute bottom-10 w-64 rounded-2xl overflow-hidden bg-app-primary pointer-events-none",
        !isHolding && isVisible && "opacity-100"
      )}
      style={{
        transform: `translateX(calc(${previewPosition}px - 50%))`,
      }}
    >
      <figure>
        <img src={preview.data} alt="Preview" />
      </figure>
      <div className="py-1 flex items-center justify-center">
        <p className="text-sm text-app-primary-foreground-muted">
          {secondsToTime(previewTime)}
        </p>
      </div>
    </div>
  );
};

const PlayerSlider = () => {
  const sliderRef = useRef<HTMLSpanElement>(null);

  const buffered = usePlayerStore((state) => state.playerState?.buffered);
  const currentTime = usePlayerStore(
    (state) => state.playerState?.currentTime || 0
  );
  const duration = usePlayerStore(
    (state) => state.playerState?.duration || 100
  );
  const seekTo = usePlayerStore((state) => state.playerActions.seekTo);
  const [localValue, setLocalValue] = useState(currentTime);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (isHolding) return;

    setLocalValue(currentTime);
  }, [currentTime, isHolding]);

  return (
    <div className="group relative group py-4">
      <Preview sliderRef={sliderRef} isHolding={isHolding} />
      <Slider
        ref={sliderRef}
        defaultValue={[currentTime]}
        value={[localValue]}
        onValueChange={(v) => {
          setLocalValue(v[0]);
          setIsHolding(true);
        }}
        onValueCommit={throttle((v) => {
          seekTo(v[0]);

          setTimeout(() => {
            setIsHolding(false);
          }, 500);
        }, 500)}
        max={duration}
        step={1}
        buffered={buffered}
      />
    </div>
  );
};

const CaptionsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const textTracks = usePlayerStore(
    (state) => state.playerState?.textTracks || []
  );

  const currentTextTrack = usePlayerStore(
    (state) => state.playerState?.currentTextTrack || null
  );
  const changeTextTrack = usePlayerStore(
    (state) => state.playerActions.changeTextTrack
  );

  const audioTracks = usePlayerStore(
    (state) => state.playerState?.audioTracks || []
  );
  const currentAudioChannel = usePlayerStore(
    (state) => state.playerState?.currentAudioChannel || null
  );
  const currentAudioLanguage = usePlayerStore(
    (state) => state.playerState?.currentAudioLanguage || null
  );
  const changeAudioTrack = usePlayerStore(
    (state) => state.playerActions.changeAudioTrack
  );
  const changeAudioChannels = usePlayerStore(
    (state) => state.playerActions.changeAudioChannels
  );

  const finalAudioTracks = audioTracks.reduce((prev, current) => {
    return {
      ...prev,
      [current.language]: prev[current.language]
        ? prev[current.language].includes(current.channels)
          ? prev[current.language]
          : [...prev[current.language], current.channels]
        : [current.channels],
    };
  }, {} as Record<string, number[]>);

  console.log(finalAudioTracks);

  return (
    <TooltipProvider key="players-captions-provider">
      <Tooltip
        key="players-captions-tooltip"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <PlayerButton
            isHovered={isOpen}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => e.preventDefault()}
          >
            <CaptionsIcon />
          </PlayerButton>
        </TooltipTrigger>
        <TooltipContent
          align="end"
          className={cn(
            "w-xl min-h-72 p-4",
            audioTracks.length > 0 &&
              textTracks.length <= 0 &&
              "w-sm min-h-auto"
          )}
        >
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h2 className="ml-2 mb-2 text-sm text-app-primary-foreground">
                Language
              </h2>
              <div
                className="w-full flex flex-col gap-1  h-full no-scrollbar"
                style={{ maxHeight: 266 }}
              >
                {Object.keys(finalAudioTracks).map((language, index) => {
                  const channels = finalAudioTracks[language];

                  return (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeAudioTrack(language)}
                        className={cn(
                          "flex items-center justify-start p-2 bg-app-primary border border-white/10 rounded-md capitalize flex-1 hover:border-white/25 transition-colors cursor-pointer [&_svg]:size-4 gap-2",
                          currentAudioLanguage === language &&
                            "border-white/25 cursor-default"
                        )}
                      >
                        {parseLanguage(language)}
                        {currentAudioLanguage === language && <CheckIcon />}
                      </button>
                      {channels.length > 0
                        ? channels.map((channel) => (
                            <button
                              key={language + channel + index}
                              className={cn(
                                "relative flex items-center justify-start p-2 px-4 bg-app-primary border border-white/10 rounded-md capitalize hover:border-white/25 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:border-white/10",
                                currentAudioLanguage === language &&
                                  currentAudioChannel === channel &&
                                  "border-white/25 cursor-default"
                              )}
                              title={`${
                                channel === 6 ? "5.1" : channel
                              } audio channel`}
                              onClick={() => changeAudioChannels(channel)}
                              disabled={currentAudioLanguage !== language}
                            >
                              {channel === 6 ? "5.1" : channel}
                              {currentAudioLanguage === language &&
                                currentAudioChannel === channel && (
                                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-4 bg-white rounded-full flex items-center justify-center z-99">
                                    <CheckIcon className="size-3 text-black" />
                                  </div>
                                )}
                            </button>
                          ))
                        : null}
                    </div>
                  );
                })}
              </div>
            </div>
            {textTracks.length > 0 && (
              <div className="flex-1/2">
                <h2 className="ml-2 mb-2 text-sm text-app-primary-foreground">
                  Caption
                </h2>
                <div
                  className="w-full flex flex-col gap-1  h-full overflow-y-auto no-scrollbar"
                  style={{ maxHeight: 266 }}
                >
                  <button
                    className={cn(
                      "capitalize p-2 rounded-md w-full border border-white/10 text-xs text-app-primary-foreground hover:bg-app-primary-button-hover flex items-start justify-between cursor-pointer [&_svg]:size-4",
                      currentTextTrack === null &&
                        "bg-app-primary-button-hover cursor-default"
                    )}
                    onClick={() => changeTextTrack(null)}
                  >
                    Disabled
                    {currentTextTrack === null && <CheckIcon />}
                  </button>
                  {textTracks.map((track) => (
                    <button
                      key={track.id + track.language}
                      className={cn(
                        "border border-white/10 capitalize p-2 rounded-md w-full text-xs text-app-primary-foreground hover:bg-app-primary-button-hover flex items-start justify-between cursor-pointer [&_svg]:size-4",
                        currentTextTrack?.id === track.id &&
                          "bg-app-primary-button-hover cursor-default"
                      )}
                      title={track.language}
                      onClick={() => changeTextTrack(track)}
                    >
                      {track.language && parseLanguage(track.language)}
                      {currentTextTrack?.id === track.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const findBandwidthLabel = (bandwidth: number) => {
  const bandwidths = [
    {
      value: 54000,
      label: "54k",
    },
    {
      value: 126000,
      label: "126k",
    },
    { value: 256000, label: "256k" },
  ];

  return bandwidths.reduce((prev, cur) =>
    Math.abs((cur.value || 0) - bandwidth) <
    Math.abs((prev.value || 0) - bandwidth)
      ? cur
      : prev
  );
};

const QualityButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Video

  const videoQualities = usePlayerStore(
    (state) => state.playerState?.videoQualities || []
  );

  const currentVideoQuality = usePlayerStore(
    (state) => state.playerState?.currentVideoQuality || null
  );

  const changeVideoQuality = usePlayerStore(
    (state) => state.playerActions.changeVideoQuality
  );

  // Audio

  const allAudioQualities = usePlayerStore(
    (state) => state.playerState?.audioQualities || []
  );

  const currentAudioQuality = usePlayerStore(
    (state) => state.playerState?.currentAudioQuality || null
  );

  const currentAudioLanguage = usePlayerStore(
    (state) => state.playerState?.currentAudioLanguage || null
  );
  const currentAudioChannel = usePlayerStore(
    (state) => state.playerState?.currentAudioChannel || null
  );
  const changeAudioQuality = usePlayerStore(
    (state) => state.playerActions.changeAudioQuality
  );

  const audioQualities = allAudioQualities
    .filter(
      (track) =>
        track.language === currentAudioLanguage &&
        track.channels === currentAudioChannel
    )
    .sort((a, b) => b.bitrate - a.bitrate);

  console.log(videoQualities);

  return (
    <TooltipProvider key="players-captions-provider">
      <Tooltip
        key="players-captions-tooltip"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <PlayerButton
            isHovered={isOpen}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => e.preventDefault()}
          >
            <CogIcon />
          </PlayerButton>
        </TooltipTrigger>
        <TooltipContent
          align="end"
          className={cn(
            " p-4 w-sm"
            // audioTracks.length > 0 &&
            //   textTracks.length <= 0 &&
            //   "w-sm min-h-auto"
          )}
        >
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h2 className="ml-2 mb-2 text-sm text-app-primary-foreground">
                Video quality
              </h2>
              <div
                className="w-full flex flex-col gap-1  no-scrollbar"
                style={{ maxHeight: 266 }}
              >
                {videoQualities.map((quality, index) => {
                  return (
                    <button
                      key={quality.bitrate + index}
                      onClick={() => changeVideoQuality(quality.bitrate)}
                      className={cn(
                        "flex items-center justify-start p-2 bg-app-primary border border-white/10 rounded-md capitalize flex-1 hover:border-white/25 transition-colors cursor-pointer [&_svg]:size-4 gap-2",

                        currentVideoQuality === quality.bitrate &&
                          "border-white/25 cursor-default"
                      )}
                    >
                      {quality.height}p
                      {currentVideoQuality === quality.bitrate && <CheckIcon />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="ml-2 mb-2 text-sm text-app-primary-foreground">
                Audio quality
              </h2>
              <div
                className="w-full flex flex-col gap-1  no-scrollbar"
                style={{ maxHeight: 266 }}
              >
                {audioQualities.map((quality, index) => {
                  return (
                    <button
                      key={quality.bitrate + index}
                      onClick={() => changeAudioQuality(quality.bitrate)}
                      className={cn(
                        "flex items-center justify-start p-2 bg-app-primary border border-white/10 rounded-md capitalize flex-1 hover:border-white/25 transition-colors cursor-pointer [&_svg]:size-4 gap-2",

                        currentAudioQuality === quality.bitrate &&
                          "border-white/25 cursor-default"
                      )}
                    >
                      {findBandwidthLabel(quality.bitrate).label}
                      {currentAudioQuality === quality.bitrate && <CheckIcon />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const FullscreenButton = () => {
  return (
    <PlayerButton>
      <MaximizeIcon />
    </PlayerButton>
  );
};

const NextEpisodesButton = ({
  currentEpisodeId,
  handleChangeEpisode,
}: {
  currentEpisodeId: string;
  handleChangeEpisode: (episodeId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: episode } = useQuery<Episode | null>({
    queryKey: ["episodes", currentEpisodeId, "next"],
    queryFn: () => null,
    // queryFn: () => StreamingApi.episodes.findNext(currentEpisodeId as string),
  });

  if (!episode) return null;

  return (
    <TooltipProvider key="players-captions-provider">
      <Tooltip
        key="players-captions-tooltip"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <PlayerButton
            isHovered={isOpen}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => e.preventDefault()}
          >
            <SkipForwardIcon />
          </PlayerButton>
        </TooltipTrigger>
        <TooltipContent
          align="end"
          className={cn(
            "group w-xl min-h-36 p-4 overflow-hidden max-h-96 overflow-y-auto no-scrollbar select-none cursor-pointer"
          )}
          onClick={() => handleChangeEpisode(episode.id)}
        >
          <div className="flex items-center gap-4">
            <figure
              className={cn(
                "relative rounded-md w-full max-w-52 aspect-video overflow-hidden shrink-0",
                currentEpisodeId !== episode.id &&
                  episode.isAvailable &&
                  "cursor-pointer"
              )}
            >
              <img
                src={getFullUrl(episode.bannerKey, "w300")}
                alt="Episode thumbnail"
                style={{ width: "100%", height: "100%", maxWidth: 320 }}
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/30 z-10" />

              <div
                className={cn(
                  "absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                )}
              >
                <div className="p-2 bg-black/50 rounded-full">
                  <PlayIcon className="size-6 fill-white text-white" />
                </div>
              </div>
            </figure>

            <div>
              <div className="flex gap-4 items-center">
                {episode.name !== `Episode ${episode.number}` && (
                  <h3 className="text-xs text-app-secondary-foreground-muted">
                    Episode {episode.number}
                  </h3>
                )}
                <p className="text-xs  text-app-secondary-foreground-muted">
                  {episode.airDate &&
                    format(parseISO(episode.airDate), "MMMM dd',' yyyy")}
                </p>
              </div>
              <h4
                className="mt-2 text-sm font-bold app-secondary-foreground line-clamp-1"
                title={episode.name}
              >
                {episode.name}
              </h4>

              <p
                className="text-xs text-app-secondary-foreground-muted line-clamp-3"
                title={episode.overview}
              >
                {episode.overview}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const EpisodesButton = ({
  titleId,
  currentEpisodeId,
  currentSeasonId,
  handleChangeEpisode,
}: {
  titleId: string;
  currentEpisodeId: string;
  currentSeasonId: string;
  handleChangeEpisode: (episodeId: string) => void;
}) => {
  const episodesContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [tab, setTab] = useState<"SEASONS" | "EPISODES">("EPISODES");
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(
    currentEpisodeId as string
  );

  const [selectedSeason, setSelectedSeason] = useState<string>(
    currentSeasonId as string
  );

  const { data: seasons } = useQuery<Season[]>({
    queryKey: ["titles", titleId, "seasons"],
    queryFn: () =>
      apiClient()
        .v1.content.titles({ titleId })
        .seasons.get()
        .then((r) => r.data),
  });

  const currentSeason = seasons?.find((s) => s.id === selectedSeason);

  const { data: episodes } = useQuery<Episode[]>({
    queryKey: ["seasons", currentSeason?.id, "episodes"],
    queryFn: currentSeason
      ? () =>
          apiClient()
            .v1.content.titles({ titleId })
            .episodes.get({ query: { seasonId: currentSeason?.id } })
            .then((r) => r.data)
      : () => [],
  });

  useEffect(() => {
    if (isOpen && selectedEpisode) {
      setTimeout(() => {
        document.getElementById(selectedEpisode as string)?.scrollIntoView();
      }, 150);
    }
  }, [isOpen]);

  return (
    <TooltipProvider key="players-captions-provider">
      <Tooltip
        key="players-captions-tooltip"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <TooltipTrigger asChild>
          <PlayerButton
            isHovered={isOpen}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={(e) => e.preventDefault()}
          >
            <TvIcon />
          </PlayerButton>
        </TooltipTrigger>
        <TooltipContent
          align="end"
          className={cn(
            "w-xl min-h-96 p-0 overflow-hidden max-h-96 overflow-y-auto no-scrollbar"
          )}
          style={{ scrollPaddingTop: 8 }}
          ref={episodesContainerRef}
        >
          <Fragment>
            {tab === "EPISODES" && (
              <button
                className="w-full border-b border-white/10 p-4 text-sm text-app-primary-foreground-muted flex items-center justify-start gap-4 [&_svg]:size-4 hover:bg-app-primary-button-hover cursor-pointer"
                onClick={() => setTab("SEASONS")}
              >
                <ArrowLeftIcon />
                {currentSeason?.name}
              </button>
            )}

            {tab === "EPISODES" && (
              <div className="p-4 flex flex-col gap-2">
                {episodes &&
                  episodes?.length > 0 &&
                  episodes.map((episode) => (
                    <Episode
                      episode={episode}
                      key={episode.id}
                      selectedEpisode={selectedEpisode}
                      setSelectedEpisode={setSelectedEpisode}
                      currentEpisodeId={currentEpisodeId as string}
                      handleChangeEpisode={handleChangeEpisode}
                    />
                  ))}
              </div>
            )}

            {tab === "SEASONS" && (
              <div className="p-4 flex flex-col gap-2">
                {seasons?.map((season) => (
                  <div
                    key={season.id}
                    className={cn(
                      "group border border-white/10 p-2 rounded-md hover:bg-app-primary-button-hover select-none"
                    )}
                    onClick={() => {
                      setSelectedSeason(season.id);
                      setTab("EPISODES");
                    }}
                  >
                    <header className="flex items-center justify-between cursor-pointer">
                      <h6>{season.name}</h6>
                      <button className="[&_svg]:size-4 text-app-primary-foreground-muted group-hover:text-app-primary-foreground">
                        <ArrowRightIcon />
                      </button>
                    </header>
                  </div>
                ))}
              </div>
            )}
          </Fragment>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Controls = ({
  label,
  title,
  currentEpisodeId,
  currentSeasonId,
  handleChangeEpisode,
}: {
  label?: ReactNode;
  title?: Title;
  currentSeasonId?: string;
  currentEpisodeId?: string;
  handleChangeEpisode?: (episodeId: string) => void;
}) => {
  const navigate = useNavigate();

  const isLoading = usePlayerStore((state) => state.isLoading);
  const isControlsVisible = usePlayerStore(
    (state) =>
      state.playerState?.isControlsVisible ||
      state.playerState?.isControlsFocused ||
      false
  );

  if (isLoading) return null;

  const handleScreenClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.detail === 2) {
      if (onClickTimeout) clearTimeout(onClickTimeout);

      // usePlayerStore.getState().toggleFullscreen();

      return;
    }

    onClickTimeout = setTimeout(() => {
      usePlayerStore.getState().playerActions.togglePlay();
    }, 150);
  };

  const handleGoBack = () => {
    if (!title) return navigate("/");

    navigate(`/titles/${title.id}`);
  };

  return (
    <Fragment>
      <div
        className={cn(
          "absolute inset-0 z-18 pointer-events-none opacity-0 transition-opacity",
          isControlsVisible && "opacity-100"
        )}
        style={{
          zIndex: 9,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.04525560224089631) 66%, rgba(10,10,10,0.34217436974789917) 84%, rgba(10,10,10,0.7847514005602241) 100%)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0 z-18 pointer-events-none opacity-0 transition-opacity",
          isControlsVisible && "opacity-100"
        )}
        style={{
          zIndex: 9,
          background:
            "linear-gradient(0deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.04525560224089631) 74%, rgba(10,10,10,0.34217436974789917) 86%, rgba(10,10,10,0.7847514005602241) 100%)",
        }}
      />

      <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-between select-none z-20">
        <header
          className={cn(
            "p-8 w-full translate-y-0 transition-all z-22",
            !isControlsVisible && "-translate-y-full"
          )}
        >
          <button
            onClick={handleGoBack}
            className="flex items-center gap-4 text-app-primary-foreground hover:underline hover:text-white"
          >
            <ArrowLeft />
            Go back...
          </button>
        </header>

        <div
          className={cn(
            "absolute inset-0 z-20 cursor-pointer",
            !isControlsVisible && "cursor-none"
          )}
          onClick={handleScreenClick}
        />

        <div
          className={cn(
            "p-8 w-full translate-y-0 transition-all z-22",
            !isControlsVisible && "translate-y-full"
          )}
          onMouseEnter={() =>
            usePlayerStore.setState((state) => ({
              playerState: state.playerState
                ? { ...state.playerState, isControlsFocused: true }
                : state.playerState,
            }))
          }
          onMouseLeave={() =>
            usePlayerStore.setState((state) => ({
              playerState: state.playerState
                ? { ...state.playerState, isControlsFocused: false }
                : state.playerState,
            }))
          }
        >
          <PlayerSlider />

          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <PlayButton />
              <VolumeSlider />
              <SeekButtons />

              {label}
            </div>

            <div className="flex items-center justify-end gap-2">
              {handleChangeEpisode && title && title.type === "TV_SHOW" && (
                <Fragment>
                  <NextEpisodesButton
                    handleChangeEpisode={handleChangeEpisode}
                    currentEpisodeId={currentEpisodeId as string}
                  />
                  <EpisodesButton
                    handleChangeEpisode={handleChangeEpisode}
                    currentEpisodeId={currentEpisodeId as string}
                    currentSeasonId={currentSeasonId as string}
                    titleId={title.id}
                  />
                </Fragment>
              )}
              <QualityButton />
              <CaptionsButton />
              <FullscreenButton />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
