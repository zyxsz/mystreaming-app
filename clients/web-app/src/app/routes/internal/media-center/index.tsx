import type { MediaCenterChartType } from "@/api/interfaces/http/metrics/media-center/get-media-center-chart";
import type {
  GetMediaCenterTotalBandwidthMetric,
  GetMediaCenterTotalPlaybacksMetric,
  GetMediaCenterTotalStorageMetric,
} from "@/api/interfaces/http/metrics/media-center/get-media-center-metric";
import {
  getMediaCenterChart,
  getMediaCenterMetric,
} from "@/api/services/metrics.service";
import { MetricCard } from "@/components/metrics/metric-card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize, formatNumber } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { addDays, formatDate, parseISO } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { Fragment } from "react/jsx-runtime";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

export function meta() {
  return [{ title: "Dashboard | Media center | MyStreaming" }];
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function Page() {
  const [period, setPeriod] = useQueryState<number>(
    "period",
    parseAsInteger.withDefault(7)
  );

  const handleSelectPeriod = (period: number) => {
    setPeriod(period);
  };

  return (
    <div className="flex flex-col gap-2">
      <header className="pl-4 flex items-center gap-4">
        <h4 className="text-sm text-app-primary-foreground-muted">
          Showing results for the last
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="link"
              size="sm"
              className="text-app-primary-foreground px-0"
            >
              {period} days <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            sideOffset={4}
            align="center"
            className="min-w-48"
          >
            <DropdownMenuItem onClick={() => handleSelectPeriod(7)}>
              Last 7 days
              {period === 7 ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectPeriod(30)}>
              Last 30 days
              {period === 30 ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectPeriod(60)}>
              Last 60 days
              {period === 60 ? <CheckIcon /> : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-wrap gap-2 2xl:grid-cols-4">
        <TotalStorageMetric period={period} />
        <TotalBandwidthMetric period={period} />
        <TotalPlaybacksMetric period={period} />
        <TotalUploadsMetric period={period} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Chart type="ENCODES" />
        <Chart type="UPLOADS" />
      </div>
    </div>
  );
}

const TotalStorageMetric = ({ period }: { period: number }) => {
  const start = addDays(new Date(), -period);
  const end = new Date();

  const { data, isFetching } = useQuery({
    queryKey: ["metrics", "TOTAL_STORAGE", period],
    queryFn: () =>
      getMediaCenterMetric<GetMediaCenterTotalStorageMetric>({
        from: start,
        to: end,
        type: "TOTAL_STORAGE",
      }),
    placeholderData: keepPreviousData,
  });

  if (!data) return null;

  return (
    <MetricCard
      label="Total storage"
      value={formatFileSize(data.value)}
      shadow={data.shadow}
      period={period}
      isFetching={isFetching}
      chart={
        <ChartContainer
          config={chartConfig}
          className="w-full pointer-events-none min-w-36"
        >
          <AreaChart
            margin={{
              bottom: period >= 30 ? 0 : -1,
              left: 0,
              right: 0,
              top: 5,
            }}
            accessibilityLayer
            data={data.chart}
          >
            <Area
              type="basis"
              dataKey="totalStored"
              stroke={getStokeColor(data.shadow?.type)}
              fill={getFillColor(data.shadow?.type)}
              fillOpacity={0.1}
              activeDot={false}
            />
          </AreaChart>
        </ChartContainer>
      }
    />
  );
};
const TotalBandwidthMetric = ({ period }: { period: number }) => {
  const start = addDays(new Date(), -period);
  const end = new Date();

  const { data, isFetching } = useQuery({
    queryKey: ["metrics", "TOTAL_BANDWIDTH", period],
    queryFn: () =>
      getMediaCenterMetric<GetMediaCenterTotalBandwidthMetric>({
        from: start,
        to: end,
        type: "TOTAL_BANDWIDTH",
      }),
    placeholderData: keepPreviousData,
  });

  if (!data) return null;

  return (
    <MetricCard
      isFetching={isFetching}
      label="Total bandwidth"
      value={formatFileSize(data.value)}
      shadow={data.shadow}
      period={period}
      chart={
        <ChartContainer
          config={chartConfig}
          className="w-full pointer-events-none min-w-36"
        >
          <AreaChart
            margin={{
              bottom: period >= 30 ? 0 : -1,
              left: 0,
              right: 0,
              top: 5,
            }}
            accessibilityLayer
            data={data.chart}
          >
            <Area
              type="basis"
              dataKey="totalBandwidth"
              stroke={getStokeColor(data.shadow?.type)}
              fill={getFillColor(data.shadow?.type)}
              fillOpacity={0.1}
              activeDot={false}
            />
          </AreaChart>
        </ChartContainer>
      }
    />
  );
};
const TotalPlaybacksMetric = ({ period }: { period: number }) => {
  const start = addDays(new Date(), -period);
  const end = new Date();

  const { data, isFetching } = useQuery({
    queryKey: ["metrics", "TOTAL_PLAYBACKS", period],
    queryFn: () =>
      getMediaCenterMetric<GetMediaCenterTotalPlaybacksMetric>({
        from: start,
        to: end,
        type: "TOTAL_PLAYBACKS",
      }),
    placeholderData: keepPreviousData,
  });

  if (!data) return null;

  return (
    <MetricCard
      isFetching={isFetching}
      label="Total playbacks"
      value={formatNumber(data.value)}
      shadow={data.shadow}
      period={period}
      chart={
        <ChartContainer
          config={chartConfig}
          className="w-full pointer-events-none min-w-36"
        >
          <AreaChart
            margin={{
              bottom: period >= 30 ? 0 : -1,
              left: 0,
              right: 0,
              top: 5,
            }}
            accessibilityLayer
            data={data.chart}
          >
            <Area
              type="basis"
              dataKey="count"
              stroke={getStokeColor(data.shadow?.type)}
              fill={getFillColor(data.shadow?.type)}
              fillOpacity={0.1}
              activeDot={false}
            />
          </AreaChart>
        </ChartContainer>
      }
    />
  );
};
const TotalUploadsMetric = ({ period }: { period: number }) => {
  const start = addDays(new Date(), -period);
  const end = new Date();

  const { data, isFetching } = useQuery({
    queryKey: ["metrics", "TOTAL_UPLOADS", period],
    queryFn: () =>
      getMediaCenterMetric<GetMediaCenterTotalPlaybacksMetric>({
        from: start,
        to: end,
        type: "TOTAL_UPLOADS",
      }),
    placeholderData: keepPreviousData,
  });

  if (!data) return null;

  return (
    <MetricCard
      isFetching={isFetching}
      label="Total uploads"
      value={formatNumber(data.value)}
      shadow={data.shadow}
      period={period}
      chart={
        <ChartContainer
          config={chartConfig}
          className="w-full pointer-events-none min-w-36"
        >
          <AreaChart
            margin={{
              bottom: period >= 30 ? 0 : -1,
              left: 0,
              right: 0,
              top: 5,
            }}
            accessibilityLayer
            data={data.chart}
          >
            <Area
              type="basis"
              dataKey="count"
              stroke={getStokeColor(data.shadow?.type)}
              fill={getFillColor(data.shadow?.type)}
              fillOpacity={0.1}
              activeDot={false}
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      }
    />
  );
};

const Chart = ({
  label,
  type,
}: {
  label?: ReactNode;
  type: MediaCenterChartType;
}) => {
  const [period, setPeriod] = useQueryState<number>(
    `chart-${type.toLowerCase()}-period`,
    parseAsInteger.withDefault(30)
  );

  const from = addDays(new Date(), -period);
  const to = new Date();

  const { data: chart } = useQuery({
    queryKey: ["metrics", "charts", type, period],
    queryFn: () => getMediaCenterChart({ from, to, type: type }),
    placeholderData: keepPreviousData,
  });

  if (!chart) return null;

  const handleSelectPeriod = (period: number) => {
    setPeriod(period);
  };

  return (
    <div className="bg-app-secondary rounded-2xl border border-white/10">
      <header className="flex items-center gap-4 justify-between p-6 py-4 border-b border-white/10">
        <h6 className="text-sm text-app-primary-foreground-muted select-none">
          {label || chart.label}
        </h6>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="link"
              size="sm"
              className="text-app-primary-foreground px-0"
            >
              {period} days <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            sideOffset={4}
            align="center"
            className="min-w-48"
          >
            <DropdownMenuItem onClick={() => handleSelectPeriod(7)}>
              Last 7 days
              {period === 7 ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectPeriod(30)}>
              Last 30 days
              {period === 30 ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSelectPeriod(60)}>
              Last 60 days
              {period === 60 ? <CheckIcon /> : null}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="p-6 py-4">
        <ChartContainer config={chart.config} className="w-full">
          <BarChart accessibilityLayer data={chart.data} barGap={2}>
            <CartesianGrid vertical={false} />
            {chart.componentsConfig?.XAxis && (
              <XAxis
                dataKey={chart.componentsConfig.XAxis.dataKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
            )}
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent payload={{}} />} />
            {chart.keys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chart.config[key].color}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

const getStokeColor = (type?: "NEUTRAL" | "POSITIVE" | "NEGATIVE") => {
  switch (type) {
    case "NEGATIVE":
      return "#fb2c36";
    case "POSITIVE":
      return "#00c951";
    case "NEUTRAL":
      return "#fff";
    default:
      return "#fff";
  }
};

const getFillColor = (type?: "NEUTRAL" | "POSITIVE" | "NEGATIVE") => {
  switch (type) {
    case "NEGATIVE":
      return "#fb2c36";
    case "POSITIVE":
      return "#00c951";
    case "NEUTRAL":
      return "#fff";
    default:
      return "#fff";
  }
};

/*
  <div className="flex gap-2">
        <div className="flex-1 flex justify-between items-end bg-app-secondary rounded-2xl gap-4 p-8">
          <ChartContainer config={chartConfig} className="w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent payload={{}} />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex-1 flex justify-between items-end bg-app-secondary rounded-2xl gap-4 p-4">
          <ChartContainer config={chartConfig} className="w-full rounded-2xl">
            <AreaChart
              margin={{ bottom: 12, left: 0, right: 0, top: 12 }}
              accessibilityLayer
              data={chartData}
              className="bg-app-primary"
            >
               <XAxis dataKey="desktop" /> 
              {/* <YAxis /> 
              <ChartTooltip content={<ChartTooltipContent />} />
               <ChartLegend content={<ChartLegendContent payload={{}} />} />
              <Area
                type="monotone"
                dataKey="mobile"
                stroke="rgb(136, 132, 216)"
                fill="rgba(136, 132, 216, 0.3)"
                activeDot={false}
              />
            </AreaChart>

            {/* <BarChart accessibilityLayer data={chartData}>
 
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent payload={{}} />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart> 
          </ChartContainer>
        </div>
      </div>
*/
