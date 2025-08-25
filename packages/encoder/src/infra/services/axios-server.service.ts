import type { AxiosInstance } from "axios";
import type { ServerService } from "../../app/services/server.service";
import axios from "axios";
import type { GetServerActionResponse } from "../../core/types/services";
import type { InstanceService } from "../../app/services/instance.service";

export class AxiosServerService implements ServerService {
  private api: AxiosInstance;

  constructor(private instanceService: InstanceService) {
    this.api = axios.create({ baseURL: process.env.SERVER_URL });
  }

  async getAction(): Promise<GetServerActionResponse> {
    const instanceId = this.instanceService.getInstanceId();

    return await this.api
      .get<GetServerActionResponse>(`/encodes/action`, {
        params: { instanceId },
      })
      .then((response) => response.data);
  }
}
