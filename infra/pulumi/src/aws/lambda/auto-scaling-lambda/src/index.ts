import {
  AutoScalingClient,
  SetDesiredCapacityCommand,
} from "@aws-sdk/client-auto-scaling";
import { GetQueueAttributesCommand, SQSClient } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient();
const autoScalingClient = new AutoScalingClient();

export const handler = async () => {
  try {
    const queueAttributesCommand = new GetQueueAttributesCommand({
      QueueUrl: process.env.QUEUE_URL,
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
      ],
    });

    const queueAttributesResponse = await sqsClient.send(
      queueAttributesCommand
    );

    const totalMessages =
      parseInt(
        queueAttributesResponse.Attributes?.ApproximateNumberOfMessages || "0"
      ) +
      parseInt(
        queueAttributesResponse.Attributes
          ?.ApproximateNumberOfMessagesNotVisible || "0"
      );

    const MIN_INSTANCES = parseInt(process.env.MIN_INSTANCES || "0");
    const MAX_INSTANCES = parseInt(process.env.MAX_INSTANCES || "0");

    const capacity = Math.min(
      totalMessages > 0
        ? MIN_INSTANCES + Math.ceil(totalMessages / 2)
        : MIN_INSTANCES,
      MAX_INSTANCES
    );

    console.log(`Capacity ${capacity}, messages count: ${totalMessages}`);

    await autoScalingClient.send(
      new SetDesiredCapacityCommand({
        AutoScalingGroupName: process.env.AUTO_SCALING_GROUP_NAME,
        DesiredCapacity: capacity,
        HonorCooldown: false,
      })
    );
  } catch (error) {
    console.error(`Failed to process order:`, error);
    throw error;
  }
};
