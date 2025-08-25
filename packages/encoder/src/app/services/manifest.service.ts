import type {
  ManifestAudioTrack,
  ManifestResponse,
  ManifestSubtitleTrack,
  ManifestVideoTrack,
} from "../../core/types/services";

export abstract class ManifestService {
  abstract generate(
    baseDir: string,
    videoTracks: ManifestVideoTrack[],
    audioTracks: ManifestAudioTrack[],
    subtitleTracks: ManifestSubtitleTrack[]
  ): Promise<ManifestResponse>;
}
