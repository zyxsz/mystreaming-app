import type { SubtitleTrack } from "../../core/types/interfaces";
import type {
  EncodeAudioResponse,
  ExtractSubtitleResponse,
} from "../../core/types/services";

export abstract class SubtitleService {
  abstract extractSubtitle(
    videoPath: string,
    track: SubtitleTrack
  ): Promise<ExtractSubtitleResponse>;
}
