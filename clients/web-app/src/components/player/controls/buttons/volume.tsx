import { Fragment, useEffect, useState } from "react";
import { playerState } from "../state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ControlButton } from ".";
import {
  Volume1Icon,
  Volume2Icon,
  VolumeIcon,
  VolumeOffIcon,
  VolumeXIcon,
} from "lucide-react";
import { VerticalSlider } from "@/components/ui/vertical-slider";
import lodash from "lodash";

const { throttle } = lodash;

let volumeTimeout: NodeJS.Timeout;

export const VolumeButton = () => {
  // State

  const [isButtonHover, setIsButtonHover] = useState(false);
  const [isTooltipHover, setIsTooltipHover] = useState(false);

  const isMuted = playerState((state) => state.isMuted);
  const volume = playerState((state) => state.volume);

  // Actions
  const toggleMute = playerState((state) => state.actions.toggleMute);
  const changeVolume = playerState((state) => state.actions.changeVolume);

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
            onClick={toggleMute}
            onMouseEnter={() => {
              volumeTimeout = setTimeout(() => {
                setIsButtonHover(true);
              }, 200);
            }}
            onMouseLeave={() => {
              if (volumeTimeout) clearTimeout(volumeTimeout);

              setIsButtonHover(false);
            }}
            hover={isButtonHover || isTooltipHover}
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
          </ControlButton>
        </TooltipTrigger>
        <TooltipContent
          onMouseEnter={() => {
            setIsTooltipHover(true);
          }}
          onMouseLeave={() => {
            setIsTooltipHover(false);
          }}
          className="p-4 px-6 bg-app-secondary border-white/3 shadow-xl"
        >
          <VerticalSlider
            key="volume-slider"
            value={isMuted ? [0] : undefined}
            defaultValue={[volume]}
            onValueCommit={throttle((v) => changeVolume(v[0]), 100)}
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
