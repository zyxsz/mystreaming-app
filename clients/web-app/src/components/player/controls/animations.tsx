import { Fragment, useEffect } from "react";
import { playerState } from "./state";
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
import { AnimatePresence, motion as m } from "motion/react";

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

export const PlayerAnimations = () => {
  const currentAnimation = playerState(
    (state) => state.currentAnimation || null
  );
  const isBuffering = playerState((state) => state.isBuffering);

  useEffect(() => {
    if (!currentAnimation) return;
    if (animationTimeout) clearTimeout(animationTimeout);

    animationTimeout = setTimeout(() => {
      playerState.setState({
        currentAnimation: null,
      });
    }, 500);
  }, [currentAnimation]);

  const Element =
    currentAnimation &&
    animationIcons[currentAnimation as keyof typeof animationIcons];

  return (
    <Fragment>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <AnimatePresence key="player-animations" mode="popLayout">
          {isBuffering &&
          currentAnimation !== "BACKWARD" &&
          currentAnimation !== "FORWARD"
            ? null
            : currentAnimation && (
                <div
                  style={
                    (currentAnimation === "BACKWARD" && {
                      transform: "translateX(calc(-100% - 4rem))",
                    }) ||
                    (currentAnimation === "FORWARD" && {
                      transform: "translateX(calc(100% + 4rem))",
                    }) ||
                    {}
                  }
                >
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
                </div>
              )}
        </AnimatePresence>
      </div>
    </Fragment>
  );
};
