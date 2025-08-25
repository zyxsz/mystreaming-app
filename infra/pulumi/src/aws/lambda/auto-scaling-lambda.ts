import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { encoderAutoScalingGroup } from "../auto-scaling-group/encoder-auto-scaling-group";
import { encoderQueue } from "../queues/encoder-sqs";

const autoScalingLambdaRole = new aws.iam.Role("auto-scaling-lambda-role", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
      },
    ],
  },
});

new aws.iam.RolePolicy("auto-scaling-lambda-role-policies", {
  role: autoScalingLambdaRole.id,
  policy: pulumi.output({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "Statement1",
        Effect: "Allow",
        Action: ["autoscaling:SetDesiredCapacity"],
        Resource: "*",
      },
      {
        Sid: "Statement2",
        Effect: "Allow",
        Action: ["sqs:GetQueueAttributes"],
        Resource: "*",
      },
    ],
  }),
});

new aws.iam.RolePolicyAttachment("auto-scaling-lambda-role-policy", {
  role: autoScalingLambdaRole.id,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
});

export const autoScalingLambdaFunction = new aws.lambda.Function(
  "auto-scaling-lambda",
  {
    runtime: "nodejs22.x",
    role: autoScalingLambdaRole.arn,
    timeout: 30,
    handler: "index.handler",
    code: new pulumi.asset.AssetArchive({
      "index.js": new pulumi.asset.FileAsset(
        "./aws/lambda/auto-scaling-lambda/dist/index.js"
      ),
      "package.json": new pulumi.asset.FileAsset(
        "./aws/lambda/auto-scaling-lambda/package.json"
      ),
    }),

    environment: {
      variables: {
        AUTO_SCALING_GROUP_NAME: encoderAutoScalingGroup.name,
        MIN_INSTANCES: "0",
        MAX_INSTANCES: "1",
        QUEUE_URL: encoderQueue.url,
      },
    },
  }
);

export const autoScalingCronRule = new aws.cloudwatch.EventRule(
  "auto-scaling-lambda-cron-rule",
  {
    scheduleExpression: "rate(1 minute)",
  }
);

new aws.cloudwatch.EventTarget("auto-scaling-lambda-cron-target", {
  rule: autoScalingCronRule.name,
  arn: autoScalingLambdaFunction.arn,
});

new aws.lambda.Permission("auto-scaling-lambda-cron-permission", {
  action: "lambda:InvokeFunction",
  function: autoScalingLambdaFunction.name,
  principal: "events.amazonaws.com",
  sourceArn: autoScalingCronRule.arn,
});
