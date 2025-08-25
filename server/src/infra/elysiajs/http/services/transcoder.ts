import { env } from "@/config/env";
import { generateUUID } from "@/infra/lib/uuid";
import {
  BatchClient,
  DescribeJobDefinitionsCommand,
  DescribeJobQueuesCommand,
  SubmitJobCommand,
} from "@aws-sdk/client-batch";

type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
};

type JobDefinition = {
  image: string;
  arn: string;
  name: string;
  cpu?: number;
  memory?: number;
  status: "ACTIVE";
  revision: number;
  type: "container" | "task";
};

type JobQueue = {
  arn: string;
  name: string;
  isEnabled: boolean;
  status:
    | "CREATING"
    | "DELETED"
    | "DELETING"
    | "INVALID"
    | "UPDATING"
    | "VALID";
  priority: number;
};

export const listTrancoderDefinitions = async (
  credentials: Credentials,
  jobDefinition?: string
): Promise<JobDefinition[]> => {
  const client = new BatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    endpoint: credentials.endpoint,
  });

  const definitionsResponse = await client.send(
    new DescribeJobDefinitionsCommand({
      jobDefinitions: jobDefinition ? [jobDefinition] : undefined,
    })
  );

  return (
    definitionsResponse.jobDefinitions?.map(
      (definition) =>
        ({
          image: definition.containerProperties?.image as string,
          arn: definition.jobDefinitionArn as string,
          name: definition.jobDefinitionName as string,
          cpu: definition.containerProperties?.vcpus,
          memory: definition.containerProperties?.memory,
          status: definition.status as "ACTIVE",
          revision: definition.revision as number,
          type: (definition.type as "container" | "task") || "container",
        } satisfies JobDefinition)
    ) || ([] as JobDefinition[])
  ).sort((a, b) => b.revision - a.revision);
};

export const listTrancoderQueues = async (
  credentials: Credentials,
  jobQueue?: string
): Promise<JobQueue[]> => {
  const client = new BatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    endpoint: credentials.endpoint,
  });

  const queuesResponse = await client.send(
    new DescribeJobQueuesCommand({
      jobQueues: jobQueue ? [jobQueue] : undefined,
    })
  );

  return (
    queuesResponse.jobQueues?.map((queue) => ({
      arn: queue.jobQueueArn as string,
      name: queue.jobQueueName as string,
      isEnabled: queue.state === "ENABLED",
      status: queue.status as
        | "CREATING"
        | "DELETED"
        | "DELETING"
        | "INVALID"
        | "UPDATING"
        | "VALID",
      priority: queue.priority || -1,
    })) || []
  );
};

export const releaseTranscoderJob = async (
  credentials: Credentials,
  job: {
    name?: string;
    queue: string;
    definition: string;
    token: string;
    mediaId: string;
  }
) => {
  const client = new BatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    endpoint: credentials.endpoint,
  });

  const submitJob = new SubmitJobCommand({
    jobQueue: job.queue,
    jobDefinition: job.definition,
    jobName: job.name || generateUUID(),

    containerOverrides: {
      // resourceRequirements: [
      //   { type: "VCPU", value: "1" },
      //   { type: "MEMORY", value: "1024" },
      // ],
      environment: [
        { name: "TOKEN", value: job.token },
        { name: "TRANSPORT", value: "HTTP" },
        {
          name: "MANIFEST_URL",
          value: `${env.HOST_URL}/v1/medias/${job.mediaId}/manifest`,
        },
        // {
        //   name: "TRANSCODES_API_URL",
        //   value: "http://172.17.0.1:3333/transcodes",
        // },
        // {
        //   name: "LOGGER_URL",
        //   value: "http://172.17.0.1:3333/transcodes/log",
        // },
        {
          name: "MEDIA_CENTER_URL",
          value: `${env.HOST_URL}/v1/medias/${job.mediaId}/done`,
        },
      ],
    },
  });

  const response = await client.send(submitJob);

  return response.jobId as string;
};
