import { api } from "..";
import type { GetFeaturedContent } from "../interfaces/http/content/get-featured";
import type { GetTitleContentResponse } from "../interfaces/http/content/get-title";
import type { GetTitleEpisodesResponse } from "../interfaces/http/content/get-title-episodes";
import type { GetCollectionsResponse } from "../interfaces/http/content/get-collections";
import type { GetTitleSeasonsResponse } from "../interfaces/http/content/get-title-seasons";

export const getFeaturedContent = async (token?: string) => {
  return api
    .get<GetFeaturedContent>(`content/titles/featured`, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};

export const getTitleContent = async (titleId: string, token?: string) => {
  return api
    .get<GetTitleContentResponse>(`content/titles/${titleId}`, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};

export const getTitleEpisodes = async (
  titleId: string,
  seasonId?: string,
  token?: string
) => {
  return api
    .get<GetTitleEpisodesResponse>(`content/titles/${titleId}/episodes`, {
      params: { seasonId },
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};

export const getTitleSeasons = async (titleId: string, token?: string) => {
  return api
    .get<GetTitleSeasonsResponse>(`content/titles/${titleId}/seasons`, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};

export const getCollections = async (token?: string) => {
  return api
    .get<GetCollectionsResponse>("content/collections", {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};
