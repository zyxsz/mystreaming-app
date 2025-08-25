import type { LoggerService } from "../../app/services/logger.service";

export class LocalLoggerService implements LoggerService {
  log(message: string): void {
    console.log(message);
  }
}
