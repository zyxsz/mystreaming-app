import type { StorageMetricsRepository } from "@/app/repositories/storage-metrics.repository";
import type { GetChartMetricDTO, GetMediaCenterMetric } from "./metrics.dto";
import { addDays, format } from "date-fns";
import type { PlaybacksRepository } from "@/app/repositories/playbacks.repository";
import type { EncodesRepository } from "@/app/repositories/encodes.repository";
import type { UploadsRepository } from "@/app/repositories/uploads.repository";

export class MetricsUseCase {
  constructor(
    private storageMetricsRepository: StorageMetricsRepository,
    private playbacksRepository: PlaybacksRepository,
    private encodesRepository: EncodesRepository,
    private uploadsRepository: UploadsRepository
  ) {}

  async getMediaCenterMetric(dto: GetMediaCenterMetric) {
    if (dto.type === "TOTAL_STORAGE") {
      const shadowDate = this.getShadowPeriod(dto.from, dto.to);

      const shadowStored =
        await this.storageMetricsRepository.findManyByTypeWithPeriod("STORE", {
          from: shadowDate.start,
          to: shadowDate.end,
        });
      const shadowDeleted =
        await this.storageMetricsRepository.findManyByTypeWithPeriod("DELETE", {
          from: shadowDate.start,
          to: shadowDate.end,
        });

      const totalShadowStored = shadowStored.reduce((a, b) => a + b.bytes, 0);
      const totalShadowDeleted = shadowDeleted.reduce((a, b) => a + b.bytes, 0);

      const stored =
        await this.storageMetricsRepository.findManyByTypeWithPeriod("STORE", {
          from: dto.from,
          to: dto.to,
        });
      const deleted =
        await this.storageMetricsRepository.findManyByTypeWithPeriod("DELETE", {
          from: dto.from,
          to: dto.to,
        });

      const totalStored = stored.reduce((a, b) => a + b.bytes, 0);
      const totalDeleted = deleted.reduce((a, b) => a + b.bytes, 0);

      const days = this.getDaysFromPeriod(dto.from, dto.to);

      const chartMetrics = days.map((day) => {
        const totalStored = stored
          .filter(
            (s) =>
              s.createdAt.getTime() >= day.start.getTime() &&
              s.createdAt.getTime() <= day.end.getTime()
          )
          .reduce((a, b) => a + b.bytes, 0);
        const totalDeleted = deleted
          .filter(
            (s) =>
              s.createdAt.getTime() >= day.start.getTime() &&
              s.createdAt.getTime() <= day.end.getTime()
          )
          .reduce((a, b) => a + b.bytes, 0);

        return {
          label: day.start,
          totalStored: totalStored,
          totalDeleted: totalDeleted,
        };
      });

      const totalValue = totalStored - totalDeleted;
      const totalShadowValue = totalShadowStored - totalShadowDeleted;

      const shadowPercent = Math.round(
        ((totalValue - totalShadowValue) / totalValue) * 100
      );

      return {
        value: totalValue,
        chart: chartMetrics,
        shadow: {
          value: totalShadowValue,
          percent: shadowPercent,
          type:
            (shadowPercent === 0 && ("NEUTRAL" as const)) ||
            (shadowPercent > 0 && ("POSITIVE" as const)) ||
            (shadowPercent < 0 && ("NEGATIVE" as const)) ||
            "NEUTRAL",
        },
      };
    } else if (dto.type === "TOTAL_BANDWIDTH") {
      const shadowDate = this.getShadowPeriod(dto.from, dto.to);

      const shadowBandwidthMetrics =
        await this.storageMetricsRepository.findManyByReferenceTypeAndPeriod(
          "MEDIA_PLAYBACK",
          {
            from: shadowDate.start,
            to: shadowDate.end,
          }
        );

      const bandwidthMetrics =
        await this.storageMetricsRepository.findManyByReferenceTypeAndPeriod(
          "MEDIA_PLAYBACK",
          {
            from: dto.from,
            to: dto.to,
          }
        );

      const days = this.getDaysFromPeriod(dto.from, dto.to);

      const chartMetrics = days.map((day) => {
        const bandwidth = bandwidthMetrics
          .filter(
            (s) =>
              s.createdAt.getTime() >= day.start.getTime() &&
              s.createdAt.getTime() <= day.end.getTime()
          )
          .reduce((a, b) => a + b.bytes, 0);

        return {
          label: day.start,
          totalBandwidth: bandwidth,
        };
      });

      const totalValue = bandwidthMetrics.reduce((a, b) => a + b.bytes, 0);
      const totalShadowValue = shadowBandwidthMetrics.reduce(
        (a, b) => a + b.bytes,
        0
      );
      // totalShadowStored - totalShadowStored;
      // const shadowPercent = Math.round((totalStored / totalValue) * 100);
      const shadowPercent = Math.round(
        ((totalValue - totalShadowValue) / totalValue) * 100
      );

      return {
        value: totalValue,
        chart: chartMetrics,
        shadow: {
          value: totalShadowValue,
          percent: shadowPercent,
          type:
            (shadowPercent === 0 && ("NEUTRAL" as const)) ||
            (shadowPercent > 0 && ("POSITIVE" as const)) ||
            (shadowPercent < 0 && ("NEGATIVE" as const)) ||
            "NEUTRAL",
        },
      };
    } else if (dto.type === "TOTAL_PLAYBACKS") {
      const shadowDate = this.getShadowPeriod(dto.from, dto.to);

      const shadowPlaybacks = await this.playbacksRepository.findManyByPeriod({
        from: shadowDate.start,
        to: shadowDate.end,
      });

      const allPlaybacks = await this.playbacksRepository.findManyByPeriod({
        from: dto.from,
        to: dto.to,
      });

      const days = this.getDaysFromPeriod(dto.from, dto.to);

      const chartMetrics = days.map((day) => {
        const playbacks = allPlaybacks.filter(
          (s) =>
            s.createdAt.getTime() >= day.start.getTime() &&
            s.createdAt.getTime() <= day.end.getTime()
        );

        return {
          label: day.start,
          count: playbacks.length,
        };
      });

      const totalValue = allPlaybacks.length;
      const totalShadowValue = shadowPlaybacks.length;
      // totalShadowStored - totalShadowStored;
      // const shadowPercent = Math.round((totalStored / totalValue) * 100);
      const shadowPercent = Math.round(
        ((totalValue - totalShadowValue) / totalValue) * 100
      );

      return {
        value: totalValue,
        chart: chartMetrics,
        shadow: {
          value: totalShadowValue,
          percent: shadowPercent,
          type:
            (shadowPercent === 0 && ("NEUTRAL" as const)) ||
            (shadowPercent > 0 && ("POSITIVE" as const)) ||
            (shadowPercent < 0 && ("NEGATIVE" as const)) ||
            "NEUTRAL",
        },
      };
    } else if (dto.type === "TOTAL_UPLOADS") {
      const shadowDate = this.getShadowPeriod(dto.from, dto.to);

      const shadowUploads = await this.uploadsRepository.findManyByPeriod({
        from: shadowDate.start,
        to: shadowDate.end,
      });

      const allUploads = await this.uploadsRepository.findManyByPeriod({
        from: dto.from,
        to: dto.to,
      });

      const days = this.getDaysFromPeriod(dto.from, dto.to);

      const chartMetrics = days.map((day) => {
        const uploads = allUploads.filter(
          (s) =>
            s.createdAt.getTime() >= day.start.getTime() &&
            s.createdAt.getTime() <= day.end.getTime()
        );

        return {
          label: day.start,
          count: uploads.length,
        };
      });

      const totalValue = allUploads.length;
      const totalShadowValue = shadowUploads.length;
      // totalShadowStored - totalShadowStored;
      // const shadowPercent = Math.round((totalStored / totalValue) * 100);
      const shadowPercent = Math.round(
        ((totalValue - totalShadowValue) / totalValue) * 100
      );

      return {
        value: totalValue,
        chart: chartMetrics,
        shadow: {
          value: totalShadowValue,
          percent: shadowPercent,
          type:
            (shadowPercent === 0 && ("NEUTRAL" as const)) ||
            (shadowPercent > 0 && ("POSITIVE" as const)) ||
            (shadowPercent < 0 && ("NEGATIVE" as const)) ||
            "NEUTRAL",
        },
      };
    }
  }

  async getChart(dto: GetChartMetricDTO) {
    if (dto.type === "ENCODES") {
      const encodes = await this.encodesRepository.findManyByPeriod({
        from: dto.from,
        to: dto.to,
      });

      const days = this.getDaysFromPeriod(dto.from, dto.to);
      const chartValue = days.map((day) => {
        const filteredEncodes = encodes.filter(
          (s) =>
            s.createdAt.getTime() >= day.start.getTime() &&
            s.createdAt.getTime() <= day.end.getTime()
        );

        return {
          label: format(day.end, "dd/MM"),
          count: filteredEncodes.length,
          success: filteredEncodes.filter((s) => s.status === "COMPLETED")
            .length,
          error: 0,
        };
      });

      return {
        label: "Encode metrics",
        data: chartValue,
        config: {
          count: {
            label: "Count",
            color: "#fff",
          },
          success: {
            label: "Success",
            color: "#00c951",
          },
          error: {
            label: "Error",
            color: "#fb2c36",
          },
        },
        keys: ["success", "error"],
        componentsConfig: {
          XAxis: {
            dataKey: "label",
          },
        },
      };
    } else if (dto.type === "UPLOADS") {
      const uploads = await this.uploadsRepository.findManyByPeriod({
        from: dto.from,
        to: dto.to,
      });

      const days = this.getDaysFromPeriod(dto.from, dto.to);
      const chartValue = days.map((day) => {
        const filtered = uploads.filter(
          (s) =>
            s.createdAt.getTime() >= day.start.getTime() &&
            s.createdAt.getTime() <= day.end.getTime()
        );

        return {
          label: format(day.end, "dd/MM"),
          count: filtered.length,
          uploading: filtered.filter((u) => u.status === "UPLOADING").length,
          available: filtered.filter((u) => u.status === "COMPLETED").length,
        };
      });

      return {
        label: "Uploads metrics",
        data: chartValue,
        config: {
          count: {
            label: "Count",
            color: "rgba(255,255,255,0.2)",
          },
          available: {
            label: "Available",
            color: "#00c951",
          },
          uploading: {
            label: "Uploading",
            color: "#efb100",
          },
        },
        keys: ["available", "uploading"],
        componentsConfig: {
          XAxis: {
            dataKey: "label",
          },
        },
      };
    }
  }

  private getShadowPeriod(from: Date, to: Date) {
    const amountOfDays = Math.round(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );

    const start = addDays(from, amountOfDays * -1);
    const end = from;

    return { start, end };
  }

  private getDaysFromPeriod(from: Date, to: Date) {
    const amountOfDays = Math.round(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );

    const days = Array.from({ length: amountOfDays }, (_, i) => i + 1).map(
      (day) => {
        const start = addDays(from, day);
        start.setUTCHours(0, 0, 0, 0);

        const end = addDays(from, day);
        end.setUTCHours(23, 59, 59, 999);

        return {
          start,
          end,
        };
      }
    );

    return days;
  }
}
