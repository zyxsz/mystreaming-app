interface NotificationData {
  thumbnailKey: string;
  previewsKey: string;
  key: string;
  manifestKey: string;
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
    }[];
    size: number;
    duration: number;
  };
}

interface NotificationProgress {
  currentProgress: number;
  status: "IN_QUEUE" | "PROCESSING" | "COMPLETED";
}

export interface NotificationDTO {
  externalId: string;
  progress?: Partial<NotificationProgress>;
  data?: Partial<NotificationData>;
}
