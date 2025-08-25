import type { MediasRepository } from "@/app/repositories/medias.repository";
import type {
  AssignMediaDTO,
  CreateDTO,
  FindManyAssignsWithPaginationDTO,
  FindWithPaginationDTO,
  FindWithPlaybacksPaginationDTO,
} from "./medias.dto";
import { Media } from "@/app/entities/media.entity";
import type { Pagination } from "@/core/types/pagination";
import { NotFoundError } from "@/app/errors/not-found";
import type { StorageService } from "@/app/services/storage.service";
import type { StorageMetricsUseCase } from "../storage-metrics/storage-metrics.use-case";
import type { EncodesUseCase } from "../encodes/encodes.use-case";
import type { UploadsRepository } from "@/app/repositories/uploads.repository";
import type { PlaybacksRepository } from "@/app/repositories/playbacks.repository";
import type { Playback } from "@/app/entities/playback.entity";
import type { MediaAssignsRepository } from "@/app/repositories/media-assigns-repository";
import { MediaAssign } from "@/app/entities/media-assign";
import { BadRequestError } from "@/app/errors/bad-request";

export class MediasUseCase {
  constructor(
    private mediasRepository: MediasRepository,
    private playbacksRepository: PlaybacksRepository,
    private encodesUseCase: EncodesUseCase,
    private uploadsRepository: UploadsRepository,
    private mediaAssignsRepository: MediaAssignsRepository
  ) {}

  async findWithPagination(
    dto: FindWithPaginationDTO
  ): Promise<Pagination<Media>> {
    const results = await this.mediasRepository.findWithPagination(
      dto.page,
      dto.perPage
    );

    return {
      data: results.data,
      pagination: {
        size: dto.perPage,
        totalPages: results.total,
      },
    };
  }

  async findById(id: string): Promise<Media> {
    const media = await this.mediasRepository.findById(id);

    if (!media) throw new NotFoundError("Media not found");

    return media;
  }

  async create(dto: CreateDTO): Promise<Media> {
    const upload = await this.uploadsRepository.findById(dto.uploadId);

    if (!upload) throw new Error("Upload not found");

    const media = Media.create({
      encodeId: null,
      status: "CREATED",
      updatedAt: null,
      name: dto.name,
    });

    if (dto.autoEncode) {
      const encode = await this.encodesUseCase.create({
        inputId: upload.id.toString(),
      });

      media.encodeId = encode.id.toString();
      media.status = "WAITING_ENCODE";
    }

    await this.mediasRepository.save(media);

    return media;
  }

  async delete(id: string, authorId: string | null): Promise<void> {
    const media = await this.mediasRepository.findById(id);

    if (!media) throw new NotFoundError("Media not found");

    // if (media.status === "AVAILABLE" && media.key) {
    // await this.storageService.deleteObject(media.key);
    // await this.storageMetricsUseCase.create({
    //   authorId,
    //   bytes: -1,
    //   ipAddress: null,
    //   location: null,
    //   key: media.key,
    //   reference: media.id.toValue(),
    //   referenceType: "ENCODE",
    //   type: "DELETE",
    // });
    // }

    await this.mediasRepository.delete(media);

    return;
  }

  async findManyPlaybacksById(
    id: string,
    dto: FindWithPlaybacksPaginationDTO
  ): Promise<Pagination<Playback>> {
    const media = await this.mediasRepository.findById(id);

    if (!media) throw new NotFoundError("Media not found");

    await this.playbacksRepository.updateAllStatus();

    const result =
      await this.playbacksRepository.findManyWithPaginationByMediaId(
        id,
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

  async findManyAssignsById(
    id: string,
    dto: FindManyAssignsWithPaginationDTO
  ): Promise<Pagination<MediaAssign>> {
    const results =
      await this.mediaAssignsRepository.findManyByMediaIdWithPagination(
        id,
        dto.page,
        dto.perPage
      );

    return {
      data: results.data,
      pagination: {
        size: dto.perPage,
        totalPages: results.total,
      },
    };
  }

  async assignMedia(id: string, dto: AssignMediaDTO) {
    const media = await this.mediasRepository.findById(id);

    if (!media) throw new NotFoundError("Media not found");

    const mediaAssign = MediaAssign.create({
      assignedBy: dto.userId,
      episodeId: dto.episodeId || null,
      mediaId: id,
      titleId: dto.titleId,
      assignedAt: new Date(),
    });

    await this.mediaAssignsRepository.save(mediaAssign);

    return { success: true };
  }

  async deleteAssign(id: string, assignId: string) {
    const media = await this.mediasRepository.findById(id);

    if (!media) throw new NotFoundError("Media not found");

    const assign = await this.mediaAssignsRepository.findById(assignId);

    if (!assign) throw new NotFoundError("Assign not found");
    if (assign.mediaId !== media.id.toString())
      throw new BadRequestError("Invalid assign/media");

    await this.mediaAssignsRepository.delete(assign);

    return { success: true };
  }
}
