import type { PlaybacksRepository } from "@/app/repositories/playbacks.repository";
import type { CreateDTO, CreateResponse, KeepAliveDTO } from "./playbacks.dto";
import { Playback } from "@/app/entities/playback.entity";
import type { WebTokenService } from "@/app/services/web-token.service";
import { addHours, isBefore } from "date-fns";
import { BadRequestError } from "@/app/errors/bad-request";
import type { StorageService } from "@/app/services/storage.service";
import type { MediasRepository } from "@/app/repositories/medias.repository";
import { DOMParser, XMLSerializer } from "xmldom";
import { env } from "@/config/env";
import { decrypt } from "@/infra/lib/encryption";
import type { EncodesRepository } from "@/app/repositories/encodes.repository";
import { NotFoundError } from "@/app/errors/not-found";
import type { StorageMetricsUseCase } from "../storage-metrics/storage-metrics.use-case";

export class PlaybacksUseCase {
  private BASE_URL: string;

  constructor(
    private playbacksRepository: PlaybacksRepository,
    private mediasRepository: MediasRepository,
    private encodesRepository: EncodesRepository,
    private webTokenService: WebTokenService,
    private storageService: StorageService,
    private storageMetricsUseCase: StorageMetricsUseCase
  ) {
    this.BASE_URL = env.HOST_URL;
  }

  async create(dto: CreateDTO, userId: string): Promise<CreateResponse> {
    const media = await this.mediasRepository.findById(dto.mediaId);

    if (!media) throw new Error("Media not found");

    const encode = await this.encodesRepository.findByMediaId(
      media.id.toString()
    );

    if (!encode) throw new NotFoundError("Encode not found");

    const expiresAt = addHours(new Date(), 4);

    const playback = Playback.create({
      currentTime: null,
      duration: null,
      expiresAt,
      lastKeepAliveAt: null,
      mediaId: dto.mediaId,
      status: "CREATED",
      userId,
    });

    await this.playbacksRepository.save(playback);

    const token = await this.webTokenService.encryptWebToken({
      playbackId: playback.id.toValue(),
      key: encode.key,
      manifestKey: encode.manifestKey,
      userId: userId,
      mediaId: media.id.toString(),
      encodeId: encode.id.toString(),
    });

    return { token, playback };
  }

  async keepAlive(token: string, dto: KeepAliveDTO) {
    const tokenPayload = await this.webTokenService.decryptWebToken<{
      playbackId: string;
    }>(token);

    if (!tokenPayload) throw new BadRequestError("Invalid playback token");

    const playback = await this.playbacksRepository.findById(
      tokenPayload.playbackId
    );

    if (!playback) throw new BadRequestError("Playback not found");

    if (playback.expiresAt && isBefore(playback.expiresAt, new Date())) {
      playback.status = "EXPIRED";

      await this.playbacksRepository.update(playback);

      return { success: false };
    }

    playback.status = "ALIVE";
    playback.duration = (playback.duration || 0) + 30;
    if (dto.currentTime) playback.currentTime = dto.currentTime;

    await this.playbacksRepository.update(playback, true);

    return { success: true };
  }

  async getManifestByToken(token: string) {
    const tokenPayload = await this.webTokenService.decryptWebToken<{
      playbackId: string;
      key: string;
      manifestKey: string;
    }>(token);

    if (!tokenPayload) throw new BadRequestError("Invalid playback token");

    console.log(tokenPayload.manifestKey);

    const object = await this.storageService.getObject(
      tokenPayload.manifestKey!
    );

    const parser = new DOMParser();
    const dom = parser.parseFromString(
      Buffer.from(object.body).toString("utf8"),
      "text/xml"
    );

    // const baseUrls = dom.querySelectorAll("BaseURL");

    const baseUrls = Array.from(dom.getElementsByTagName("BaseURL"));
    const basePath = `${this.BASE_URL}/v1/playbacks/representation`;

    baseUrls.forEach((element) => {
      const key = element.textContent;

      const params = new URLSearchParams();

      params.set("token", token);
      params.set("key", btoa(decodeURIComponent(key!)));

      const representationPath = `${basePath}?${params.toString()}`;

      element.textContent = representationPath;
    });

    const serializer = new XMLSerializer();

    return serializer.serializeToString(dom);
  }

  async getRepresentationByToken(token: string, key: string, range?: string) {
    const tokenPayload = await this.webTokenService.decryptWebToken<{
      playbackId: string;
      key: string;
      manifestKey: string;
      userId: string;
      mediaId: string;
      encodeId: string;
    }>(token);

    if (!tokenPayload) throw new BadRequestError("Invalid playback token");

    const objectKey = `${tokenPayload.key}/${atob(key)}`;
    const url = env.STORAGE_PUBLIC_DOMAIN
      ? `https://${env.STORAGE_PUBLIC_DOMAIN}/${objectKey}`
      : this.storageService.getObjectPresignedUrl(objectKey, range);

    if (range) {
      const length = this.getLengthOfRange(range);

      console.log(length);

      if (length) {
        await this.storageMetricsUseCase.create({
          authorId: tokenPayload.userId,
          reference: tokenPayload.mediaId,
          referenceType: "MEDIA_PLAYBACK",
          bytes: length,
          type: "EGRESS",
          key: objectKey,
          ipAddress: null,
          location: null,
        });
      }
    }

    return url;
  }

  async getEncryptionByToken(token: string) {
    const tokenPayload = await this.webTokenService.decryptWebToken<{
      playbackId: string;
    }>(token);

    if (!tokenPayload) throw new BadRequestError("Invalid playback token");

    const playback = await this.playbacksRepository.findById(
      tokenPayload.playbackId
    );

    if (!playback) throw new BadRequestError("Playback not found");
    if (!playback.mediaId)
      throw new BadRequestError("Playback is not assigned to any media");

    const media = await this.mediasRepository.findById(playback.mediaId);

    if (!media) throw new Error("Media not found");

    const encode = await this.encodesRepository.findByMediaId(
      media.id.toString()
    );

    if (!encode) throw new NotFoundError("Encode not found");

    const keys: Record<string, string> = {};

    encode.encryptions?.forEach((encryption) => {
      const keyId = Buffer.from(decrypt(encryption.keyId!), "hex")
        .toString("base64")
        .replaceAll("=", "")
        .replaceAll("+", "-")
        .replaceAll("/", "_");

      const keyValue = Buffer.from(decrypt(encryption.keyValue!), "hex")
        .toString("base64")
        .replaceAll("=", "")
        .replaceAll("+", "-")
        .replaceAll("/", "_");

      // keys[keyId] = keyValue;
      keys[decrypt(encryption.keyId!)] = decrypt(encryption.keyValue!);
    });

    return {
      // "org.w3.clearkey": {
      // clearKeys:{}
      clearKeys: keys,
      // },
    };
  }

  async getPreviewsByToken(token: string) {
    const tokenPayload = await this.webTokenService.decryptWebToken<{
      playbackId: string;
    }>(token);

    if (!tokenPayload) throw new BadRequestError("Invalid playback token");

    const playback = await this.playbacksRepository.findById(
      tokenPayload.playbackId
    );

    if (!playback) throw new BadRequestError("Playback not found");
    if (!playback.mediaId)
      throw new BadRequestError("Playback is not assigned to any media");

    const media = await this.mediasRepository.findById(playback.mediaId);

    if (!media) throw new Error("Media not found");

    const encode = await this.encodesRepository.findByMediaId(
      media.id.toString()
    );

    if (!encode) throw new NotFoundError("Encode not found");
    if (!encode.previewsKey)
      throw new NotFoundError("Previews not found in encode");

    const object = await this.storageService.getObject(encode.previewsKey);

    const jsonString = Buffer.from(object.body).toString();

    const parsedData = JSON.parse(jsonString);

    return parsedData;
  }

  private getLengthOfRange(range: string) {
    const [start, end] = range.split("-");

    if (!start || !end) return null;

    return parseInt(end) - parseInt(start);
  }
}
