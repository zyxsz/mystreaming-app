import { existsSync, mkdirSync } from "node:fs";
import type { ManifestService } from "../../app/services/manifest.service";
import type {
  ManifestVideoTrack,
  ManifestAudioTrack,
  ManifestSubtitleTrack,
  ManifestResponse,
} from "../../core/types/services";
import type { Path } from "../../app/utils/path";
import { randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import { exec } from "node:child_process";

export class ShakaPackagerService implements ManifestService {
  private packagerPath: string;

  constructor(private path: Path) {
    this.packagerPath = this.path.resolve(
      this.path.getBinDir(),
      process.env.PACKAGER_BIN || "packager"
    );
  }

  async generate(
    baseDir: string,
    videoTracks: ManifestVideoTrack[],
    audioTracks: ManifestAudioTrack[],
    subtitleTracks: ManifestSubtitleTrack[]
  ): Promise<ManifestResponse> {
    const manifestDir = baseDir;
    const manifestPath = this.path.resolve(manifestDir, "manifest.mpd");

    if (!existsSync(manifestDir)) mkdirSync(manifestDir, { recursive: true });

    const manifestVideoTracks = videoTracks.map((videoTrack) => {
      const trackDir = this.path.resolve(
        manifestDir,
        `videos`,
        videoTrack.quality
      );
      const trackPath = this.path.resolve(trackDir, `${randomUUID()}.mp4`);

      if (!existsSync(trackDir)) mkdirSync(trackDir, { recursive: true });

      const keyLabel = `${randomUUID().split("-")[4]}`;
      const keyId = randomBytes(16).toString("hex");
      const keyValue = randomBytes(16).toString("hex");

      return {
        command: `in=${videoTrack.path},stream=video,output=${trackPath},drm_label=${keyLabel}`,
        encryption: {
          label: keyLabel,
          keyId,
          keyValue,
        },
      };
    });

    const manifestAudioTracks = audioTracks.map((audioTrack) => {
      const trackDir = this.path.resolve(
        manifestDir,
        `audios`,
        audioTrack.language,
        audioTrack.quality
      );
      const trackPath = this.path.resolve(trackDir, `${randomUUID()}.mp4`);

      if (!existsSync(trackDir)) mkdirSync(trackDir, { recursive: true });

      const keyLabel = `${randomUUID().split("-")[4]}`;
      const keyId = randomBytes(16).toString("hex");
      const keyValue = randomBytes(16).toString("hex");

      return {
        command: `in=${audioTrack.path},stream=audio,output=${trackPath},language=${audioTrack.language || "eng"},drm_label=${keyLabel}${audioTrack.label ? `,dash_label=${audioTrack.label}` : ""}`,
        encryption: {
          label: keyLabel,
          keyId,
          keyValue,
        },
      };
    });

    const manifestSubtitleTracks = subtitleTracks.map((subtitleTrack) => {
      const trackDir = this.path.resolve(
        manifestDir,
        `audios`,
        subtitleTrack.language
      );
      const trackPath = this.path.resolve(trackDir, `${randomUUID()}.ttml`);

      if (!existsSync(trackDir)) mkdirSync(trackDir, { recursive: true });

      const keyLabel = `${randomUUID().split("-")[4]}`;
      const keyId = randomBytes(16).toString("hex");
      const keyValue = randomBytes(16).toString("hex");

      return {
        command: `in=${subtitleTrack.path},stream=text,output=${trackPath},language=${subtitleTrack.language || "eng"},drm_label=${keyLabel}${subtitleTrack.label ? `,dash_label=${subtitleTrack.label}` : ""}`,
        encryption: {
          label: keyLabel,
          keyId,
          keyValue,
        },
      };
    });

    const manifestTracks = [
      ...manifestVideoTracks,
      ...manifestAudioTracks,
      ...manifestSubtitleTracks,
    ];

    const command = `${this.packagerPath} ${manifestTracks.map((track) => track.command).join(" ")} --clear_lead 0 --keys ${manifestTracks.map((track) => `label=${track.encryption.label}:key_id=${track.encryption.keyId}:key=${track.encryption.keyValue}`).join(",")} --enable_raw_key_encryption --mpd_output ${manifestPath}`;

    console.log(command);

    await new Promise((resolve, reject) => {
      exec(
        command,
        { cwd: import.meta.dirname },
        async (err, stdout, stderr) => {
          if (err || stderr) {
            console.log("Manifest output:", { err, stdout, stderr });
          }

          if (err) {
            // console.log("Error manifest", err);
            console.log("Error while generating manifest", {
              message: err.message || err,
            });

            return reject(err);
          }

          console.log("Manifest generated successfully");

          resolve(stdout);
        }
      );
    });

    await new Promise((resolve) => {
      fs.readFile(manifestPath, "utf8", (err, data) => {
        if (err) {
          console.error("Error while trying to edit manifest file", { err });

          resolve(false);

          return;
        }

        const newData = data
          .replace(
            "<!--Generated with https://github.com/shaka-project/shaka-packager version v3.4.2-c819dea-release-->",
            ""
          )
          .replace("%2F", "/");

        fs.writeFileSync(manifestPath, newData, "utf8");

        console.log("Manifest file edited successfully");

        resolve(true);
      });
    });

    return {
      dirPath: manifestDir,
      manifestPath: manifestPath,
    };

    // const manifestCommand = `${this.packagerPath} ${} ${tracksWithOutput
    //   .map(
    //     (track) =>
    //       `in=${track.path},stream=${getPackagerStreamType(track.type)},output=${
    //         track.outputPath
    //       }${getPackagerStreamLanguage(track.language)}${
    //         track.format ? track.format : ""
    //       },drm_label=${track.encryption.label}${
    //         track.type === "AUDIO" &&
    //         track.label?.toLowerCase()?.includes("descrip")
    //           ? ",dash_roles=description"
    //           : ""
    //       }`
    //   )
    //   .join(" ")} --clear_lead 0 ${
    //   tracksWithOutput.length > 0 ? "--keys " : ""
    // }${tracksWithOutput
    //   .map(
    //     (track) =>
    //       `label=${track.encryption.label}:key_id=${track.encryption.keyId}:key=${track.encryption.keyValue}`
    //   )
    //   .join(",")} --enable_raw_key_encryption --mpd_output ${manifestPath}`;
  }
}
