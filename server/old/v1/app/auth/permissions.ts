import { AbilityBuilder } from "@casl/ability";

import { AppAbility } from ".";
import { Role } from "./roles";
import type { User } from "./models/user";

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void;

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(user, { can, cannot }) {
    can("manage", "all");

    // cannot(['transfer_ownership', 'update'], 'Organization')
    // can(['transfer_ownership', 'update'], 'Organization', {
    //   ownerId: { $eq: user.id },
    // })
  },
  MANAGER(_, { can }) {
    can("manage", "Title");
    can("manage", "Season");
    can("manage", "Storage");
    can("manage", "Upload");
    can("manage", "Transcoder");
    can("manage", "Media");
    can("manage", "Playback");
    can("manage", "Progress");
  },
  MEMBER(user, { can }) {
    // can('get', 'User')
    // can(['create', 'get'], 'Project')
    // can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },
  USER(_, { can }) {
    // can("manage", "Billing");
  },
};
