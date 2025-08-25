export interface SaveProgressDTO {
  userId: string;
  titleId: string;
  episodeId?: string;

  currentTime: number;
  totalDuration: number;
  percentage: number;
  completed: boolean;
}
