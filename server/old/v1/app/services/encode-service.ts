import { database } from "@/infra/database";
import type { CreateEncodeDTO } from "../dto/encodes/create-encode-dto";
import {
  encodesTable,
  type AudioQuality,
  type VideoQuality,
} from "@/infra/database/schemas/encodes";
import { BadRequestError } from "../../../../app/errors/bad-request";
import type { NotificationDTO } from "../dto/encodes/encode-notification-dto";
import { eq } from "drizzle-orm";
import { encode } from "jose/dist/types/util/base64url";
import { NotFoundError } from "../../../../app/errors/not-found";
import { parseISO } from "date-fns";
import { mediasTable } from "@/infra/database/schemas/medias";
import { encrypt } from "@/infra/lib/encryption";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { env } from "@/config/env";
import { uploadsTable } from "@/infra/database/schemas/uploads";
import { wait } from "@/infra/lib/wait";

const sqsClient = new SQSClient({
  region: env.SQS_ENCODE_REGION,
});

export abstract class EncodeService {
  static async receiveNotification(data: NotificationDTO) {
    const { encode } = await EncodeService.findById(data.externalId);

    if (data.progress) {
      await database
        .update(encodesTable)
        .set({
          status: data.progress.status,
          progress: data.progress.currentProgress,
        })
        .where(eq(encodesTable.id, encode.id));
    }

    if (data.progress?.status === "COMPLETED" && data.data) {
      // Encode props
      const encryptions = data.data.encode?.streams.map((s) => ({
        keyId: encrypt(s.encryption.keyId),
        keyValue: encrypt(s.encryption.keyValue),
      }));

      const videoQualities = data.data.encode?.streams
        .filter((s) => s.type === "VIDEO")
        .map((s) => ({ quality: s.quality, isEnabled: true } as VideoQuality));
      const audioQualities = data.data.encode?.streams
        .filter((s) => s.type === "AUDIO")
        .map((s) => ({ quality: s.quality, isEnabled: true } as AudioQuality));

      const size = data.data.encode?.size;
      const duration = data.data.encode?.duration;

      const costInCents = data.data.encode?.costInCents;
      const startedAt = data.data.encode?.startedAt;
      const endedAt = data.data.encode?.endedAt;

      // Media props

      const key = data.data.key;
      const manifestKey = data.data.manifestKey;
      const thumbnailKey = data.data.thumbnailKey;
      const previewsKey = data.data.previewsKey;

      await database
        .update(encodesTable)
        .set({
          videoQualities,
          audioQualities,
          size,
          progress: 100,
          status: "COMPLETED",
          costInCents,
          startedAt: startedAt ? parseISO(startedAt) : undefined,
          endedAt: endedAt ? parseISO(endedAt) : undefined,
        })
        .where(eq(encodesTable.id, encode.id));

      await database
        .update(mediasTable)
        .set({
          duration,
          key,
          manifestKey,
          thumbnailKey,
          previewsKey,
          status: "AVAILABLE",
          encryptions,
        })
        .where(eq(mediasTable.encodeId, encode.id));
    }
  }

  static async create(data: CreateEncodeDTO) {
    const input = await database
      .select({ id: uploadsTable.id, key: uploadsTable.key })
      .from(uploadsTable)
      .where(eq(uploadsTable.id, data.inputId))
      .limit(1)
      .then((r) => r[0]);

    if (!input) throw new NotFoundError("Input not found");

    const encode = await database
      .insert(encodesTable)
      .values({
        inputId: data.inputId,
        status: "IN_QUEUE",
      })
      .returning({
        id: encodesTable.id,
      })
      .then((r) => r[0]);

    if (!encode) throw new BadRequestError("Unable to create encode");

    const command = new SendMessageCommand({
      MessageBody: JSON.stringify({
        inputKey: input.key,
        externalId: encode.id,
        bucket: env.S3_BUCKET,
      }),
      QueueUrl: env.SQS_ENCODE_QUEUE,
    });

    await sqsClient.send(command);

    return { encode };
  }

  static async findById(encodeId: string) {
    const encode = await database
      .select({
        id: encodesTable.id,
        inputId: encodesTable.inputId,

        size: encodesTable.size,
        videoQualities: encodesTable.videoQualities,
        audioQualities: encodesTable.audioQualities,

        progress: encodesTable.progress,
        status: encodesTable.status,

        costInCents: encodesTable.costInCents,
        startedAt: encodesTable.startedAt,
        endedAt: encodesTable.endedAt,

        createdAt: encodesTable.createdAt,
      })
      .from(encodesTable)
      .where(eq(encodesTable.id, encodeId))
      .limit(1)
      .then((r) => r[0]);

    if (!encode) throw new NotFoundError("Encode not found");

    return { encode };
  }

  static async init() {
    console.log("Receiving messages");

    const command = new ReceiveMessageCommand({
      QueueUrl: env.SQS_ENCODE_NOTIFICATIONS_QUEUE,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 15,
    });

    const messages = await sqsClient.send(command);

    if (messages.Messages && messages.Messages.length > 0) {
      console.log(messages);
      const message = JSON.parse(messages.Messages[0].Body!);
      const data = JSON.parse(message.Message);

      console.log("1 message received", data);

      await EncodeService.receiveNotification(data);

      if (messages.Messages[0].ReceiptHandle) {
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: process.env.SQS_ENCODE_NOTIFICATIONS_QUEUE!,
          ReceiptHandle: messages.Messages[0].ReceiptHandle,
        });

        await sqsClient.send(deleteCommand);
      }

      this.init();

      return;
    }

    console.log("No messages received, waiting 10 seconds...");

    // await wait(10000);

    this.init();
  }
}
