import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
  type MongoAbility,
} from "@casl/ability";
import { userSubject } from "./subjects/user";
import { z } from "zod";
import { permissions } from "./permissions";
import { userSchema, type User } from "./models/user";
import type { Role } from "./roles";
import { password } from "bun";
import { jwtVerify, SignJWT } from "jose";
import { env } from "@/config/env";
import { titleSubject } from "./subjects/title";
import { episodeSubject } from "./subjects/episode";
import { seasonSubject } from "./subjects/season";
import { storageSubject } from "./subjects/storage";
import { uploadSubject } from "./subjects/upload";
import { transcoderSubject } from "./subjects/transcoder";
import { mediaSubject } from "./subjects/media";
import { playbackSubject } from "./subjects/playback";
import { progressSubject } from "./subjects/progress";

const appAbilitiesSchema = z.union([
  userSubject,
  titleSubject,
  episodeSubject,
  seasonSubject,
  storageSubject,
  uploadSubject,
  transcoderSubject,
  mediaSubject,
  playbackSubject,
  progressSubject,

  z.tuple([z.literal("manage"), z.literal("all")]),
]);

type AppAbilities = z.infer<typeof appAbilitiesSchema>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permissions for role ${user.role} not found.`);
  }

  permissions[user.role](user, builder);

  const ability = builder.build({
    detectSubjectType(subject) {
      return (subject as unknown as any).__typename;
    },
  });

  ability.can = ability.can.bind(ability);
  ability.cannot = ability.cannot.bind(ability);

  return ability;
}

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  });

  const ability = defineAbilityFor(authUser);

  return ability;
}

export const generatePasswordHash = async (value: string) => {
  return await password.hash(value, "bcrypt");
};

export const verifyPasswordHash = async (value: string, hash: string) => {
  return await password.verify(value, hash);
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const verifyToken = async <T = { id: string; exp: number }>(
  token: string
) => {
  return (await jwtVerify<T>(token, secret).catch(() => null))?.payload;
};

export const signToken = async <T = { id: string; exp: number }>(
  payload: T,
  exp?: number
) => {
  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp || "7d")
    .sign(secret);
};
