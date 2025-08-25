import type { AxiosInstance } from "axios";
import type { InstanceService } from "../../app/services/instance.service";
// import { EC2Client } from "@aws-sdk/client-ec2";
import axios from "axios";

export class EC2InstanceService implements InstanceService {
  private api: AxiosInstance;
  // private ec2Client: EC2Client;

  constructor() {
    this.api = axios.create({
      baseURL: "http://169.254.169.254",
    });
    // this.ec2Client = new EC2Client({});
  }

  async getInstanceId(): Promise<string> {
    const token = await this.api
      .put("latest/api/token", undefined, {
        headers: {
          "X-aws-ec2-metadata-token-ttl-seconds": "21600",
        },
        timeout: 2000,
      })
      .then((r) => r.data)
      .catch((e) => null);

    if (!token) return "LOCAL";

    const metadataResponse = await this.api
      .get("latest/meta-data/instance-id", {
        headers: {
          "X-aws-ec2-metadata-token": token,
        },
      })
      .then((r) => r.data)
      .catch((e) => {
        console.log(e, "Error metadata");

        return null;
      });

    return metadataResponse || "LOCAL";
  }
}
