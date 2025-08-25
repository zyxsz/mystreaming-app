import { api } from "..";
import type {
  CreatePlaybackBody,
  CreatePlaybackResponse,
} from "../interfaces/http/playbacks/create-playback";
import type { GetPlaybackPreviewsResponse } from "../interfaces/http/playbacks/get-playback-previews";

export const createPlayback = async (body: CreatePlaybackBody) => {
  return api
    .post<CreatePlaybackResponse>("playbacks", body)
    .then((r) => r.data);
};

export const getPlaybackEncryptionData = async (token: string) => {
  return api
    .get(`playbacks/encryption`, { params: { token } })
    .then((response) => response.data);
};

export const getPlaybackPreviews = async (token: string) => {
  return api
    .get<GetPlaybackPreviewsResponse>(`playbacks/previews`, {
      params: { token },
    })
    .then((response) => response.data);
};
