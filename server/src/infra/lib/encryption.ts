import { env } from "@/config/env";
import * as crypto from "crypto";

const KEY = env.ENCRYPTION_SECRET;
const IV = env.ENCRYPTION_IV;

export const encrypt = (payload: string) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(KEY, "hex"),
    Buffer.from(IV, "hex")
  );

  return Buffer.from(
    cipher.update(payload, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
};

export const decrypt = (encrypted: string) => {
  const buff = Buffer.from(encrypted, "base64");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(KEY, "hex"),
    Buffer.from(IV, "hex")
  );

  return (
    decipher.update(buff.toString("utf8"), "hex", "utf8") +
    decipher.final("utf8")
  );
};
