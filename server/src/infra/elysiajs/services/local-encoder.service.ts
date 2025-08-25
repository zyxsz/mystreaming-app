import type { Encode } from "@/app/entities/encode.entity";
import type { EncoderService } from "@/app/services/encoder.service";
import { env } from "@/config/env";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class LocalEncoderService implements EncoderService {
  private SQS_CLIENT: SQSClient;
  private QUEUE_URL: string;
  private BUCKET?: string;

  constructor() {
    this.SQS_CLIENT = new SQSClient();
    this.QUEUE_URL = env.SQS_ENCODE_QUEUE;
    this.BUCKET = env.STORAGE_BUCKET;
  }

  async encode(inputKey: string, encode: Encode): Promise<void> {
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify({
        inputKey,
        externalId: encode.id.toString(),
        bucket: this.BUCKET,
      }),
      QueueUrl: this.QUEUE_URL,
    });

    await this.SQS_CLIENT.send(command);
  }
}
