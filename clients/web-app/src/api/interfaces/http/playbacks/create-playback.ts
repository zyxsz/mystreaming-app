export interface CreatePlaybackBody {
  mediaId: string;
}

export interface CreatePlaybackResponse {
  token: string;
  endpoints: {
    manifest: string;
    encryption: string;
    keepAlive: string;
  };
  keepAliveIn: number;
}
