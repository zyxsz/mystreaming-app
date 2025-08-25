export interface Profile {
  id: string;
  userId: string;
  nickname: string | null;
  tagline: string | null;
  bio: string | null;
  avatar: string | string;
  banner: string | null;
  updatedAt: string;
  createdAt: string;

  avatarUrl?: string;
  bannerUrl?: string;
}
