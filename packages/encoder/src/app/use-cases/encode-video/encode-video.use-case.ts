import { mapLimit } from "async";
import type {
  AudioEncodeQuality,
  AudioTrack,
  VideoEncodeQuality,
  VideoTrack,
} from "../../../core/types/interfaces";
import type { EncoderService } from "../../services/encoder.service";
import type { ProbeService } from "../../services/probe.service";
import type { Downloader } from "../../utils/downloader";
import type { Path } from "../../utils/path";
import type { SubtitleService } from "../../services/subtitle.service";
import type { ManifestService } from "../../services/manifest.service";
import type { PreviewService } from "../../services/preview.service";
import type { ThumbnailService } from "../../services/thumbnail.service";
import type { StorageService } from "../../services/storage.service";

export interface EncodeVideoDTO {
  inputUrl: string;
  externalId: string;
}

export class EncodeVideoUseCase {
  constructor(
    private downloader: Downloader,
    private path: Path,
    private probeService: ProbeService,
    private encoderService: EncoderService,
    private subtitleService: SubtitleService,
    private manifestService: ManifestService,
    private previewService: PreviewService,
    private thumbnailService: ThumbnailService,
    private storageService: StorageService
  ) {}

  async execute(dto: EncodeVideoDTO) {
    const id = Date.now();

    const encodeDir = this.path.resolve(this.path.getTempDir(), id.toString());
    const videoPath = this.path.resolve(encodeDir, "input.mp4");

    await this.downloader.downloadFile(dto.inputUrl, videoPath);

    const { tracks } = await this.probeService.probe(videoPath);

    const videoTrack = tracks.find((track) => track.type === "VIDEO");
    if (!videoTrack) return console.error("Video track not found");

    const videoQualities = this.getVideoQualities(videoTrack);
    const videoEncodes = await mapLimit(
      videoQualities,
      2,
      async (quality: (typeof videoQualities)[0]) => {
        const response = await this.encoderService.encodeVideo(
          videoPath,
          videoTrack,
          quality
        );

        return { quality, encode: response };
      }
    );

    const audioTracks = tracks.filter((track) => track.type === "AUDIO");
    const audioQualities = audioTracks.map((track) => ({
      qualities: this.getAudioQualities(track),
      track,
    }));
    const audioEncodes = (
      await mapLimit(
        audioQualities,
        2,
        async (trackQuality: (typeof audioQualities)[0]) => {
          return await mapLimit(
            trackQuality.qualities,
            2,
            async (quality: (typeof trackQuality.qualities)[0]) => {
              const response = await this.encoderService.encodeAudio(
                videoPath,
                trackQuality.track,
                quality
              );

              return {
                trackQuality: trackQuality,
                quality: quality,
                encode: response,
              };
            }
          );
        }
      )
    ).reduce((a, b) => [...a, ...b], []);

    const subtitleTracks = tracks.filter((track) => track.type === "SUBTITLE");
    const subtitles = await mapLimit(
      subtitleTracks,
      4,
      async (track: (typeof subtitleTracks)[0]) => {
        const response = await this.subtitleService.extractSubtitle(
          videoPath,
          track
        );

        return { encode: response, track };
      }
    );
    console.log(subtitles);

    const manifestDir = this.path.resolve(encodeDir, "manifest");
    const manifestResponse = await this.manifestService.generate(
      manifestDir,
      videoEncodes.map((videoEncode) => ({
        path: videoEncode.encode.path,
        quality: videoEncode.quality,
      })),
      audioEncodes.map((audioEncode) => ({
        path: audioEncode.encode.path,
        language: audioEncode.trackQuality.track.language,
        label: `${audioEncode.trackQuality.track.language}-${audioEncode.quality}`,
        quality: audioEncode.quality,
      })),
      subtitles.map((subtitleEncode) => ({
        path: subtitleEncode.encode.path,
        language: subtitleEncode.track.language,
        isForced: subtitleEncode.track.isForced,
      }))
    );

    const previews = await this.previewService.generatePreviews(
      videoPath,
      encodeDir,
      manifestDir
    );

    const thumbnails = await this.thumbnailService.generateThumbnail(
      videoPath,
      manifestDir
    );

    console.log(manifestResponse, previews, thumbnails);

    await this.storageService.uploadDir(manifestDir, `enc/${dto.externalId}`);
  }

  private getVideoQualities(track: VideoTrack) {
    if (track.width && track.width >= 1920) {
      return ["1920", "720", "480", "360"] satisfies VideoEncodeQuality[];
    }

    return ["720-plus", "480", "360"] satisfies VideoEncodeQuality[];
  }

  private getAudioQualities(track: AudioTrack) {
    // "128", "256"

    return ["48"] satisfies AudioEncodeQuality[];
  }

  private splitArrayIntoChunks<T>(array: Array<T>, perChunk: number = 2) {
    return array.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, [] as T[][]);
  }
}
