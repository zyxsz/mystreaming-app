import { api } from "..";
import type {
  AssignMediaBody,
  AssignMediaResponse,
} from "../interfaces/http/medias/assign-media";
import type {
  CreateMediaBody,
  CreateMediaResponse,
} from "../interfaces/http/medias/create-media";
import type { DeleteMediaResponse } from "../interfaces/http/medias/delete-media";
import type {
  GetMediaAssignsParams,
  GetMediaAssignsResponse,
} from "../interfaces/http/medias/get-media-assigns";
import type {
  GetMediaPlaybacksParams,
  GetMediaPlaybacksResponse,
} from "../interfaces/http/medias/get-media-playbacks";
import type {
  GetMediasDTO,
  GetMediasResponse,
} from "../interfaces/http/medias/get-medias";

export const getMedias = async (dto: GetMediasDTO) => {
  return api
    .get<GetMediasResponse>("medias", { params: dto })
    .then((response) => response.data);
};

export const deleteMedia = async (id: string) => {
  return api
    .delete<DeleteMediaResponse>(`medias/${id}`)
    .then((response) => response.data);
};

export const createMedia = async (data: CreateMediaBody) => {
  return api
    .post<CreateMediaResponse>("medias", data)
    .then((response) => response.data);
};

export const getMediaPlaybacks = async (
  id: string,
  params: GetMediaPlaybacksParams
) => {
  return api
    .get<GetMediaPlaybacksResponse>(`medias/${id}/playbacks`, { params })
    .then((response) => response.data);
};

export const getMediaAssigns = async (
  id: string,
  params: GetMediaAssignsParams
) => {
  return api
    .get<GetMediaAssignsResponse>(`medias/${id}/assigns`, { params })
    .then((response) => response.data);
};

export const assignMedia = async (id: string, body: AssignMediaBody) => {
  return api
    .post<AssignMediaResponse>(`medias/${id}/assigns`, body)
    .then((response) => response.data);
};

export const deleteMediaAssign = async (mediaId: string, assignId: string) => {
  return api
    .delete<DeleteMediaResponse>(`medias/${mediaId}/assigns/${assignId}`)
    .then((response) => response.data);
};
