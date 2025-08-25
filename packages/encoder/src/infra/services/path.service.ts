import type { Path } from "../../app/utils/path";
import path from "node:path";
import fs from "node:fs";

export class PathService implements Path {
  private TMP_DIR = "tmp";
  private BIN_DIR = "bin";

  getTempDir(): string {
    return path.resolve(import.meta.dirname, "..", "..", "..", this.TMP_DIR);
  }

  getBinDir(): string {
    return path.resolve(import.meta.dirname, "..", "..", "..", this.BIN_DIR);
  }

  dirname(value: string): string {
    return path.dirname(value);
  }

  resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }
}
