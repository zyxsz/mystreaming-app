import type { EncodesRepository } from "@/app/repositories/encodes.repository";
import type {
  CreateDTO,
  FindWithPaginationDTO,
  HandleNotificationPayload,
  NotificationBody,
} from "./encodes.dto";
import {
  Encode,
  type EncodeAudioQuality,
  type EncodeVideoQuality,
} from "@/app/entities/encode.entity";
import type { EncoderService } from "@/app/services/encoder.service";
import { NotFoundError } from "@/app/errors/not-found";
import type { EncrypterService } from "@/app/services/encrypter.service";
import { parseISO } from "date-fns";
import type { MediasRepository } from "@/app/repositories/medias.repository";
import type { UploadsRepository } from "@/app/repositories/uploads.repository";
import type { Pagination } from "@/core/types/pagination";
import type { StorageMetricsUseCase } from "../storage-metrics/storage-metrics.use-case";
import type { EncodeActionsRepository } from "@/app/repositories/encode-actions.repository";
import { EncodeAction } from "@/app/entities/encode-action.entity";
import type { EncodeInstancesService } from "@/app/services/ecndeo-instances.service";

export class EncodesUseCase {
  constructor(
    private encodesRepository: EncodesRepository,
    private mediasRepository: MediasRepository,
    private encoderService: EncoderService,
    private encrypterService: EncrypterService,
    private uploadsRepository: UploadsRepository,
    private storageMetricsUseCase: StorageMetricsUseCase,
    private encodeActionsRepository: EncodeActionsRepository,
    private encodeInstancesService: EncodeInstancesService
  ) {}

  async create(dto: CreateDTO): Promise<Encode> {
    const autoReleaseEncode = true;

    const upload = await this.uploadsRepository.findById(dto.inputId);

    if (!upload) throw new Error("Upload not found");

    const encode = Encode.create({
      inputId: dto.inputId,
      audioQualities: null,
      videoQualities: null,
      costInCents: null,
      endedAt: null,
      progress: null,
      size: null,
      startedAt: null,
      status: "PROCESSING",
      duration: null,
      encryptions: null,
      key: null,
      manifestKey: null,
      previewsKey: null,
      thumbnailKey: null,
    });

    await this.encodesRepository.save(encode);

    if (autoReleaseEncode) {
      await this.releaseEncode(encode, true);
    }

    // await this.encoderService.encode(upload.key, encode);

    return encode;
  }

  async handleNotification(payload: HandleNotificationPayload) {
    if (payload.Type == "SubscriptionConfirmation") {
      console.log(payload.Message, payload.SubscribeURL);

      return;
    }
    if (payload.Type != "Notification")
      return console.log("Wrong type", payload);
    if (!payload.Message) return console.log("No msg type");

    try {
      const body = JSON.parse(payload.Message) as NotificationBody;

      console.log("message", body);

      const encode = await this.encodesRepository.findById(body.externalId);

      if (!encode) throw new NotFoundError("Encode not found");

      if (body.data.type === "PROGRESS") {
        if (body.data.value.status) encode.status = body.data.value.status;
        if (body.data.value.progress)
          encode.progress = body.data.value.progress;

        console.log(encode);

        await this.encodesRepository.update(encode);

        return;
      }

      if (body.data.type === "COMPLETE") {
        const encryptions = body.data.value.encode?.streams.map((s) => ({
          keyId: this.encrypterService.encrypt(s.encryption.keyId),
          keyValue: this.encrypterService.encrypt(s.encryption.keyValue),
        }));

        const videoQualities = body.data.value.encode?.streams
          .filter((s) => s.type === "VIDEO")
          .map(
            (s) =>
              ({
                quality: s.quality,
                isEnabled: true,
                encode: s.encodeDetails,
              }) as EncodeVideoQuality
          );
        const audioQualities = body.data.value.encode?.streams
          .filter((s) => s.type === "AUDIO")
          .map(
            (s) =>
              ({
                quality: s.quality,
                isEnabled: true,
                encode: s.encodeDetails,
              }) as EncodeAudioQuality
          );

        const size = body.data.value.encode?.size;

        const costInCents = body.data.value.encode?.costInCents;
        const startedAt = body.data.value.encode?.startedAt;
        const endedAt = body.data.value.encode?.endedAt;

        // Media props

        const duration = body.data.value.media?.duration;
        const key = body.data.value.media.key;
        const manifestKey = body.data.value.media.manifestKey;
        const thumbnailKey = body.data.value.media.thumbnailKey;
        const previewsKey = body.data.value.media.previewsKey;

        if (videoQualities) encode.videoQualities = videoQualities;
        if (audioQualities)
          encode.audioQualities = audioQualities.filter(
            (el, pos) =>
              audioQualities.findIndex((v) => v.quality === el.quality) === pos
          );

        if (size) encode.size = size;
        if (costInCents) encode.costInCents = costInCents;
        if (startedAt) encode.startedAt = parseISO(startedAt);
        if (endedAt) encode.endedAt = parseISO(endedAt);

        encode.progress = 100;
        encode.status = "COMPLETED";
        encode.duration = duration;
        encode.key = key;
        encode.manifestKey = manifestKey;
        encode.thumbnailKey = thumbnailKey;
        encode.previewsKey = previewsKey;
        encode.encryptions = encryptions;

        await this.encodesRepository.update(encode);

        const media = await this.mediasRepository.findByEncodeId(
          encode.id.toValue()
        );

        if (media) {
          media.status = "AVAILABLE";

          await this.mediasRepository.update(media);
        }

        if (size) {
          await this.storageMetricsUseCase.create({
            authorId: null,
            bytes: size,
            ipAddress: null,
            key,
            location: null,
            reference: encode.id.toString(),
            referenceType: "ENCODE",
            type: "STORE",
          });
        }

        return;
      }
    } catch (e) {
      console.log("Unable to parse", e);
    }
  }

  async findWithPagination(
    dto: FindWithPaginationDTO
  ): Promise<Pagination<Encode>> {
    const result = await this.encodesRepository.findWithPagination(
      dto.page,
      dto.perPage,
      true
    );

    return {
      data: result.data,
      pagination: {
        size: dto.perPage,
        totalPages: result.total,
      },
    };
  }

  async releaseEncode(encode: Encode, isAutomated?: boolean) {
    const action = EncodeAction.create({
      encodeId: encode.id.toString(),
      finishedAt: null,
      isAutomated: isAutomated ?? true,
      status: "PENDING",
      type: "ENCODE_VIDEO",
      userId: null,
    });

    await this.encodeActionsRepository.save(action);
    await this.encodeInstancesService.launchInstance(encode, action);
  }
}
