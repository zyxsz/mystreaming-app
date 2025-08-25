import * as aws from "@pulumi/aws";

export const encoderSecurityGroup = new aws.ec2.SecurityGroup(
  "encoder-security-group",
  {
    egress: [
      {
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
    ingress: [
      {
        description: "ssh",
        protocol: "tcp",
        fromPort: 22,
        toPort: 22,
        cidrBlocks: ["0.0.0.0/0"],
      },
    ],
  }
);
