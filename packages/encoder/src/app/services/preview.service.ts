import type { GeneratePreviewResponse } from "../../core/types/services";

export abstract class PreviewService {
  abstract generatePreviews(
    videoPath: string,
    baseDir: string,
    outputDir: string
  ): Promise<GeneratePreviewResponse>;
}
