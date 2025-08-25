export abstract class InstanceService {
  abstract getInstanceId(): Promise<string>;
}
