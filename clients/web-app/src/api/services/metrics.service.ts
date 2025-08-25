import { api } from "..";
import type {
  GetMediaCenterChartParams,
  GetMediaCenterChartResponse,
} from "../interfaces/http/metrics/media-center/get-media-center-chart";
import type { GetMediaCenterMetricParams } from "../interfaces/http/metrics/media-center/get-media-center-metric";

export const getMediaCenterMetric = async <T>(
  params: GetMediaCenterMetricParams
) => {
  return api
    .get<T>(`metrics/media-center`, { params })
    .then((response) => response.data);
};

export const getMediaCenterChart = async <T = GetMediaCenterChartResponse>(
  params: GetMediaCenterChartParams
) => {
  return api
    .get<T>("metrics/media-center/charts", { params })
    .then((r) => r.data);
};
