import { EncodeVideoUseCase } from "../app/use-cases/encode-video/encode-video.use-case";
import { AxiosServerService } from "./services/axios-server.service";
import { EC2InstanceService } from "./services/ec2.service";
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

const ec2InstanceService = new EC2InstanceService();
const axiosServerService = new AxiosServerService(ec2InstanceService);

async function fetchAction() {
  const response = await axiosServerService.getAction().catch(() => null);

  return response;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const action = await fetchAction();

  console.log("Action found: ", action);

  if (!action) {
    console.log("Waiting 15s");
    await wait(15000);

    return main();
  }

  if (action.type === "ENCODE_VIDEO") {
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

    await encodeVideoUseCase.execute({
      externalId: action.externalId,
      inputUrl: action.data.inputUrl,
    });
  }
}

main();
