import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

export const encoderRepository = new awsx.ecr.Repository("encoder-repository", {
  name: "encoder-repositor-2y",
  forceDelete: true,
});

export const encoderImage = new awsx.ecr.Image("encoder-image", {
  repositoryUrl: encoderRepository.url,
  context: "../../../packages/encoder",
  platform: "linux/arm64",
  builderVersion: "BuilderV1",
  args: {
    DOCKER_OPTS: "--dns 1.1.1.1 --dns 1.0.0.1",
  },
  imageTag: "latest",
});

export const encoderRepositoryAuthToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: encoderRepository.repository.registryId,
});

/*
{"inputKey":"uploads/e56fa3c1-b9c8-4514-85b3-7cec71b19f17","externalId":"1","bucket":"my-streaming"}
*/
