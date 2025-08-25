export type FindWithPaginationDTO = {
  perPage: number;
  page: number;
  search?: string;
};

export type CreateDTO = {
  name: string;
  size: number;
  type: string;
};
