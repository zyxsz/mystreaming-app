export interface ParseTitleFileNamesParams {
  fileNames: string[];
}

export type ParseTitleFileNamesResponse = {
  from: string;
  title: string;
  season?: {
    id?: string;
    number?: number;
  };
  episode?: {
    id?: string;
    number?: number;
  };
  type: "MOVIE" | "EPISODE";
}[];
