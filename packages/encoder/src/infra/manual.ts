import { EncodeVideoUseCase } from "../app/use-cases/encode-video/encode-video.use-case";
import { FFmpegService } from "./services/ffmpeg.service";
import { FFProbeService } from "./services/ffprobe.service";
import { LocalLoggerService } from "./services/local-logger.service";
import { PathService } from "./services/path.service";
import { S3Service } from "./services/s3.service";
import { ShakaPackagerService } from "./services/shaka-packager.service";
import { UtilsService } from "./services/utils.service";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretName = "mys-encoder-secrets";
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION,
});

export type SecretsType = {
  STORAGE_BUCKET: string;
  STORAGE_ACCESS_KEY_ID: string;
  STORAGE_SECRET_ACCESS_KEY: string;
  STORAGE_ENDPOINT: string;
  STORAGE_PUBLIC_DOMAIN: string;
};

async function main() {
  const secretsResponse = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );

  if (!secretsResponse.SecretString) return console.error("Secrets not found");

  const secrets = JSON.parse(secretsResponse.SecretString) as SecretsType;

  const localLoggerService = new LocalLoggerService();

  const utilsService = new UtilsService(localLoggerService);
  const pathService = new PathService();
  const probeService = new FFProbeService();
  const ffmpegService = new FFmpegService(localLoggerService, pathService);
  const shakaPackagerService = new ShakaPackagerService(pathService);
  const s3Service = new S3Service(secrets);

  const encodeVideoUseCase = new EncodeVideoUseCase(
    utilsService,
    pathService,
    probeService,
    ffmpegService,
    ffmpegService,
    shakaPackagerService,
    ffmpegService,
    ffmpegService,
    s3Service
  );

  const videoUrl =
    "https://storage.mys.my-archive.online/uploads/6cd3762d-5aac-473d-8afb-68425354f49d";
  const externalId = "1";

  // await encodeVideoUseCase.execute({ externalId, inputUrl: videoUrl });
}

main();
