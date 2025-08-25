import { Slider } from "@/components/ui/slider";
import lodash from "lodash";
import { Fragment, useEffect, useRef, useState, type RefObject } from "react";
import { playerState, type Preview } from "./state";
import { cn, secondsToTime } from "@/lib/utils";

const throttle = lodash.throttle;

const Preview = ({
  sliderRef,
  isHolding,
}: {
  sliderRef: RefObject<HTMLSpanElement | null>;
  isHolding: boolean;
}) => {
  const duration = playerState((state) => state.duration);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewPosition, setPreviewPosition] = useState<number>(0);
  const [previewTime, setPreviewTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const [tipPosition, setTipPosition] = useState<number>(0);

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
      const currentPreview = playerState
        .getState()
        .previews.find(
          (p) => p.startAt <= currentTime && p.endAt >= currentTime
        );

      let position = x;

      setTipPosition(position);

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

  return (
    <Fragment>
      {preview && (
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
            <img src={preview.data} alt="Preview" className="object-contain" />
          </figure>
          <div className="py-1 flex items-center justify-center">
            <p className="text-sm text-app-primary-foreground-muted">
              {secondsToTime(previewTime)}
            </p>
          </div>
        </div>
      )}
      <div
        className={cn(
          "opacity-0 absolute bottom-0 top-0 w-0.5 overflow-hidden bg-white/50 pointer-events-none z-15",
          !isHolding && isVisible && "opacity-100"
        )}
        style={{
          transform: `translateX(calc(${tipPosition}px - 50%))`,
        }}
      />
    </Fragment>
  );
};

export const ControlProgressBar = () => {
  const sliderRef = useRef<HTMLSpanElement>(null);

  const currentTime = playerState((state) => state.currentTime);
  const duration = playerState((state) => state.duration);
  const buffered = playerState((state) => state.buffered);

  const isBuffering = playerState((state) => state.isBuffering);

  const seekTo = playerState((state) => state.actions.seekTo);

  const [localValue, setLocalValue] = useState(currentTime);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (isHolding) return;
    if (isBuffering) return;

    setLocalValue(currentTime);
  }, [currentTime, isHolding, isBuffering]);

  const timeElapsed = currentTime;
  const timeLeft = duration - currentTime;

  return (
    <div className="flex items-center justify-between gap-2 group select-none cursor-default">
      <p className="text-start text-sm text-app-primary-foreground font-mono">
        {secondsToTime(timeElapsed)}
      </p>
      <div className="w-full group relative">
        <Preview sliderRef={sliderRef} isHolding={isHolding} />
        <Slider
          ref={sliderRef}
          defaultValue={[currentTime]}
          value={[localValue]}
          onValueChange={(v) => {
            setLocalValue(v[0]);
            setIsHolding(true);
          }}
          onValueCommit={(v) => {
            seekTo(v[0]);
            setIsHolding(false);
          }}
          max={duration}
          step={1}
          buffered={buffered}
        />
      </div>
      <p className="text-end text-sm text-app-primary-foreground font-mono">
        {secondsToTime(timeLeft)}
      </p>
    </div>
  );
};
