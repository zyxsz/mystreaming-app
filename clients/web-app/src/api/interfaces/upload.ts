export type UploadStatus = "CREATED" | "UPLOADING" | "COMPLETED";

export interface Upload {
  id: string;
  key: string;
  originalName: string;
  size: number;
  type: string;
  status: UploadStatus;
  updatedAt: string;
  createdAt: string;
}
