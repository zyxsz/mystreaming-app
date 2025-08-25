import type {
  AudioEncodeQuality,
  AudioTrack,
  VideoEncodeQuality,
  VideoTrack,
} from "../../core/types/interfaces";
import type {
  EncodeAudioResponse,
  EncodeVideoResponse,
} from "../../core/types/services";

export abstract class EncoderService {
  abstract encodeVideo(
    videoPath: string,
    track: VideoTrack,
    quality: VideoEncodeQuality
  ): Promise<EncodeVideoResponse>;

  abstract encodeAudio(
    videoPath: string,
    track: AudioTrack,
    quality: AudioEncodeQuality
  ): Promise<EncodeAudioResponse>;
}
