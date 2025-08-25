import { database } from "@/infra/database";
import type { SaveProgressDTO } from "../dto/progress-dto";
import { progressTable } from "@/infra/database/schemas/progress";
import { and, eq } from "drizzle-orm";

export abstract class ProgressService {
  static async save(data: SaveProgressDTO) {
    const progress = await database
      .select()
      .from(progressTable)
      .where(
        data.episodeId
          ? and(
              eq(progressTable.titleId, data.titleId),
              eq(progressTable.episodeId, data.episodeId),
              eq(progressTable.userId, data.userId)
            )
          : and(
              eq(progressTable.titleId, data.titleId),
              eq(progressTable.userId, data.userId)
            )
      )
      .limit(1)
      .then((r) => r[0]);

    if (progress) {
      await database
        .update(progressTable)
        .set({
          currentTime: data.currentTime,
          totalDuration: data.totalDuration,
          completed: data.completed,
          percentage: data.percentage,
        })
        .where(eq(progressTable.id, progress.id));

      return;
    }

    await database.insert(progressTable).values({
      titleId: data.titleId,
      episodeId: data.episodeId,
      userId: data.userId,
      currentTime: data.currentTime,
      totalDuration: data.totalDuration,
      completed: data.completed,
      percentage: data.percentage,
    });
  }
}
