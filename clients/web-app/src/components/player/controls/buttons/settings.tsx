import { useEffect, useState, type ComponentProps } from "react";
import { playerState } from "../state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ControlButton } from ".";
import { CaptionsIcon, CheckIcon, SettingsIcon } from "lucide-react";
import { cn, formatFileSize, parseLanguage } from "@/lib/utils";

let settingsTimeout: NodeJS.Timeout;
let settingsLeaveTimeout: NodeJS.Timeout;

export const SettingsButton = () => {
  // State

  const [isButtonHover, setIsButtonHover] = useState(false);
  const [isTooltipHover, setIsTooltipHover] = useState(false);

  // Text
  const videoTracks = playerState((state) => state.videoTracks);
  const selectedVideoQuality = playerState(
    (state) => state.selectedVideoQuality
  );
  const changeVideoQuality = playerState(
    (state) => state.actions.changeVideoQuality
  );

  // Audio
  const audioTracks = playerState((state) => state.audioTracks);
  const selectedAudioQuality = playerState(
    (state) => state.selectedAudioQuality
  );
  const changeAudioQuality = playerState(
    (state) => state.actions.changeAudioQuality
  );

  useEffect(() => {
    playerState.setState({
      isControlsFocused: isButtonHover || isTooltipHover,
    });
  }, [isButtonHover, isTooltipHover]);

  return (
    <TooltipProvider>
      <Tooltip open={isButtonHover || isTooltipHover}>
        <TooltipTrigger asChild>
          <ControlButton
            onMouseEnter={() => {
              if (settingsLeaveTimeout) clearTimeout(settingsLeaveTimeout);
              settingsTimeout = setTimeout(() => {
                setIsButtonHover(true);
              }, 200);
            }}
            onMouseLeave={() => {
              if (settingsTimeout) clearTimeout(settingsTimeout);

              settingsLeaveTimeout = setTimeout(() => {
                setIsButtonHover(false);
              }, 100);
            }}
            hover={isButtonHover || isTooltipHover}
          >
            <SettingsIcon />
          </ControlButton>
        </TooltipTrigger>
        <TooltipContent
          onMouseEnter={() => {
            if (settingsLeaveTimeout) clearTimeout(settingsLeaveTimeout);

            setIsTooltipHover(true);
          }}
          onMouseLeave={() => {
            setIsTooltipHover(false);

            settingsLeaveTimeout = setTimeout(() => {
              setIsButtonHover(false);
            }, 100);
          }}
          align="end"
          side="top"
          className="w-full min-w-[660px] p-0 bg-app-secondary border-white/10 shadow-xl"
        >
          <div className="w-full h-full grid grid-cols-2 gap-1">
            <div className="overflow-hidden">
              <header className="p-4 pr-2">
                <h2 className="text-lg font-bold text-app-secondary-foreground">
                  Video
                </h2>
                <p className="text-sm text-app-secondary-foreground-muted">
                  Select the video bitrate
                </p>
              </header>
              <div className="p-4 pt-0 pr-2 h-full max-h-[300px] overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1">
                  <TrackButton
                    onClick={() => changeVideoQuality()}
                    active={!selectedVideoQuality}
                  >
                    Auto
                  </TrackButton>
                  {videoTracks.map((track) => (
                    <TrackButton
                      onClick={() => changeVideoQuality(track.bandwidth)}
                      active={selectedVideoQuality === track.bandwidth}
                      key={track.id}
                    >
                      {formatFileSize(track.bandwidth)}/s
                    </TrackButton>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              <header className="p-4 pl-2">
                <h2 className="text-lg font-bold text-app-secondary-foreground">
                  Audio
                </h2>
                <p className="text-sm text-app-secondary-foreground-muted">
                  Select the audio sample rate
                </p>
              </header>
              <div className="p-4 pt-0 pl-2 h-full max-h-[300px] overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1">
                  <TrackButton
                    onClick={() => changeAudioQuality()}
                    active={!selectedAudioQuality}
                  >
                    Auto
                  </TrackButton>
                  {audioTracks
                    .filter(
                      (track, index) =>
                        audioTracks.findIndex(
                          (t) => t.sampleRating === track.sampleRating
                        ) === index
                    )
                    .filter((track) => track.sampleRating !== null)
                    .sort((a, b) => b.sampleRating! - a.sampleRating!)
                    .map((track) => (
                      <TrackButton
                        active={selectedAudioQuality === track.sampleRating}
                        onClick={() => changeAudioQuality(track.sampleRating!)}
                        key={track.id}
                      >
                        {track.sampleRating! / 1000}K
                      </TrackButton>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TrackButton = ({
  className,
  active,
  children,
  ...rest
}: { active?: boolean } & ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        "text-sm w-full p-2 bg-app-primary rounded-xl border border-transparent flex items-center justify-between transition-all hover:text-app-primary-foreground text-app-primary-foreground-muted",
        active && "cursor-default brightness-110 text-app-primary-foreground",
        className
      )}
      {...rest}
    >
      {children}
      <CheckIcon
        className={cn(
          "size-4 opacity-0 transition-all translate-x-1/2",
          active && "opacity-100 translate-x-0"
        )}
      />
    </button>
  );
};
