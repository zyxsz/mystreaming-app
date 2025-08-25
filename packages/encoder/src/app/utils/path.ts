export abstract class Path {
  abstract getTempDir(): string;
  abstract getBinDir(): string;
  abstract dirname(path: string): string;
  abstract resolve(...paths: string[]): string;
}
