import { Fragment, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import type { EncodeVideoQuality } from "@/api/interfaces/encode";

interface Props {
  quality: string;
  encode?: EncodeVideoQuality;
}

const QualityLabel: Record<string, string> = {
  "720-plus": "720p",
  "480": "480p",
  "360": "360p",
  "1080": "1080p",
  "720": "720p",
};

export const VideoQualityBadge = ({ quality, encode }: Props) => {
  const label = QualityLabel[quality] || quality;

  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger asChild>
        <span className="text-[0.65rem] bg-white text-black p-0.5 px-1.5 rounded-md font-bold uppercase select-none cursor-pointer">
          <p>{label}</p>
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        {encode ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-6">
              <h6 className="text-xs text-app-primary-foreground-muted">
                Bitrate
              </h6>
              <p className="text-xs text-app-primary-foreground">
                {encode.bitrate}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6">
              <h6 className="text-xs text-app-primary-foreground-muted">
                Resolution
              </h6>
              <p className="text-xs text-app-primary-foreground">
                {encode.resolution}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6">
              <h6 className="text-xs text-app-primary-foreground-muted">
                Codec
              </h6>
              <p className="text-xs text-app-primary-foreground">
                {encode.codec}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6">
              <h6 className="text-xs text-app-primary-foreground-muted">CRF</h6>
              <p className="text-xs text-app-primary-foreground">
                {encode.crf}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6">
              <h6 className="text-xs text-app-primary-foreground-muted">
                Preset
              </h6>
              <p className="text-xs text-app-primary-foreground">
                {encode.preset}
              </p>
            </div>
          </div>
        ) : (
          <p>No information found about this quality encode.</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
