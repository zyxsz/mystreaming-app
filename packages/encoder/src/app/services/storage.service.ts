export abstract class StorageService {
  abstract uploadDir(dirPath: string, objectKey: string): Promise<void>;
}
