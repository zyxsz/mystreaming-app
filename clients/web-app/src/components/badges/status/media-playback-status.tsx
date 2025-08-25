import { cn } from "@/lib/utils";
import type { PlaybackStatus } from "@/types/entities";
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
  status: PlaybackStatus;
}

const StatusIcon: Record<
  PlaybackStatus,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  ALIVE: CheckCircle2Icon,
  CLOSED: XCircleIcon,
  CREATED: CalendarIcon,
  EXPIRED: ClockIcon,
  FINISHED: XCircleIcon,
  INACTIVE: ClockIcon,
};

const StatusColor: Record<PlaybackStatus, string> = {
  ALIVE: "text-green-500",
  CLOSED: "text-gray-600",
  CREATED: "text-gray-500",
  EXPIRED: "text-red-500",
  INACTIVE: "text-yellow-500",
  FINISHED: "text-green-400",
};

const StatusLabel: Record<PlaybackStatus, ReactNode> = {
  ALIVE: "Alive",
  CLOSED: "Closed",
  CREATED: "Created",
  EXPIRED: "Expired",
  FINISHED: "Finished",
  INACTIVE: "Inactive",
};

export const MediaPlaybackStatus = ({ status }: Props) => {
  const Icon = StatusIcon[status];
  const color = StatusColor[status];
  const label = StatusLabel[status];

  return (
    <div className='flex gap-2 items-center text-sm text-app-secondary-foreground-muted select-none'>
      <Icon className={cn("size-4", color)} />
      {label}
    </div>
  );
};
