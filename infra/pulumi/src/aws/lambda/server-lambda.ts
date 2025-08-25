import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {
  ServerBunLayerName,
  ServerLambdaFunctionName,
  ServerLambdaFunctionUrlName,
  ServerLambdaRoleAttachName,
  ServerLambdaRoleName,
} from "../constants";
import { bucket } from "../buckets/main-bucket";
import { config } from "../lib/config";
import { encoderQueue } from "../queues/encoder-sqs";

const serverLambdaRole = new aws.iam.Role(ServerLambdaRoleName, {
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

new aws.iam.RolePolicyAttachment(ServerLambdaRoleAttachName, {
  role: serverLambdaRole,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
});

const bunLayer = new aws.lambda.LayerVersion(ServerBunLayerName, {
  layerName: ServerBunLayerName,
  code: new pulumi.asset.FileArchive("../builds/bun-layer.zip"),
  compatibleRuntimes: ["provided.al2", "provided"],
  compatibleArchitectures: ["x86_64"],
});

export const serverLambdaFunction = new aws.lambda.Function(
  ServerLambdaFunctionName,
  {
    runtime: "provided.al2",
    role: serverLambdaRole.arn,
    timeout: 30,
    handler: "index.js",
    code: new pulumi.asset.AssetArchive({
      ".": new pulumi.asset.FileArchive("../../../server/dist"),
    }),
    // Upload the code for the Lambda from the "./app" directory.

    layers: [bunLayer.arn],

    environment: {
      variables: {
        JWT_SECRET: config.requireSecret("JWT_SECRET"),

        HOST_URL: "http://localhost:3333",
        DATABASE_URL: config.requireSecret("DATABASE_URL"),

        S3_REGION: bucket.region,
        S3_BUCKET: bucket.id,

        TMDB_ENDPOINT: config.require("TMDB_ENDPOINT"),
        //"https://api.themoviedb.org/3/"
        TMDB_API_TOKEN: config.requireSecret("TMDB_API_TOKEN"),
        // "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjFjZjY1N2FhZTE1YzNkMGY2ZDFiYmE5ZTQ0OTc4ZCIsIm5iZiI6MTYwMjU1NzY5NS4yMDEsInN1YiI6IjVmODUxNmZmMjNiY2Y0MDAzNjFkMmNjNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lreSyJ4YFSP7iHyGdx34AGWn91gC3jQCq1QDhSlH6W8",
        TMDB_IMAGE_ENDPOINT: config.require("TMDB_IMAGE_ENDPOINT"),
        // "https://image.tmdb.org/t/p/w500",

        IMAGE_PROCESSOR_SQS_REGION: "us-east-1",
        IMAGE_PROCESSOR_SQS_QUEUE:
          "https://sqs.us-east-1.amazonaws.com/624049592578/image-processor",

        ENCRYPTION_IV: config.requireSecret("ENCRYPTION_IV"),
        // "447998a109e5547b8e9e33ab4a2bbfd1",
        ENCRYPTION_SECRET: config.requireSecret("ENCRYPTION_SECRET"),
        // "2bd8523ebd99e100c9a0cabb9fbe5995aeb69f30e9a704c7e02bd66c227a5b17",

        SQS_ENCODE_QUEUE: encoderQueue.url,
      },
    },
  }
);

const serverLambdaUrl = new aws.lambda.FunctionUrl(
  ServerLambdaFunctionUrlName,
  {
    functionName: serverLambdaFunction.name,
    authorizationType: "NONE",
  }
);

serverLambdaUrl.functionUrl.apply((v) => {
  console.log(v);
});
// console.log(testLatest.functionUrl.apply());
