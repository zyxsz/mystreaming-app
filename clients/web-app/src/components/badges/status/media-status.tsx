import { cn } from "@/lib/utils";
import type { MediaStatus as MediaStatusType } from "@/types/app";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  type LucideProps,
} from "lucide-react";
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

interface Props {
  status: MediaStatusType;
}

const StatusIcon: Record<
  MediaStatusType,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  AVAILABLE: CheckCircle2Icon,
  DELETED: XCircleIcon,
  CREATED: CalendarIcon,
  WAITING_ENCODE: ClockIcon,
};

const StatusColor: Record<MediaStatusType, string> = {
  AVAILABLE: "text-green-500",
  DELETED: "text-red-500",
  CREATED: "text-gray-500",
  WAITING_ENCODE: "text-yellow-500",
};

const StatusLabel: Record<MediaStatusType, ReactNode> = {
  AVAILABLE: "Available",
  CREATED: "Created",
  DELETED: "Deleted",
  WAITING_ENCODE: "Waiting encode",
};

export const MediaStatus = ({ status }: Props) => {
  const Icon = StatusIcon[status];
  const color = StatusColor[status];
  const label = StatusLabel[status];

  return (
    <div
      className="flex gap-2 items-center text-sm text-app-secondary-foreground-muted select-none"
      title={label?.toString()}
    >
      <Icon className={cn("size-4", color)} />
      {label}
    </div>
  );
};
