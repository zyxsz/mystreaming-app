import type { EncodeAction } from "../entities/encode-action.entity";

export abstract class EncodeActionsRepository {
  abstract save(entity: EncodeAction): Promise<void>;
}
