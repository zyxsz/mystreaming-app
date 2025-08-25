import type { EncodeAction } from "../entities/encode-action.entity";
import type { EncodeInstance } from "../entities/encode-instance.entity";
import type { Encode } from "../entities/encode.entity";

export abstract class EncodeInstancesService {
  abstract launchInstance(
    encode: Encode,
    action: EncodeAction
  ): Promise<EncodeInstance>;
}
