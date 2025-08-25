import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  buffered,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { buffered?: number }) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "px-0 relative flex w-full h-2 touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col group-hover:h-3 transition-all cursor-pointer",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "!h-full bg-white/30 relative grow overflow-hidden rounded-sm data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-red-600 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
        {buffered ? (
          <div
            className="absolute top-0 left-0 bottom-0 bg-white/25 transition-[width] rounded-full -z-1"
            style={{ width: `${buffered || 0}%` }}
          />
        ) : null}
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative bg-red-500 z-20 size-5 block shrink-0 rounded-full shadow-2xl transition-[color,scale,width,height] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer group-hover:scale-120 group-hover:brightness-125"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
