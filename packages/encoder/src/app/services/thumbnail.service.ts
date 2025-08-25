import type { GenerateThumbnailResponse } from "../../core/types/services";

export abstract class ThumbnailService {
  abstract generateThumbnail(
    videoPath: string,
    outputDir: string
  ): Promise<GenerateThumbnailResponse>;
}
