import type { Episode } from "@/types/app";
import type { Media } from "./media";
import type { Relations } from "./relations";
import type { User } from "./user";
import type { Title } from "./title";

export interface MediaAssignRelations {
  media: Media;
  episode: Episode;
  assignedBy: User;
  title: Title;
}

export interface MediaAssign extends Relations<MediaAssignRelations> {
  id: string;
  titleId: string;
  episodeId: string | null;
  mediaId: string;
  assignedBy: string;
  assignedAt: string;
}
