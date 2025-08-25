import type { Media } from "@/app/entities/media.entity";
import type { MediasRepository } from "@/app/repositories/medias.repository";
import type { PaginationResult } from "@/core/types/pagination-result";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { mediasTable } from "../schemas/medias";
import { desc, eq } from "drizzle-orm";
import { DrizzleMediasMapper } from "./mappers/drizzle.medias.mapper";

export class DrizzleMediasRepository implements MediasRepository {
  constructor(private database: NeonDatabase) {}

  async findById(id: string): Promise<Media | null> {
    const media = await this.database
      .select()
      .from(mediasTable)
      .where(eq(mediasTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!media) return null;

    return DrizzleMediasMapper.toDomain(media);
  }

  async findWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Media>> {
    const totalCount = await this.database.$count(mediasTable);
    const totalPages = Math.ceil(totalCount / size);

    const medias = await this.database
      .select()
      .from(mediasTable)
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(desc(mediasTable.createdAt));

    return {
      data: medias.map((media) => DrizzleMediasMapper.toDomain(media)),
      total: totalPages,
    };
  }

  async findByEncodeId(encodeId: string): Promise<Media | null> {
    const media = await this.database
      .select()
      .from(mediasTable)
      .where(eq(mediasTable.encodeId, encodeId))
      .limit(1)
      .then((r) => r[0]);

    if (!media) return null;

    return DrizzleMediasMapper.toDomain(media);
  }

  async save(entity: Media): Promise<void> {
    await this.database
      .insert(mediasTable)
      .values(DrizzleMediasMapper.toDrizzle(entity));
  }

  async update(entity: Media): Promise<void> {
    await this.database
      .update(mediasTable)
      .set(DrizzleMediasMapper.toDrizzle(entity))
      .where(eq(mediasTable.id, entity.id.toString()));
  }

  async delete(entity: Media): Promise<void> {
    await this.database
      .delete(mediasTable)
      .where(eq(mediasTable.id, entity.id.toString()));
  }
}
