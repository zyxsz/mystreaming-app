import type { Period } from "@/core/types/period";

export type MediaCenterMetricType =
  | "TOTAL_STORAGE"
  | "TOTAL_BANDWIDTH"
  | "TOTAL_PLAYBACKS"
  | "TOTAL_UPLOADS";

export interface GetMediaCenterMetric extends Period {
  type: MediaCenterMetricType;
}

export type MediaCenterMetricChartType = "ENCODES" | "UPLOADS";

export interface GetChartMetricDTO extends Period {
  type: MediaCenterMetricChartType;
}
