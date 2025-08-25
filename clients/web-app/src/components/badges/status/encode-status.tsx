import { cn } from "@/lib/utils";
import type { EncodeStatus as EncodeStatusType } from "@/api/interfaces/encode";
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
  status: EncodeStatusType;
}

const StatusIcon: Record<
  EncodeStatusType,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  COMPLETED: CheckCircle2Icon,
  IN_QUEUE: CalendarIcon,
  PROCESSING: ClockIcon,
};

const StatusColor: Record<EncodeStatusType, string> = {
  COMPLETED: "text-green-500",
  IN_QUEUE: "text-gray-500",
  PROCESSING: "text-yellow-500",
};

const StatusLabel: Record<EncodeStatusType, ReactNode> = {
  COMPLETED: "Completed",
  IN_QUEUE: "In queue",
  PROCESSING: "Processing",
};

export const EncodeStatus = ({ status }: Props) => {
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
