export abstract class WebTokenService {
  abstract encryptWebToken<T>(payload: T): Promise<string>;
  abstract decryptWebToken<T>(token: string): Promise<T>;
}
