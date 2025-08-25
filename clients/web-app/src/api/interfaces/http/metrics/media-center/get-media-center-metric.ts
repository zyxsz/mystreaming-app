export type MediaCenterMetricType =
  | "TOTAL_STORAGE"
  | "TOTAL_BANDWIDTH"
  | "TOTAL_PLAYBACKS"
  | "TOTAL_UPLOADS";
export type MediaCenterMetricShadowType = "NEUTRAL" | "POSITIVE" | "NEGATIVE";

export interface GetMediaCenterMetricParams {
  from: Date;
  to: Date;
  type: MediaCenterMetricType;
}

export interface GetMediaCenterTotalStorageMetric {
  value: number;
  chart: Array<{
    label: string;
    totalStored: number;
    totalDeleted: number;
  }>;
  shadow?: {
    value: number;
    percent: number;
    type: MediaCenterMetricShadowType;
  };
}

export interface GetMediaCenterTotalBandwidthMetric {
  value: number;
  chart: Array<{
    label: string;
    totalBandwidth: number;
  }>;
  shadow?: {
    value: number;
    percent: number;
    type: MediaCenterMetricShadowType;
  };
}

export interface GetMediaCenterTotalPlaybacksMetric {
  value: number;
  chart: Array<{
    label: string;
    count: number;
  }>;
  shadow?: {
    value: number;
    percent: number;
    type: MediaCenterMetricShadowType;
  };
}
