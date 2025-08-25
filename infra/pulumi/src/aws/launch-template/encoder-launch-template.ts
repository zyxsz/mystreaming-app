import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { encoderSecurityGroup } from "../security-groups/encoder-security-group";
import {
  encoderImage,
  encoderRepository,
  encoderRepositoryAuthToken,
} from "../repositories/encoder-ecr";

import { encoderQueue } from "../queues/encoder-sqs";
import { encoderSNSTopic } from "../notifications/encoder-sns";

const lastAmis = aws.ec2.getAmi({
  mostRecent: true,
  owners: ["amazon"],
  filters: [
    { name: "name", values: ["al2023-ami-*-arm64"] },
    { name: "state", values: ["available"] },
    { name: "architecture", values: ["arm64"] },
  ],
});

const keyPair = new aws.ec2.KeyPair("encoder-key-pair", {
  keyName: "deployer-key",
  publicKey:
    "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJW5kSdM1B4rMDham+97YrDs2bW31gdYhMASZERaCVpvKIN5RyzMizldUNSorwf7X0GQnxRKVxAf2JiTzOnKdfrsvwCYUpyF2/PU9CxELkpydvGgI1Bz6E4ZZPQ2KVwhECMALqBxOyGH2Ml35rMDcDho59uEAGUZ7dQ7uOQzypDpq922M0Hlfi8GJlOyC/WCqHqPJLG4H9Pi7f7DIjfLSJ5C0UgviTRWXRxWEhumrmW63vsdkmDk7titwatJQSJENYqYZGPJaZtR/hExa4YBCsRcQPYrVQWYmmJiRVeRCbohQGZAFp4+q+fG+tTgEn+H5qK69tM8eROlKnAnvupK1F zyx@Revision-PC",
});

const role = new aws.iam.Role("encoder-ec2-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "ec2.amazonaws.com",
  }),
});

const policy = new aws.iam.RolePolicy("secretsManagerPolicy", {
  role: role.id,
  policy: pulumi.output({
    Version: "2012-10-17",
    Statement: [
      {
        Action: [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
        ],
        Effect: "Allow",
        Resource: "*", // You could specify a specific secret ARN here
      },
      {
        Sid: "AllowDescribeRepoImage",
        Effect: "Allow",
        Action: [
          "ecr:DescribeImages",
          "ecr:DescribeRepositories",
          "ecr:BatchImportUpstreamImage",
          "ecr:CreatePullThroughCacheRule",
          "ecr:CreateRepository",
        ],
        Resource: ["*"],
      },
      {
        Sid: "Statement1",
        Effect: "Allow",
        Action: "s3:*",
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
        Sid: "Statement6",
        Effect: "Allow",
        Action: [
          "ec2:DescribeInstances",
          "ec2:DescribeSpotPriceHistory",
          "ecs:RegisterContainerInstance",
        ],
        Resource: "*",
      },
    ],
  }),
});

// Create an instance profile for the IAM role
const instanceProfile = new aws.iam.InstanceProfile("encoder-ec2-profile", {
  role: role.name,
});

export const encoderLaunchTemplate = new aws.ec2.LaunchTemplate(
  "encoder-launch-template",
  {
    // al2 arm64
    imageId: lastAmis.then((ami) => ami.id),
    // imageId: "ami-02d8a5c8b4fc375b2",
    securityGroupNames: [encoderSecurityGroup.name],
    keyName: keyPair.keyName,

    instanceType: "c8g.2xlarge",
    // instanceType: "c8g.8xlarge",
    // instanceType: "c8g.12xlarge",

    instanceMarketOptions: {
      marketType: "spot",
      spotOptions: {
        maxPrice: "0.2",
        spotInstanceType: "one-time",
      },
    },
    blockDeviceMappings: [
      {
        deviceName: "/dev/xvda",
        ebs: {
          volumeSize: 128,
          deleteOnTermination: "true",
        },
      },
    ],

    iamInstanceProfile: {
      arn: instanceProfile.arn,
    },

    userData: pulumi.interpolate /*sh*/ `#!/bin/bash

    sudo yum update -y
    sudo yum -y install docker
    sudo service docker start

    echo "${encoderRepositoryAuthToken.password}" | docker login --username AWS --password-stdin ${encoderRepositoryAuthToken.proxyEndpoint}

    sudo docker run -d --name encoder --restart unless-stopped --privileged --cpus="0" --memory="0" --network host --dns 1.1.1.1 --dns 1.0.0.1 -e STORAGE_ACCESS_KEY_ID=db77bc3a645af0e35a45d26674dd0303 -e STORAGE_SECRET_ACCESS_KEY=12503ece5584ceaeba4d7b79cf37e8b654547ee90444339ca4fe3836088c94a3 -e STORAGE_ENDPOINT=https://1e6e7de20b1f7d12a6d97e180bd79998.r2.cloudflarestorage.com -e AWS_REGION=us-east-1 -e FFMPEG_BIN=ffmpeg-arm64 -e FFPROBE_BIN=ffprobe-arm64 -e PACKAGER_BIN=packager-arm64 -e SQS_QUEUE=${encoderQueue.url} -e SNS_TOPIC=${encoderSNSTopic.arn} -e S3_BUCKET=media-c-mys -e S3_REGION=us-east-1 ${encoderRepository.url}:latest`.apply(
      (code) => Buffer.from(code).toString("base64")
    ),

    // instanceRequirements: {

    // }
  },
  {
    replaceOnChanges: ["imageId", "userData"],
    dependsOn: [encoderImage, encoderRepository],
  }
);
