import type {
  AudioEncodeQuality,
  AudioTrack,
  SubtitleTrack,
  VideoEncodeQuality,
  VideoTrack,
} from "./interfaces";

export interface ProbeResult {
  tracks: (VideoTrack | AudioTrack | SubtitleTrack)[];
}

export interface EncodeVideoResponse {
  path: string;
}

export interface EncodeAudioResponse {
  path: string;
}

export interface ExtractSubtitleResponse {
  path: string;
  language: string;
}

// Manifest

export interface ManifestTrack {
  path: string;
  label?: string;
}

export interface ManifestVideoTrack extends ManifestTrack {
  quality: VideoEncodeQuality;
}
export interface ManifestAudioTrack extends ManifestTrack {
  language: string;
  quality: AudioEncodeQuality;
}
export interface ManifestSubtitleTrack extends ManifestTrack {
  language: string;
  isForced?: boolean;
}

export interface ManifestResponse {
  manifestPath: string;
  dirPath: string;
}

export interface GeneratePreviewResponse {
  path: string;
}

export interface GenerateThumbnailResponse {
  path: string;
}

interface ServerEncodeAction {
  type: "ENCODE_VIDEO";
  externalId: string;
  data: {
    inputUrl: string;
  };
}

export type GetServerActionResponse = ServerEncodeAction;
