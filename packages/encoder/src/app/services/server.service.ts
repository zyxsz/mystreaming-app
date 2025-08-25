import type { GetServerActionResponse } from "../../core/types/services";

export abstract class ServerService {
  abstract getAction(): Promise<GetServerActionResponse>;
}
