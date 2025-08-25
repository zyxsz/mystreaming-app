export interface GetPlaybackPreviewsResponse
  extends Array<{
    count: number;
    startAt: number;
    endAt: number;
    data: string;
  }> {}
