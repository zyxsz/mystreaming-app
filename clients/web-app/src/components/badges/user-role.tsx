import type { UserRole as UserRoleType } from "@/api/interfaces/user";
import type { ReactNode } from "react";

const labels: Record<UserRoleType, ReactNode> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Member",
  USER: "User",
};

export const UserRole = ({ role }: { role: UserRoleType }) => {
  const label = labels[role];

  return (
    <span className="w-fit text-xs p-1 px-2 bg-white/10 rounded-sm uppercase font-bold text-white select-none no-underline">
      {label}
    </span>
  );
};
