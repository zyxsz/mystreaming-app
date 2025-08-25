import type { EncoderService } from "../../app/services/encoder.service";
import type {
  VideoTrack,
  VideoEncodeQuality,
  AudioEncodeQuality,
  AudioTrack,
  SubtitleTrack,
} from "../../core/types/interfaces";
import type {
  EncodeAudioResponse,
  EncodeVideoResponse,
  ExtractSubtitleResponse,
  GeneratePreviewResponse,
  GenerateThumbnailResponse,
} from "../../core/types/services";
import Ffmpeg from "fluent-ffmpeg";
import type { LoggerService } from "../../app/services/logger.service";

import lodash from "lodash";
import type { SubtitleService } from "../../app/services/subtitle.service";
import type { PreviewService } from "../../app/services/preview.service";
import { existsSync, mkdir, mkdirSync } from "node:fs";
import type { Path } from "../../app/utils/path";
const { throttle } = lodash;
import fsPromises from "node:fs/promises";
import type { ThumbnailService } from "../../app/services/thumbnail.service";

export class FFmpegService
  implements EncoderService, SubtitleService, PreviewService, ThumbnailService
{
  constructor(
    private logger: LoggerService,
    private path: Path
  ) {}

  async encodeVideo(
    videoPath: string,
    track: VideoTrack,
    quality: VideoEncodeQuality
  ): Promise<EncodeVideoResponse> {
    const outputPath = this.path.resolve(
      this.path.dirname(videoPath),
      `encode-${quality}.mp4`
    );

    const ffmpeg = Ffmpeg();

    ffmpeg.addInput(videoPath);

    const ffmpegOutput = ffmpeg.addOutput(outputPath);

    ffmpegOutput.addOptions("-an", "-c:v", "copy");

    ffmpeg.on(
      "progress",
      throttle((data) => {
        if (data.percent) {
          this.logger.log(
            `Video encoding (${quality}) ${parseFloat(data.percent.toFixed(2))}%`
          );
        }
      }, 5000)
    );

    ffmpeg.once("start", (command: string, ...rest) => {
      this.logger.log("Encoding started");
      // this.logger.log(command);
    });

    ffmpeg.run();

    await new Promise((resolve, reject) => {
      ffmpeg.once("end", () => {
        this.logger.log("Encode finished successfully");

        resolve(true);
      });
    });

    return {
      path: outputPath,
    };
  }

  async encodeAudio(
    videoPath: string,
    track: AudioTrack,
    quality: AudioEncodeQuality
  ): Promise<EncodeAudioResponse> {
    const preset = this.audioQualityPreset[quality];

    const outputPath = this.path.resolve(
      this.path.dirname(videoPath),
      `encode-audio-${preset.name}.mp4`
    );

    const ffmpeg = Ffmpeg();

    ffmpeg.addInput(videoPath);

    const ffmpegOutput = ffmpeg
      .addOutput(outputPath)
      .addOptions("-vn")
      .addOptions("-map", `0:${track.index}`);

    if (track.language)
      ffmpegOutput.addOptions(
        "-metadata:s:a:0",
        `language=${track.language || "eng"}`
      );
    if (preset.options) ffmpegOutput.addOptions(...preset.options);

    ffmpeg.on(
      "progress",
      throttle((data) => {
        if (data.percent) {
          this.logger.log(
            `Audio encoding (${quality}) ${parseFloat(data.percent.toFixed(2))}%`
          );
        }
      }, 5000)
    );

    ffmpeg.once("start", (command: string) => {
      this.logger.log("Audio encoding started");
    });

    ffmpeg.on("error", (err, so, si) => {
      // this.logger.log("Error:", err, so, si);
      console.error(err, so, si);
    });

    ffmpeg.run();

    await new Promise((resolve, reject) => {
      ffmpeg.once("end", () => {
        this.logger.log("Audio encode finished successfully");
        resolve(true);
      });
    });

    return { path: outputPath };
  }

  async extractSubtitle(
    videoPath: string,
    track: SubtitleTrack
  ): Promise<ExtractSubtitleResponse> {
    const outputPath = this.path.resolve(
      this.path.dirname(videoPath),
      `subtitle-${track.index}-${track.language}.ttml`
    );

    const ffmpeg = Ffmpeg();

    ffmpeg.addInput(videoPath);

    const ffmpegOutput = ffmpeg
      .addOutput(outputPath)
      .addOptions("-map", `0:${track.index}`)
      .addOutputOptions("-metadata:s:s:0", `language=${track.language}`);

    ffmpeg.on(
      "progress",
      throttle((data) => {
        if (data.percent) {
          this.logger.log(
            `Extracting subtitles #${track.index} ${track.language} ${parseFloat(data.percent.toFixed(2))}%`
          );
        }
      }, 5000)
    );

    ffmpeg.once("start", (command: string) => {
      this.logger.log("Subtitles extraction started");
    });

    ffmpeg.on("error", (err, so, si) => {
      console.log("Error: ", err, so, si);
    });

    await new Promise((resolve, reject) => {
      ffmpeg.once("end", () => {
        this.logger.log("Subtitles extracted successfully");
        resolve(true);
      });
    });

    return {
      language: track.language,
      path: outputPath,
    };
  }

  async generatePreviews(
    videoPath: string,
    baseDir: string,
    outputDir: string
  ): Promise<GeneratePreviewResponse> {
    const previewsDir = this.path.resolve(baseDir, "previews");
    const previewsPath = this.path.resolve(previewsDir, "%03d.jpg");

    if (!existsSync(previewsDir)) mkdirSync(previewsDir, { recursive: true });

    const ffmpeg = Ffmpeg();
    ffmpeg.addInput(videoPath);

    ffmpeg
      .addOutput(previewsPath) //,scale=512:288
      // , "-q:v", "90"
      .addOptions("-vf", "fps=1/10,scale=1280:-1");

    ffmpeg.on(
      "progress",
      throttle((data) => {
        if (data.percent) {
          console.log(
            `Encoding video previews(s) ${parseFloat(data.percent.toFixed(2))}%`
          );
        }
      }, 5000)
    );

    ffmpeg.once("start", (command: string) => {
      console.log("Audio encoding started", { command });
    });

    ffmpeg.on("error", (err, so, si) => {
      console.log("Error:", err, so, si);
    });

    ffmpeg.run();

    await new Promise((resolve, reject) => {
      ffmpeg.once("end", () => {
        console.log("Audio encode finished successfully");
        resolve(true);
      });
    });

    const outputPath = this.path.resolve(outputDir, `previews.json`);

    const files = await fsPromises.readdir(previewsDir);

    const filesInBase64 = await Promise.all(
      files.map(async (file) => {
        const number = parseInt(file.replace(".jpg", "")) - 1;

        const base64 = await fsPromises.readFile(
          this.path.resolve(previewsDir, file),
          "base64"
        );

        return {
          count: number + 1,
          startAt: number * 10,
          endAt: number * 10 + 9,
          data: `data:image/jpeg;base64,${base64}`,
        };
      })
    );

    await fsPromises.writeFile(outputPath, JSON.stringify(filesInBase64));

    return {
      path: outputPath,
    };
  }

  async generateThumbnail(
    videoPath: string,
    outputDir: string
  ): Promise<GenerateThumbnailResponse> {
    const thumbnailPath = this.path.resolve(outputDir, "thumbnail.jpg");

    const ffmpeg = Ffmpeg();
    ffmpeg.addInput(videoPath);

    ffmpeg.addOutput(thumbnailPath).addOptions("-ss", "123", "-vframes", "1");

    ffmpeg.once("start", (command: string) => {
      console.log("Video thumbnail generation started", { command });
    });

    ffmpeg.on("error", (err, so, si) => {
      console.error("Error:", err, so, si);
    });

    ffmpeg.run();

    await new Promise((resolve, reject) => {
      ffmpeg.once("end", () => {
        console.log("Video thumbnail generated successfully");
        resolve(true);
      });
    });

    return { path: thumbnailPath };
  }

  private audioQualityPreset: Record<
    AudioEncodeQuality,
    {
      options: string[];
      name: string;
    }
  > = {
    "256": {
      name: "256k",
      options: ["-ar", "96000", "-c:a", "aac", "-b:a", "256k", "-ac", "2"],
    },
    "128": {
      name: "128k",
      options: ["-ar", "64000", "-c:a", "aac", "-b:a", "128k", "-ac", "2"],
    },
    "48": {
      name: "48k",
      options: ["-ar", "48000", "-c:a", "aac", "-b:a", "48k", "-ac", "2"],
    },
  };
}
