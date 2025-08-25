export interface CompleteUploadDTO {
  parts: {
    ETag: string;
    PartNumber: number;
  }[];
}

export interface CompleteUploadResponse {
  success: boolean;
}
