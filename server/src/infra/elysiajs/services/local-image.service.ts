import {
  TitleImage,
  type TitleImageType,
} from "@/app/entities/title-image.entity";
import type { Title } from "@/app/entities/title.entity";
import type { TitleImagesRepository } from "@/app/repositories/title-images.repository";
import type { ImagesService } from "@/app/services/images.service";
import { tmdbService } from "../http/services/tmdb";
import { generateUUID } from "@/infra/lib/uuid";
import type { WebTokenService } from "@/app/services/web-token.service";
import type { StorageService } from "@/app/services/storage.service";
import axios from "axios";
import { env } from "@/config/env";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class LocalImageService implements ImagesService {
  private sqsClient: SQSClient;
  private sqsQueue: string;

  constructor(
    private titleImagesRepository: TitleImagesRepository,
    private webTokenService: WebTokenService,
    private storageService: StorageService
  ) {
    this.sqsClient = new SQSClient({
      region: env.AWS_REGION,
    });
    this.sqsQueue = env.IMAGE_PROCESSOR_SQS_QUEUE;
  }

  async generateImage(
    title: Title,
    imageType: TitleImageType,
    size: number
  ): Promise<void> {
    const alreadyProcessingTitleImage =
      await this.titleImagesRepository.findFirstByTitleIdAndTypeAndSize(
        title.id.toString(),
        imageType,
        size
      );

    if (alreadyProcessingTitleImage) return;
    if (!title.tmdbId) return;

    const width = size || 512;
    const height = width / (imageType === "BANNER" ? 16 / 9 : 2 / 3);

    const images =
      title.type === "MOVIE"
        ? await tmdbService.movie.fetchImages(title.tmdbId).catch(() => null)
        : await tmdbService.tv.fetchImages(title.tmdbId).catch(() => null);

    if (!images) {
      console.log("Images not found", title.id, title.tmdbId);

      return;
    }

    const poster = images?.posters.find((p) => p.iso_639_1 === null);

    if (imageType === "POSTER" && !poster) {
      console.log("Poster not found");

      return;
    }

    const logo = images?.logos[0];

    const key = `images/${
      imageType === "BANNER" ? "banners" : "posters"
    }/${width}/${generateUUID()}.png`;

    const titleImage = TitleImage.create({
      height,
      width,
      isProcessed: false,
      key,
      titleId: title.id.toString(),
      type: imageType,
    });

    await this.titleImagesRepository.save(titleImage);

    const imageToken = await this.webTokenService.encryptWebToken({
      titleId: title.id.toString(),
      imageId: titleImage.id.toString(),
      type: imageType,
      width,
      height,
    });

    const uploadUrl = await this.storageService.generatePutPresignedUrl(key, {
      type: "image/png",
      acl: "public-read",
    });

    const imageData = {
      uploadUrl,
      bannerUrl:
        imageType === "BANNER"
          ? await axios
              .get(
                tmdbService.assets.getFullUrl(
                  title.bannerKey!,
                  width === 512 ? "w500" : undefined
                ),
                { responseType: "arraybuffer" }
              )
              .then(
                (res) =>
                  `data:image/png;base64,${Buffer.from(res.data).toString(
                    "base64"
                  )}`
              )
          : undefined,
      posterUrl:
        imageType === "POSTER"
          ? tmdbService.assets.getFullUrl(
              poster!.file_path,
              width === 512 ? "w500" : undefined
            )
          : undefined,
      logoUrl: logo?.file_path
        ? tmdbService.assets.getFullUrl(
            logo.file_path,
            width === 512 ? "w300" : undefined
          )
        : undefined,

      width: width,
      height: height,

      type: imageType,
      token: imageToken,
      callbackUrl: `${env.HOST_URL}/v1/callback/image-processor`,
    };

    await this.sqsClient.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(imageData),
        QueueUrl: this.sqsQueue,
      })
    );

    console.log("Send image process, ", JSON.stringify(imageData));
  }
}
