import { cn } from "@/lib/utils";
import type { TitleType as TitleTypeT } from "@/api/interfaces/title";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClapperboardIcon,
  ClockIcon,
  TicketsIcon,
  XCircleIcon,
  type LucideProps,
} from "lucide-react";
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import type { ClassNameValue } from "tailwind-merge";

interface Props {
  type: TitleTypeT;
}

const TypeIcon: Record<
  TitleTypeT,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  MOVIE: ClapperboardIcon,
  TV_SHOW: TicketsIcon,
};

const TypeColor: Record<TitleTypeT, ClassNameValue> = {
  MOVIE: null,
  TV_SHOW: null,
};

const TypeLabel: Record<TitleTypeT, ReactNode> = {
  MOVIE: "Movie",
  TV_SHOW: "TV Show",
};

export const TitleType = ({ type }: Props) => {
  const Icon = TypeIcon[type];
  const color = TypeColor[type];
  const label = TypeLabel[type];

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
