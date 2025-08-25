import { cn } from "@/lib/utils";
import type { UploadStatus as UploadStatusType } from "@/api/interfaces/upload";
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
  status: UploadStatusType;
}

const StatusIcon: Record<
  UploadStatusType,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  COMPLETED: CheckCircle2Icon,
  CREATED: CalendarIcon,
  UPLOADING: ClockIcon,
};

const StatusColor: Record<UploadStatusType, string> = {
  COMPLETED: "text-green-500",
  CREATED: "text-gray-500",
  UPLOADING: "text-yellow-500",
};

const StatusLabel: Record<UploadStatusType, ReactNode> = {
  COMPLETED: "Completed",
  CREATED: "Created",
  UPLOADING: "Uploading",
};

export const UploadStatus = ({ status }: Props) => {
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
