export type TitleType = "MOVIE" | "TV_SHOW";
export type FeaturedTitleType = {
  id: string;
  name: string;
  overview: string;
  tagline: string;
  releaseDate: string;
  rating: number;
  bannerKey: string;
  originalLanguage: string;
  type: TitleType;
  banner?: string;
  bannerUrl?: string;
};

export type Collection = {
  id: string;
  externalId: string;
  name: string;
  type: string;
  imageType: "BANNER" | "POSTER";
  content: CollectionContent[];
};

export type CollectionContent = {
  id: string;
  name: string;
  rating: number;
  images: Array<{
    id: string;
    key: string;
    url: string;
  }>;
  tagline: string;
  overview: string;
  seasonCount?: number;
  releaseDate?: string;
  type: TitleType;
};

export type Profile = {
  id: string;
  avatar: string;
  banner: any;
  userId: string;
  nickname: string;
  tagline: string;
  bio: string;
  updatedAt: string;
  createdAt: string;

  avatarUrl?: string;
  bannerUrl?: string;
};

export type Title = {
  id: string;
  tmdbId: number;
  imdbId: string;
  name: string;
  overview: string;
  tagline: string;

  bannerKey: string | null;
  posterKey: string | null;
  originLanguage: string;
  rating: number;
  ratingCount: number;
  type: TitleType;
  popularity: number;
  firstAirDate: string;
  posterUrl: string | null;
  contentRating: string | null;
  numberOfSeasons: number;
};

export type Genre = {
  id: string;
  externalId: number;
  name: string;
  defaultLanguage: string;
};

export type CurrentProgress = {
  id: string;
  episodeId: string;
  currentTime: number;
  totalDuration: number;
  percentage: number;
  completed: boolean;
  currentEpisode: {
    id: string;
    number: number;
    name: string;
    seasonNumber: number;
  };
};

export type Season = {
  id: string;
  tmdbId: number;
  number: number;
  name: string;
  overview: string;
  posterKey: string;
  posterUrl: string;
};

export type Episode = {
  id: string;
  seasonId: string;
  tmdbId: number;
  number: number;
  name: string;
  overview: string;
  rating: number;
  bannerKey: string;
  bannerUrl: string;
  isAvailable: boolean;
  airDate: string;

  season?: Season;

  currentProgress: {
    id: string;
    episodeId: string;
    currentTime: number;
    totalDuration: number;
    percentage: number;
    completed: boolean;
  } | null;
};

export type Video = {
  id: string;
  titleId: string | null;
  episodeId: string | null;
  uploadId: string | null;

  name: string;

  mediaId?: string;

  updatedAt: Date;
  createdAt: Date;
};

export type Progress = {
  id: string;
  titleId: string;
  episodeId: string | null;
  currentTime: number;
  totalDuration: number;
  percentage: number;
  completed: boolean;
  updatedAt: string;
  createdAt: string;
};

export type WatchData = {
  title: Title;
  current: {
    progress?: Progress;
    episode: Episode | null;
    videos: Video[];
    season: Season | null;
  };
};

export type MediaPlaybackSessionResponse = {
  id: string;
  keepAliveIn: number;
  endpoints: {
    base: string;
    manifest: string;
    encryption: string;
    range: string;
    keepAlive: string;
    subtitles: string;
    previews: string;
  };
  token: string;
  expiresAt: string;
};
export type Preview = {
  count: number;
  startAt: number;
  endAt: number;
  data: string;
};

export type Pagination<T> = {
  data: T;
  pagination: {
    count: number;
    page: number;
    size: number;
  };
};

export type MediaStatus =
  | "CREATED"
  | "WAITING_ENCODE"
  | "AVAILABLE"
  | "DELETED";

export type MediaGet = {
  id: string;
  key: string;
  name: string;
  size: number;
  duration?: number;
  type: "DASH" | "HLS";
  status: MediaStatus;
  origin: string;
  updatedAt: string;
  createdAt: string;
  upload: {
    id: string;
    originalName: string;
  };
  thumbnailUrl?: string;

  jobId?: string;
  processingStartedAt?: string;
  processingEndedAt?: string;
};

export type PlaybackStatus =
  | "CREATED"
  | "ALIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "FINISHED"
  | "CLOSED";

export type MediaPlayback = {
  id: string;
  mediaId: string;
  userId: string;
  currentTime: number;
  status: PlaybackStatus;
  lastKeepAliveAt: string;
  duration?: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    profile: {
      id: string;
      nickname: string;
      avatar: string;
      avatarUrl: string;
    } | null;
  };
};
