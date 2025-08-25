import type { HashService } from "@/app/services/hash.service";
import { password } from "bun";

export class BCryptService implements HashService {
  async verifyHash(value: string, hash: string): Promise<boolean> {
    return await password.verify(value, hash);
  }
}
