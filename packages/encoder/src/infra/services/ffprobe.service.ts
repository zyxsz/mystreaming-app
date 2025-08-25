import Ffmpeg from "fluent-ffmpeg";
import type { ProbeService } from "../../app/services/probe.service";
import type { ProbeResult } from "../../core/types/services";

export class FFProbeService implements ProbeService {
  async probe(filePath: string): Promise<ProbeResult> {
    const ffmpeg = Ffmpeg();

    const probeData = await new Promise<Ffmpeg.FfprobeData>(
      (resolve, reject) => {
        ffmpeg.addInput(filePath).ffprobe((err, data) => {
          if (err) {
            console.error(err);

            return reject(err);
          }

          resolve({
            ...data,
            streams: data.streams.filter((s) =>
              s.tags?.mimetype ? s.tags?.mimetype !== "image/png" : true
            ),
          });
        });
      }
    );

    return {
      tracks: probeData.streams
        .map((stream) => {
          if (stream.codec_name === "hdmv_pgs_subtitle") return null;

          let language: string | null =
            stream?.tags?.language || stream?.tags?.lang || null;
          let isForced: boolean | null = null;

          if (language) {
            const languageTitle = stream.tags?.title;
            const languageTitleIsForced = languageTitle?.includes("Forced");

            if (languageTitleIsForced) {
              isForced = true;
            }

            if (languageTitle === "Portuguese (Brazilian)") {
              language = "pt-br";
            } else if (languageTitle === "Portuguese (European)") {
              language = "pt";
            }
          }

          const type = ((stream.codec_type === "video" && "VIDEO") ||
            (stream.codec_type === "audio" && "AUDIO") ||
            (stream.codec_type === "subtitle" && "SUBTITLE") ||
            null) as "VIDEO" | "AUDIO" | "SUBTITLE";

          const duration = this.getStreamDuration(stream);

          const codec = stream.codec_name;
          const channels = stream.channels || undefined;

          const width = stream.width;
          const height = stream.height;

          if (type === null) return null;
          if (!stream.codec_name) return null;

          if (language === "und" || !language) {
            language = "eng";
          }

          return {
            index: stream.index,

            duration,
            codec,
            channels,

            language,
            isForced: isForced || undefined,

            width,
            height,

            type: type,
          };
        })
        .filter((v) => v !== null),
    };
  }

  private getStreamDuration(stream: Ffmpeg.FfprobeStream) {
    if (!stream.duration || stream.duration === "N/A") {
      const durationTag = stream?.tags?.["DURATION"];

      if (!durationTag) return 0;

      return this.timemarkToSeconds(durationTag);
    }

    if (!stream.duration) return 0;

    return parseInt(stream.duration);
  }

  private timemarkToSeconds(timemark: string) {
    if (typeof timemark === "number") {
      return timemark;
    }

    if (timemark.indexOf(":") === -1 && timemark.indexOf(".") >= 0) {
      return Number(timemark);
    }

    var parts = timemark.split(":");

    // add seconds
    var secs = Number(parts.pop());

    if (parts.length) {
      // add minutes
      secs += Number(parts.pop()) * 60;
    }

    if (parts.length) {
      // add hours
      secs += Number(parts.pop()) * 3600;
    }

    return secs;
  }
}
