import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const locale = new Intl.Locale("en");

const numberFormat = new Intl.NumberFormat(locale, {
  maximumFractionDigits: 2,
});

const moneyFormat = new Intl.NumberFormat(locale, {
  maximumFractionDigits: 2,
  style: "currency",
  currency: "USD",
});

export function formatFileSize(size: number) {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export const formatNumber = (value: number) => {
  return numberFormat.format(value);
};

export const formatMoneyValue = (value: number) => {
  return moneyFormat.format(value);
};

type TmdbImageSize = "w500" | "w300" | "w1920" | "original";

export const getFullUrl = (key: string, size?: TmdbImageSize) => {
  return `https://image.tmdb.org/t/p/${size || "original"}${key}`;
};

export function secondsToTime(secs: number) {
  if (!secs) return "00:00";

  const hours = Math.floor(secs / (60 * 60));

  const divisor_for_minutes = secs % (60 * 60);
  const minutes = Math.floor(divisor_for_minutes / 60);

  const divisor_for_seconds = divisor_for_minutes % 60;
  const seconds = Math.ceil(divisor_for_seconds);

  const timeHours = String(hours).padStart(2, "0") || "00";
  const timeMinutes = String(minutes).padStart(2, "0") || "00";
  const timeSeconds = String(seconds).padStart(2, "0") || "00";

  if (hours > 0) return `${timeHours}:${timeMinutes}:${timeSeconds}`;

  if (minutes > 0) return `${timeMinutes}:${timeSeconds}`;

  return `${timeMinutes}:${timeSeconds}`;
}

export function parseLanguage(language: string) {
  return new Intl.DisplayNames(["pt-BR"], { type: "language" }).of(language);
}

export const getFormData = <T extends string | Blob>(
  object: Record<string, T>
) => {
  const formData = new FormData();

  Object.keys(object).forEach((key) => {
    if (object[key] !== undefined) {
      formData.append(key, object[key]);

      console.log(key, object[key]);
    }
  });

  return formData;
};
// Object.keys(object).reduce((formData, key) => {
//   console.log(key, object[key]);

//   if (object[key] !== undefined) {
//     formData.append(key, object[key]);
//   }

//   return formData;
// }, new FormData());

export const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value);

  toast.success("YeeP", {
    description: "Text copied successfully to your clipboard",
  });
};
