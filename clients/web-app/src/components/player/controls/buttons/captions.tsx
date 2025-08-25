import { useEffect, useState, type ComponentProps } from "react";
import { playerState } from "../state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ControlButton } from ".";
import { CaptionsIcon, CheckIcon } from "lucide-react";
import { cn, parseLanguage } from "@/lib/utils";

let captionsTimeout: NodeJS.Timeout;
let captionsLeaveTimeout: NodeJS.Timeout;

export const CaptionsButton = () => {
  // State

  const [isButtonHover, setIsButtonHover] = useState(false);
  const [isTooltipHover, setIsTooltipHover] = useState(false);

  // Text

  const textTracks = playerState((state) => state.textTracks);

  const selectedTextTrack = playerState((state) => state.selectedTextTrack);
  const changeTextTrack = playerState((state) => state.actions.changeTextTrack);

  // Audio

  const audioTracks = playerState((state) => state.audioTracks);

  const selectedAudioLanguage = playerState(
    (state) => state.selectedAudioLanguage
  );
  const changeAudioLanguage = playerState(
    (state) => state.actions.changeAudioLanguage
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
              if (captionsLeaveTimeout) clearTimeout(captionsLeaveTimeout);

              captionsTimeout = setTimeout(() => {
                setIsButtonHover(true);
              }, 200);
            }}
            onMouseLeave={() => {
              if (captionsTimeout) clearTimeout(captionsTimeout);

              captionsLeaveTimeout = setTimeout(() => {
                setIsButtonHover(false);
              }, 150);
            }}
            hover={isButtonHover || isTooltipHover}
          >
            <CaptionsIcon />
          </ControlButton>
        </TooltipTrigger>
        <TooltipContent
          onMouseEnter={() => {
            if (captionsLeaveTimeout) clearTimeout(captionsLeaveTimeout);

            setIsTooltipHover(true);
          }}
          onMouseLeave={() => {
            setIsTooltipHover(false);

            captionsLeaveTimeout = setTimeout(() => {
              setIsButtonHover(false);
            }, 150);
          }}
          align="end"
          side="top"
          className="w-full min-w-[660px] p-0 bg-app-secondary border-white/10 shadow-xl"
        >
          <div className="w-full h-full grid grid-cols-2 gap-1">
            <div className="overflow-hidden">
              <header className="p-4 pr-2">
                <h2 className="text-lg font-bold text-app-secondary-foreground">
                  Caption
                </h2>
                <p className="text-sm text-app-secondary-foreground-muted">
                  Go read a book
                </p>
              </header>
              <div className="p-4 pt-0 pr-2 h-full max-h-[300px] overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1">
                  <TrackButton
                    onClick={() => changeTextTrack(null)}
                    active={!selectedTextTrack}
                  >
                    Disabled
                  </TrackButton>
                  {textTracks.map((track) => (
                    <TrackButton
                      onClick={() => changeTextTrack(track)}
                      active={selectedTextTrack?.id === track.id}
                      key={track.id}
                    >
                      {parseLanguage(track.language)}
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
                  The soul of entertainment
                </p>
              </header>
              <div className="p-4 pt-0 pl-2  h-full max-h-[300px] overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1">
                  {audioTracks
                    .filter(
                      (track, index) =>
                        audioTracks.findIndex(
                          (t) => t.language === track.language
                        ) === index
                    )
                    .map((track) => (
                      <TrackButton
                        active={selectedAudioLanguage === track.language}
                        key={track.id}
                        onClick={() => changeAudioLanguage(track.language)}
                      >
                        {parseLanguage(track.language)}
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
        "capitalize text-sm w-full p-2 bg-app-primary rounded-xl border border-transparent flex items-center justify-between transition-all hover:text-app-primary-foreground text-app-primary-foreground-muted",
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
