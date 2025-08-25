export interface FindWithPaginationDTO {
  page: number;
  perPage: number;
  search?: string;
}

export interface FindManyMediaAssignsByIdWithPaginationDTO {
  titleId: string;
  page: number;
  perPage: number;
}

export interface FindManySeasonsByTitleIdWithPaginationDTO {
  titleId: string;
  page: number;
  perPage: number;
}

export interface ParseFileNamesDTO {
  fileNames: string[];
}
