import { env } from "@/config/env";
import axios from "axios";

const api = axios.create({
  baseURL: env.TMDB_ENDPOINT,
  headers: { Authorization: `Bearer ${env.TMDB_API_TOKEN}` },
});

const defaultLanguage = "en-US";

export const tmdbService = {
  defaultLanguage,
  movie: {
    fetchDetails: async (id: string | number) => {
      const result = await api
        .get<MovieDetails>(`movie/${id}`, {
          params: { language: defaultLanguage },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchRecommendations: async (id: string | number) => {
      const result = await api
        .get<MovieRecommendations>(`movie/${id}/recommendations`, {
          params: { language: defaultLanguage },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchImages: async (id: string | number) => {
      const result = await api
        .get<ImagesResponse>(`movie/${id}/images`, {
          params: { include_image_language: `${defaultLanguage},en,null` },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
  },
  tv: {
    fetchDetails: async (id: string | number) => {
      const result = await api
        .get<TvDetails>(`tv/${id}`, {
          params: { language: defaultLanguage },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchSeasonDetails: async (id: string | number, seasonNumber: number) => {
      const result = await api
        .get<TvSeasonDetails>(`tv/${id}/season/${seasonNumber}`, {
          params: { language: defaultLanguage },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchRecommendations: async (id: string | number) => {
      const result = await api
        .get<TvRecommendations>(`tv/${id}/recommendations`, {
          params: { language: defaultLanguage },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchImages: async (id: string | number) => {
      const result = await api
        .get<ImagesResponse>(`tv/${id}/images`, {
          params: { include_image_language: `${defaultLanguage},en,null` },
        })
        .then((response) => response.data)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
    fetchVideos: async (id: string | number) => {
      const result = await api
        .get<{ results: VideoResult[] }>(`tv/${id}/videos`, {
          params: { include_video_language: `${defaultLanguage},en,null` },
        })
        .then((response) => response.data?.results)
        .catch(() => null);

      if (!result) throw new Error("Result not found");

      return result;
    },
  },
  assets: {
    getFullUrl: (key: string, size?: "w500" | "w300" | "original") =>
      `https://image.tmdb.org/t/p/${size || "original"}${key}`,
  },
};

type ImagesResponse = {
  backdrops: Array<{
    aspect_ratio: number;
    height: number;
    iso_639_1?: string;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
  }>;
  id: number;
  logos: Array<{
    aspect_ratio: number;
    height: number;
    iso_639_1: string;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
  }>;
  posters: Array<{
    aspect_ratio: number;
    height: number;
    iso_639_1?: string;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
  }>;
};

type MovieDetails = {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: any;
  budget: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: Array<string>;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type TvDetails = {
  adult: boolean;
  backdrop_path: string;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string;
  }>;
  episode_run_time: Array<number>;
  first_air_date: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  id: number;
  in_production: boolean;
  languages: Array<string>;
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
  };
  name: string;
  next_episode_to_air: any;
  networks: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: Array<string>;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
};

type TvSeasonDetails = {
  _id: string;
  air_date: string;
  episodes: Array<{
    air_date: string;
    episode_number: number;
    episode_type: string;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
    crew: Array<{
      job: string;
      department: string;
      credit_id: string;
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path?: string;
    }>;
    guest_stars: Array<{
      character: string;
      credit_id: string;
      order: number;
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path: string;
    }>;
  }>;
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
  vote_average: number;
};

type MovieRecommendations = {
  page: number;
  results: Array<{
    backdrop_path: string;
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string;
    media_type: string;
    adult: boolean;
    original_language: string;
    genre_ids: Array<number>;
    popularity: number;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
  }>;
  total_pages: number;
  total_results: number;
};

type TvRecommendations = {
  page: number;
  results: Array<{
    backdrop_path?: string;
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path?: string;
    media_type: string;
    adult: boolean;
    original_language: string;
    genre_ids: Array<number>;
    popularity: number;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    origin_country: Array<string>;
  }>;
  total_pages: number;
  total_results: number;
};

type VideoResult = {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
};
