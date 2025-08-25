export type Pagination<T> = {
  data: T[];
  pagination: {
    totalPages: number;
    size: number;
  };
};
