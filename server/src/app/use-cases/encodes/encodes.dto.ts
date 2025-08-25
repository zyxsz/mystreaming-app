import type { EncodeStatus } from "@/app/entities/encode.entity";

export interface CreateDTO {
  inputId: string;
}

export interface FindWithPaginationDTO {
  page: number;
  perPage: number;
}

export interface HandleNotificationPayload {
  Type: "SubscriptionConfirmation" | "Notification";
  Message?: string;
  SubscribeURL?: string;
}

export interface NotificationBody {
  externalId: string;
  data: MessageProgressData | MessageCompleteData;
}

interface MessageProgressData {
  type: "PROGRESS";
  value: {
    progress: number;
    status?: EncodeStatus;
  };
}

interface MessageCompleteData {
  type: "COMPLETE";
  value: {
    encode: {
      costInCents: number;
      startedAt: string;
      endedAt: string;
      streams: {
        index: number;
        language: string;
        quality:
          | "360"
          | "480"
          | "720"
          | "720-plus"
          | "1080"
          | "48k"
          | "128k"
          | "256k"
          | "640k"
          | undefined;
        name: string | undefined;
        type: "VIDEO" | "AUDIO" | "SUBTITLE";
        encryption: {
          keyId: string;
          keyValue: string;
        };
        encodeDetails:
          | {
              codec: string;
              bitrate?: string | number;
              crf: number;
              preset: "medium" | "veryfast" | string;
              resolution: string;
              name: string;
              args?: string[];
            }
          | {
              codec: Record<2 | 6, string>;
              bitrate: string | number;
              crf: (2 | 6)[];
              name: string;
              preset?: undefined;
              resolution?: undefined;
            }
          | undefined;
      }[];
      size: number;
    };
    media: {
      duration: number;
      thumbnailKey: string;
      previewsKey: string;
      key: string;
      manifestKey: string;
    };
  };
}
