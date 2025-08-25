import type { MediaCenterMetricShadowType } from "@/api/interfaces/http/metrics/media-center/get-media-center-metric";
import { Fragment, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Spinner } from "../ui/spinner";
import { cn, formatNumber } from "@/lib/utils";

interface Props {
  label: ReactNode;
  value: ReactNode;
  shadow?: {
    value: number;
    percent: number;
    type: MediaCenterMetricShadowType;
  };
  period?: number;
  chart?: ReactNode;
  isFetching?: boolean;
}

export const MetricCard = ({
  label,
  value,
  shadow,
  chart,
  period,
  isFetching,
}: Props) => {
  return (
    <div className="relative grow-1 basis-1/5 flex justify-between items-end bg-app-secondary rounded-2xl gap-4 overflow-hidden border border-white/10 min-w-96">
      <div className="col-span-2 p-6 pr-0 h-full flex flex-col justify-between">
        <header className="flex items-center gap-2">
          <p className="text-sm text-app-secondary-foreground-muted text-nowrap">
            {label}
          </p>
          {shadow && (
            <Tooltip>
              <TooltipTrigger
                onClick={(event) => {
                  event.preventDefault();
                }}
                asChild
              >
                <span
                  className={cn(
                    "text-[0.65rem] py-0.5 px-2 rounded-full cursor-default select-none",
                    shadow.type === "POSITIVE" &&
                      "bg-green-300/10 text-green-500",
                    shadow.type === "NEGATIVE" && "bg-red-300/10 text-red-500"
                  )}
                >
                  {(shadow.type === "POSITIVE" && "+") || null}
                  {formatNumber(shadow.percent)}%
                </span>
              </TooltipTrigger>
              <TooltipContent
                onPointerDownOutside={(event) => {
                  event.preventDefault();
                }}
                sideOffset={8}
                side="top"
              >
                {shadow.type === "NEUTRAL" ? (
                  "No data recorded to it"
                ) : (
                  <Fragment>
                    {shadow.type === "POSITIVE"
                      ? `${shadow.percent}% more data than the period before`
                      : `${shadow.percent}% less data than the period before`}
                  </Fragment>
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </header>
        <h2 className="mt-4 text-4xl font-black text-app-secondary-foreground text-nowrap">
          {value}
        </h2>
      </div>
      {chart}

      {isFetching && (
        <div className="absolute top-0 right-0 px-6 py-4">
          <Spinner className="size-4" />
        </div>
      )}
    </div>
  );
};

/*
<ChartContainer
    config={chartConfig}
    className="w-full pointer-events-none min-w-36"
  >
    <AreaChart
      margin={{ bottom: -4, left: 0, right: 0, top: 5 }}
      accessibilityLayer
      data={chart}
    >
      <Area
        type="basis"
        dataKey="totalStored"
        stroke="#00c951"
        fill="#05df72"
        fillOpacity={0.1}
        activeDot={false}
      />
     
      </AreaChart>
      </ChartContainer>
*/
