import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import type { Downloader } from "../../app/utils/downloader";
import Axios from "axios";
import path from "node:path";
import type { LoggerService } from "../../app/services/logger.service";

export class UtilsService implements Downloader {
  constructor(private logger: LoggerService) {}

  async downloadFile(url: string, outputPath: string): Promise<void> {
    if (!existsSync(path.dirname(outputPath)))
      mkdirSync(path.dirname(outputPath));

    const writer = createWriteStream(outputPath);

    await Axios({
      method: "GET",
      url,
      responseType: "stream",
      onDownloadProgress: (progressEvent) => {
        const percent = progressEvent.progress
          ? progressEvent.progress * 100
          : 0;

        this.logger.log(
          `Downloading input file - ${percent.toFixed(2)}% completed`
        );
      },
    }).then((response) => {
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error: null | Error = null;

        writer.on("error", (err) => {
          error = err;
          writer.close();
          reject(err);
        });

        writer.on("close", () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
  }
}
