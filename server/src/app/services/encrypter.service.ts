export abstract class EncrypterService {
  abstract encrypt(value: string): string;
  abstract decrypt(encryptedValue: string): string;
}
