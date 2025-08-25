import type { Profile } from "./profile";
import type { Relations } from "./relations";

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER" | "USER";

export interface User extends Relations<{ profile: Profile }> {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  updatedAt: string;
  createdAt: string;
}
