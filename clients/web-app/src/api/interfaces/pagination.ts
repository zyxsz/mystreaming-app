export interface Pagination<T> {
  data: T[];
  pagination: {
    totalPages: number;
    size: number;
  };
}
