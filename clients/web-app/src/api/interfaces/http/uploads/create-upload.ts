import type { Upload } from "../../upload";

export interface CreateUploadDTO {
  name: string;
  size: number;
  type: string;
}

export interface CreateUploadResponse extends Upload {}
