import { api } from "..";
import type {
  CompleteUploadDTO,
  CompleteUploadResponse,
} from "../interfaces/http/uploads/complete-upload";
import type {
  CreateUploadDTO,
  CreateUploadResponse,
} from "../interfaces/http/uploads/create-upload";
import type { DeleteUploadResponse } from "../interfaces/http/uploads/delete-upload";
import type { GetUploadPresignedUrlsResponse } from "../interfaces/http/uploads/get-upload-presigned-urls";
import type {
  GetUploadsDTO,
  GetUploadsResponse,
} from "../interfaces/http/uploads/get-uploads";
import type { Upload } from "../interfaces/upload";

export const getUploads = async (dto: GetUploadsDTO) => {
  return api
    .get<GetUploadsResponse>("uploads", { params: dto })
    .then((response) => response.data);
};

export const createUpload = async (dto: CreateUploadDTO) => {
  return api
    .post<CreateUploadResponse>("uploads", dto)
    .then((response) => response.data);
};

export const getUploadPresignedUrls = async (id: string) => {
  return api
    .get<GetUploadPresignedUrlsResponse>(`uploads/${id}/presigned`)
    .then((response) => response.data);
};

export const completeUpload = async (id: string, dto: CompleteUploadDTO) => {
  return api
    .post<CompleteUploadResponse>(`uploads/${id}/complete`, dto)
    .then((response) => response.data);
};

export const deleteUpload = async (id: string) => {
  return api
    .delete<DeleteUploadResponse>(`uploads/${id}`)
    .then((response) => response.data);
};
