export interface FindWithPaginationDTO {
  page: number;
  perPage: number;
}

export interface CreateDTO {
  uploadId: string;
  name: string;
  autoEncode?: boolean;
}

export interface FindWithPlaybacksPaginationDTO {
  page: number;
  perPage: number;
}
export interface FindManyAssignsWithPaginationDTO {
  page: number;
  perPage: number;
}

export interface AssignMediaDTO {
  titleId: string;
  episodeId?: string;
  userId: string;
}
