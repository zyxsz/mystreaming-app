export abstract class Downloader {
  abstract downloadFile(url: string, path: string): Promise<void>;
}
