export type MediaStatus =
  | "CREATED"
  | "WAITING_ENCODE"
  | "AVAILABLE"
  | "DELETED";

export interface Media {
  id: string;
  name: string;
  status: MediaStatus;
  updatedAt: string;
  createdAt: string;
}
