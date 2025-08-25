export abstract class HashService {
  abstract verifyHash(value: string, hash: string): Promise<boolean>;
}
