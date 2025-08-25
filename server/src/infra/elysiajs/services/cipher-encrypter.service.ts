import type { EncrypterService } from "@/app/services/encrypter.service";
import { env } from "@/config/env";
import * as crypto from "crypto";

export class CipherEncrypterService implements EncrypterService {
  private KEY: string;
  private IV: string;

  constructor() {
    this.KEY = env.ENCRYPTION_SECRET;
    this.IV = env.ENCRYPTION_IV;
  }

  decrypt(encryptedValue: string): string {
    const buff = Buffer.from(encryptedValue, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.KEY, "hex"),
      Buffer.from(this.IV, "hex")
    );

    return (
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8")
    );
  }

  encrypt(value: string): string {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.KEY, "hex"),
      Buffer.from(this.IV, "hex")
    );

    return Buffer.from(
      cipher.update(value, "utf8", "hex") + cipher.final("hex")
    ).toString("base64");
  }
}
