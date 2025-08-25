import { Upload } from "@/app/entities/upload.entity";
import type { UploadsRepository } from "@/app/repositories/uploads.repository";
import type { Pagination } from "@/core/types/pagination";
import type { CreateDTO, FindWithPaginationDTO } from "./uploads.dto";
import type { StorageService } from "@/app/services/storage.service";
import { generateUUID } from "@/infra/lib/uuid";
import type { StorageMetricsUseCase } from "../storage-metrics/storage-metrics.use-case";

export class UploadsUseCases {
  constructor(
    private uploadsRepository: UploadsRepository,
    private storageService: StorageService,
    private storageMetricsUseCase: StorageMetricsUseCase
  ) {}

  async findWithPagination(
    dto: FindWithPaginationDTO
  ): Promise<Pagination<Upload>> {
    const { data, total } = await this.uploadsRepository.findWithPagination(
      dto.page,
      dto.perPage,
      dto.search
    );

    return {
      data: data,
      pagination: {
        size: dto.perPage,
        totalPages: total,
      },
    };
  }

  async create(dto: CreateDTO): Promise<Upload> {
    const key = `uploads/${generateUUID()}`;

    const { multipartUploadId } =
      await this.storageService.createMultipartUpload(key, dto.size, dto.type);

    const upload = Upload.create({
      key,
      size: dto.size,
      originalName: dto.name,
      type: dto.type,
      status: "CREATED",
      multipartUploadId,
    });

    await this.uploadsRepository.save(upload);

    return upload;
  }

  async findById(id: string): Promise<Upload> {
    const upload = await this.uploadsRepository.findById(id);

    if (!upload) throw new Error("Upload not found");

    return upload;
  }

  async deleteById(id: string, authorId: string | null): Promise<void> {
    const upload = await this.uploadsRepository.findById(id);

    if (!upload) throw new Error("Upload not found");

    if (upload.key) {
      await this.storageService.deleteObject(upload.key);

      await this.storageMetricsUseCase.create({
        authorId,
        bytes: upload.size,
        type: "DELETE",
        ipAddress: null,
        location: null,
        key: upload.key,
        reference: upload.id.toValue(),
        referenceType: "UPLOAD",
      });
    }

    await this.uploadsRepository.delete(id);

    return;
  }

  async presignedUrls(id: string): Promise<string[]> {
    const upload = await this.uploadsRepository.findById(id);

    if (!upload) throw new Error("Upload not found");

    upload.status = "UPLOADING";

    await this.uploadsRepository.update(upload);

    const urls = await this.storageService.getMultipartUploadPresignedUrls(
      upload.key,
      upload.multipartUploadId,
      upload.size
    );

    return urls;
  }

  async complete(
    id: string,
    parts: {
      ETag: string;
      PartNumber: number;
    }[],
    authorId: string | null
  ): Promise<void> {
    const upload = await this.uploadsRepository.findById(id);

    if (!upload) throw new Error("Upload not found");

    await this.storageService.completeMultipartUpload(
      upload.key,
      upload.multipartUploadId,
      parts
    );

    upload.status = "COMPLETED";

    await this.uploadsRepository.update(upload);

    await this.storageMetricsUseCase.create({
      authorId,
      bytes: upload.size,
      type: "STORE",
      ipAddress: null,
      location: null,
      key: upload.key,
      reference: upload.id.toValue(),
      referenceType: "UPLOAD",
    });
  }
}
