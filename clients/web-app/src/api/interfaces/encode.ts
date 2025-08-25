import type { Relations } from "./relations";
import type { Upload } from "./upload";

export type EncodeStatus = "IN_QUEUE" | "PROCESSING" | "COMPLETED";

export interface EncodeVideoQuality {
  codec: string;
  bitrate: string | number;
  crf: number;
  preset: "medium" | "veryfast";
  resolution: string;
  name: string;
}

export interface EncodeAudioQuality {
  codec: Record<2 | 6, string>;
  bitrate: string | number;
  crf: (2 | 6)[];
  name: string;
  preset?: undefined;
  resolution?: undefined;
}

export interface Encode extends Relations<{ input: Upload }> {
  id: string;

  inputId: string | null;

  videoQualities: Array<{
    quality: string;
    isEnabled: boolean;
    encode?: EncodeVideoQuality;
  }> | null;
  audioQualities: Array<{
    quality: string;
    isEnabled: boolean;
    encode?: EncodeAudioQuality;
  }> | null;
  size: number | null;

  progress: number | null;
  status: EncodeStatus;

  startedAt: string | null;
  endedAt: string | null;
  costInCents: number | null;

  key: string;
  duration: number;

  updatedAt: string;
  createdAt: string;
}
