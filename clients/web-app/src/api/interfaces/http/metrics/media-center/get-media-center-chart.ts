export type MediaCenterChartType = "ENCODES" | "UPLOADS";

export interface GetMediaCenterChartParams {
  from: Date;
  to: Date;
  type: MediaCenterChartType;
}

export interface GetMediaCenterChartResponse {
  label: string;
  data: Array<object>;
  keys: string[];
  config: Record<string, { label: string; color: string }>;
  componentsConfig?: {
    XAxis?: {
      dataKey: string;
    };
  };
}
