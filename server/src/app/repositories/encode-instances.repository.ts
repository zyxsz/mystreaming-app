import type { EncodeInstance } from "../entities/encode-instance.entity";

export abstract class EncodeInstancesRepository {
  abstract save(entity: EncodeInstance): Promise<void>;
}
