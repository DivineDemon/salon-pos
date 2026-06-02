export const REPORT_TIMEZONE = "Asia/Muscat" as const;

export type DateRange = {
  from: Date;
  to: Date;
};

function muscatDateParts(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
}

function muscatMidnight(year: string, month: string, day: string): Date {
  return new Date(`${year}-${month}-${day}T00:00:00+04:00`);
}

function muscatEndOfDay(year: string, month: string, day: string): Date {
  return new Date(`${year}-${month}-${day}T23:59:59.999+04:00`);
}

export function formatMuscatDateParam(date: Date): string {
  const parts = muscatDateParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function startOfTodayMuscat(): Date {
  const parts = muscatDateParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return muscatMidnight(year, month, day);
}

export function resolveReportDateRange(from?: string, to?: string): DateRange {
  const now = new Date();
  const parts = muscatDateParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const today = {
    from: muscatMidnight(year, month, day),
    to: muscatEndOfDay(year, month, day),
  };

  const fromParts = from?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const toParts = to?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (fromParts && toParts) {
    const rangeFrom = muscatMidnight(fromParts[1], fromParts[2], fromParts[3]);
    const rangeTo = muscatEndOfDay(toParts[1], toParts[2], toParts[3]);
    if (rangeFrom <= rangeTo) return { from: rangeFrom, to: rangeTo };
  }

  return today;
}
