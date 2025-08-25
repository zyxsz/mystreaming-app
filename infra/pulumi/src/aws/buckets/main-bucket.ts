import * as aws from "@pulumi/aws";
import {
  BucketACLName,
  BucketCorsConfigurationName,
  BucketLifecycleConfigurationName,
  BucketName,
  BucketOwnerShipControlsName,
} from "../constants";

export const bucket = new aws.s3.BucketV2(BucketName, {
  bucket: BucketName,
  // acl: aws.s3.CannedAcl.AuthenticatedRead,

  tags: {
    Name: "MYS DEV",
    Environment: "Dev",
  },
});

export const bucketName = bucket.id;

export const bucketLifecycleConfiguration =
  new aws.s3.BucketLifecycleConfigurationV2(BucketLifecycleConfigurationName, {
    bucket: bucket.id,
    rules: [
      {
        id: "upload",
        status: "Enabled",
        filter: {
          prefix: "uploads/",
        },
        transitions: [
          { days: 30, storageClass: "STANDARD_IA" },
          { days: 60, storageClass: "GLACIER" },
        ],
        // filter
        // prefix: "uploads/",
        // transitions: [
        //   {
        //     days: 30,
        //     storageClass: "STANDARD_IA",
        //   },
        //   {
        //     days: 60,
        //     storageClass: "GLACIER",
        //   },
        // ],
        // abortIncompleteMultipartUploadDays: 1,
      },
    ],
  });

export const bucketCorsConfiguration = new aws.s3.BucketCorsConfigurationV2(
  BucketCorsConfigurationName,
  {
    bucket: bucket.id,
    corsRules: [
      {
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "HEAD", "PUT", "POST"],
        allowedOrigins: ["http://localhost:3333", "*"],
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3000,
      },
    ],
    // corsRules: [
    //     {
    //         allowedHeaders: ["*"],
    //         allowedMethods: [
    //             "PUT",
    //             "POST",
    //         ],
    //         allowedOrigins: ["https://s3-website-test.domain.example"],
    //         exposeHeaders: ["ETag"],
    //         maxAgeSeconds: 3000,
    //     },
    //     {
    //         allowedMethods: ["GET"],
    //         allowedOrigins: ["*"],
    //     },
    // ],
  }
);

export const bucketOwnershipControls = new aws.s3.BucketOwnershipControls(
  BucketOwnerShipControlsName,
  {
    bucket: bucket.id,
    rule: {
      objectOwnership: "BucketOwnerPreferred",
    },
  }
);
export const bucketAclV2 = new aws.s3.BucketAclV2(
  BucketACLName,
  {
    bucket: bucket.id,
    acl: "private",
  },
  {
    dependsOn: [bucketOwnershipControls],
  }
);
