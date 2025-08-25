import { api } from "..";
import type { GetTitleResponse } from "../interfaces/http/titles/get-title";
import type {
  GetTitleMediaAssignsParams,
  GetTitleMediaAssignsResponse,
} from "../interfaces/http/titles/get-title-media-assigns";
import type {
  GetTitleSeasonsParams,
  GetTItleSeasonsResponse,
} from "../interfaces/http/titles/get-title-seasons";
import type {
  GetTitlesParams,
  GetTitlesResponse,
} from "../interfaces/http/titles/get-titles";
import type {
  ParseTitleFileNamesParams,
  ParseTitleFileNamesResponse,
} from "../interfaces/http/titles/parse-title-content-name";
import type {
  SearchTitlesParams,
  SearchTitlesResponse,
} from "../interfaces/http/titles/search-titles";

export const getTitles = async (params: GetTitlesParams) => {
  return api
    .get<GetTitlesResponse>(`titles`, { params })
    .then((response) => response.data);
};

export const getTitle = async (id: string) => {
  return api
    .get<GetTitleResponse>(`titles/${id}`)
    .then((response) => response.data);
};

export const getTitleMediaAssigns = async (
  id: string,
  params: GetTitleMediaAssignsParams
) => {
  return api
    .get<GetTitleMediaAssignsResponse>(`titles/${id}/media-assigns`, { params })
    .then((response) => response.data);
};

export const getTitleSeasons = async (
  id: string,
  params: GetTitleSeasonsParams
) => {
  return api
    .get<GetTItleSeasonsResponse>(`titles/${id}/seasons`, { params })
    .then((response) => response.data);
};

export const searchTitles = async (params: SearchTitlesParams) => {
  return api
    .get<SearchTitlesResponse>("titles/search", { params })
    .then((response) => response.data);
};

export const parseTitleFileNames = async (
  id: string,
  params: ParseTitleFileNamesParams
) => {
  return api
    .get<ParseTitleFileNamesResponse>(`titles/${id}/parse`, {
      params: { fileNames: params.fileNames.join(",") },
    })
    .then((response) => response.data);
};
