import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { EncodeSNSName, EncodeSNSTopicName } from "../constants";

export const encoderSNSTopic = new aws.sns.Topic(EncodeSNSName, {
  name: EncodeSNSTopicName,
});
