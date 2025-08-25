import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { Upload } from "./upload.entity";

export type EncodeVideoQuality = {
  quality: "360" | "480" | "720" | "720-plus" | "1080";
  isEnabled: boolean;
  encode?: {
    codec: string;
    bitrate: string | number;
    crf: number;
    preset: "medium" | "veryfast";
    resolution: string;
    name: string;
  };
};

export type EncodeAudioQuality = {
  quality: "48k" | "128k" | "256k" | "640k";
  isEnabled: boolean;
  encode?: {
    codec: Record<2 | 6, string>;
    bitrate: string | number;
    crf: (2 | 6)[];
    name: string;
    preset?: undefined;
    resolution?: undefined;
  };
};

export type EncodeStatus = "IN_QUEUE" | "PROCESSING" | "COMPLETED";

export type EncodeEncryption = {
  keyId: string;
  keyValue: string;
};

export interface EncodeProps {
  inputId: string | null;

  size: number | null;

  videoQualities: EncodeVideoQuality[] | null;
  audioQualities: EncodeAudioQuality[] | null;

  progress: number | null;
  status: EncodeStatus | null;

  costInCents: number | null;
  startedAt: Date | null;
  endedAt: Date | null;

  key: string | null;

  manifestKey: string | null;
  thumbnailKey: string | null;
  previewsKey: string | null;

  duration: number | null;

  encryptions: EncodeEncryption[] | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export interface EncodeRelations {
  input?: Upload;
}

export class Encode extends Entity<EncodeProps, EncodeRelations> {
  public get inputId() {
    return this.props.inputId;
  }
  public get size() {
    return this.props.size;
  }
  public get videoQualities() {
    return this.props.videoQualities;
  }
  public get audioQualities() {
    return this.props.audioQualities;
  }
  public get progress() {
    return this.props.progress;
  }
  public get status() {
    return this.props.status;
  }
  public get costInCents() {
    return this.props.costInCents;
  }
  public get startedAt() {
    return this.props.startedAt;
  }
  public get endedAt() {
    return this.props.endedAt;
  }

  public get key() {
    return this.props.key;
  }
  public get manifestKey() {
    return this.props.manifestKey;
  }
  public get thumbnailKey() {
    return this.props.thumbnailKey;
  }
  public get previewsKey() {
    return this.props.previewsKey;
  }
  public get duration() {
    return this.props.duration;
  }

  public get encryptions() {
    return this.props.encryptions;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  public set status(v) {
    this.props.status = v;
  }
  public set progress(v) {
    this.props.progress = v;
  }

  public set videoQualities(v) {
    this.props.videoQualities = v;
  }
  public set audioQualities(v) {
    this.props.audioQualities = v;
  }

  public set size(v) {
    this.props.size = v;
  }

  public set costInCents(v) {
    this.props.costInCents = v;
  }

  public set startedAt(v) {
    this.props.startedAt = v;
  }
  public set endedAt(v) {
    this.props.endedAt = v;
  }

  public set duration(v) {
    this.props.duration = v;
  }

  public set key(v) {
    this.props.key = v;
  }
  public set manifestKey(v) {
    this.props.manifestKey = v;
  }
  public set thumbnailKey(v) {
    this.props.thumbnailKey = v;
  }
  public set previewsKey(v) {
    this.props.previewsKey = v;
  }
  public set encryptions(v) {
    this.props.encryptions = v;
  }

  static create(
    props: Optional<EncodeProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID,
    relations?: EncodeRelations
  ) {
    return new Encode(
      {
        ...props,
        updatedAt: props.updatedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
      relations
    );
  }
}
