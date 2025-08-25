export type TrackType = "VIDEO" | "AUDIO" | "SUBTITLE";

export interface VideoTrack {
  index: number;

  duration: number;
  language: string;

  codec?: string;
  isForced?: boolean;

  width?: number;
  height?: number;

  type: "VIDEO";
}

export interface AudioTrack {
  index: number;

  duration: number;
  language: string;

  codec?: string;
  channels?: number;

  type: "AUDIO";
}

export interface SubtitleTrack {
  index: number;

  codec?: string;
  language: string;
  isForced?: boolean;

  type: "SUBTITLE";
}

export type VideoEncodeQuality = "1920" | "720" | "480" | "360" | "720-plus";

export type AudioEncodeQuality = "256" | "128" | "48";
