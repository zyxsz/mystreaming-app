import { env } from "@/config/env";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const verifyJWTToken = async <T = { id: string; exp: number }>(
  token: string
) => {
  return (await jwtVerify<T>(token, secret).catch(() => null))?.payload;
};

export const signJWTToken = async <T = { id: string; exp: number }>(
  payload: T,
  exp?: number
) => {
  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp || "7d")
    .sign(secret);
};
