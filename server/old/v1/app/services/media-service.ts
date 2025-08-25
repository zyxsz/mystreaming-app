import { database } from "@/infra/database";
import type { CreateMediaDTO } from "../dto/medias/create-media-dto";
import { uploadsTable } from "@/infra/database/schemas/uploads";
import { desc, eq } from "drizzle-orm";
import { NotFoundError } from "../../../../app/errors/not-found";
import { mediasTable } from "@/infra/database/schemas/medias";
import { BadRequestError } from "../../../../app/errors/bad-request";
import type { FindMediasWithPaginationDTO } from "../dto/medias/find-medias-with-pagination-dto";
import { EncodeService } from "./encode-service";
import { getObjectUrl } from "@/infra/v1/http/services/storage";

export abstract class MediaService {
  static async create(data: CreateMediaDTO) {
    const autoEncode = data.autoEncode ?? true;

    const upload = await database
      .select()
      .from(uploadsTable)
      .where(eq(uploadsTable.id, data.uploadId))
      .limit(1)
      .then((res) => res[0]);

    if (!upload) throw new NotFoundError("Upload not found");

    const media = await database
      .insert(mediasTable)
      .values({
        name: upload.originalName?.replace(/\.[^.]+$/, ""),
        originUploadId: upload.id,
        status: autoEncode ? "WAITING_ENCODE" : "CREATED",
      })
      .returning({
        id: mediasTable.id,
        status: mediasTable.status,
        createdAt: mediasTable.createdAt,
      })
      .then((res) => res[0]);

    if (!media) throw new BadRequestError("Unable to create media");

    if (autoEncode) {
      const { encode } = await EncodeService.create({ inputId: upload.id });

      await database
        .update(mediasTable)
        .set({ encodeId: encode.id })
        .where(eq(mediasTable.id, media.id));
    }

    return { media };
  }

  static async findWithPagination(data: FindMediasWithPaginationDTO) {
    const page = data.page;
    const pageSize = data.perPage || 10;

    const totalCount = await database.$count(mediasTable);
    const totalPages = Math.ceil(totalCount / pageSize);

    const medias = await database
      .select({
        id: mediasTable.id,
        key: mediasTable.key,

        name: mediasTable.name,

        status: mediasTable.status,

        thumbnailKey: mediasTable.thumbnailKey,
        duration: mediasTable.duration,

        updatedAt: mediasTable.updatedAt,
        createdAt: mediasTable.createdAt,

        upload: {
          id: uploadsTable.id,
          originalName: uploadsTable.originalName,
        },
      })
      .from(mediasTable)
      .leftJoin(uploadsTable, eq(uploadsTable.id, mediasTable.originUploadId))
      .orderBy(desc(mediasTable.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      data: await Promise.all(
        medias.map(async (media) => ({
          ...media,
          thumbnailUrl: media.thumbnailKey
            ? getObjectUrl(media.thumbnailKey)
            : undefined,
        }))
      ),
      pagination: {
        size: pageSize,
        count: Math.floor(totalCount / pageSize),
        pages: totalPages,
      },
    };
  }

  static async findById(mediaId: string) {
    const media = await database
      .select({
        id: mediasTable.id,
        key: mediasTable.key,

        name: mediasTable.name,

        status: mediasTable.status,
        duration: mediasTable.duration,

        thumbnailKey: mediasTable.thumbnailKey,

        updatedAt: mediasTable.updatedAt,
        createdAt: mediasTable.createdAt,

        upload: {
          id: uploadsTable.id,
          originalName: uploadsTable.originalName,
        },
      })
      .from(mediasTable)
      .leftJoin(uploadsTable, eq(uploadsTable.id, mediasTable.originUploadId))

      .where(eq(mediasTable.id, mediaId))
      .limit(1)
      .then((res) => res[0]);

    if (!media) throw new NotFoundError("Media not found");

    return { media };
  }

  static async deleteById(mediaId: string) {
    const { media } = await MediaService.findById(mediaId);

    if (media.key) {
      // await deleteObject({ key: media.key }, credentials);
    }

    await database.delete(mediasTable).where(eq(mediasTable.id, media.id));
  }
}
