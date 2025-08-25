import type { Encode } from "../entities/encode.entity";

export abstract class EncoderService {
  abstract encode(inputKey: string, encode: Encode): Promise<void>;
}
