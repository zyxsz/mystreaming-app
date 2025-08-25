import type { WebTokenService } from "@/app/services/web-token.service";
import { env } from "@/config/env";
import { jwtVerify, SignJWT } from "jose";

export class JWTService implements WebTokenService {
  private secret: Uint8Array<ArrayBufferLike>;

  constructor() {
    this.secret = new TextEncoder().encode(env.JWT_SECRET);
  }

  async decryptWebToken<T>(token: string): Promise<T> {
    return (await jwtVerify<T>(token, this.secret))?.payload;
  }

  async encryptWebToken<T>(payload: T, exp?: number): Promise<string> {
    return await new SignJWT({ ...payload, exp })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(exp || "7d")
      .sign(this.secret);
  }
}
