import type { Media } from "../../media";

export interface CreateMediaBody {
  name: string;
  uploadId: string;
  autoEncode?: boolean;
}

export interface CreateMediaResponse extends Media {}
