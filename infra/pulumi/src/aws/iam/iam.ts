import * as aws from "@pulumi/aws";

import {
  IAMUserAccessKeyName,
  IAMUserPolicyName,
  IAMUserRoleName,
} from "../constants";

export const iamUser = new aws.iam.User(IAMUserRoleName, {
  path: "/system/",
  tags: { Name: IAMUserRoleName },
});

export const iamUserAccessKey = new aws.iam.AccessKey(IAMUserAccessKeyName, {
  user: iamUser.name,
});

export const iamUserPolicy = new aws.iam.UserPolicy(IAMUserPolicyName, {
  user: iamUser.name,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "Statement1",
        Effect: "Allow",
        Action: "s3:*",
        Resource: "*",
      },
      {
        Sid: "Statement2",
        Effect: "Allow",
        Action: "ec2:*",
        Resource: "*",
      },
      {
        Sid: "Statement3",
        Effect: "Allow",
        Action: "sqs:*",
        Resource: "*",
      },
      {
        Sid: "Statement4",
        Effect: "Allow",
        Action: "sns:*",
        Resource: "*",
      },
      {
        Sid: "Statement4",
        Effect: "Allow",
        Action: "ecr:*",
        Resource: "*",
      },
    ],
  }),
});
