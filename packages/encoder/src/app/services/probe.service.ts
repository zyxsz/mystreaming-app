import type { ProbeResult } from "../../core/types/services";

export abstract class ProbeService {
  abstract probe(filePath: string): Promise<ProbeResult>;
}
