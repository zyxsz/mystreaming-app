import * as aws from "@pulumi/aws";
import { encoderLaunchTemplate } from "../launch-template/encoder-launch-template";

export const encoderAutoScalingGroup = new aws.autoscaling.Group(
  "encoder-autoscaling-group",
  {
    minSize: 0,
    maxSize: 1,
    desiredCapacity: 0,

    availabilityZones: ["us-east-1c", "us-east-1d", "us-east-1f"],
    capacityRebalance: true,

    launchTemplate: {
      id: encoderLaunchTemplate.id,
      version: "$Latest",
    },

    defaultInstanceWarmup: 60 * 2,
    defaultCooldown: 60,
  }
);
