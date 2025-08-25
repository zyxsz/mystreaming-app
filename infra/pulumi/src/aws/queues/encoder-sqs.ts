import * as aws from "@pulumi/aws";
import { EncodeQueueName } from "../constants";

export const encoderQueue = new aws.sqs.Queue(EncodeQueueName, {
  name: EncodeQueueName,
  delaySeconds: 0,
  maxMessageSize: 2048,
  messageRetentionSeconds: 86400,
  visibilityTimeoutSeconds: 60 * 15,
  sqsManagedSseEnabled: true,
  tags: {
    Environment: "dev",
  },
});
