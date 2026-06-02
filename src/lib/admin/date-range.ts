export type ReportRangePreset = "today" | "week" | "custom";

export type DateRange = {
  from: Date;
  to: Date;
};

function muscatDateParts(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Muscat",
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

export function startOfTodayMuscat(): Date {
  const parts = muscatDateParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return muscatMidnight(year, month, day);
}

export function resolveReportDateRange(
  preset: ReportRangePreset,
  customFrom?: string,
  customTo?: string,
): DateRange {
  const now = new Date();
  const parts = muscatDateParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  if (preset === "today") {
    return {
      from: muscatMidnight(year, month, day),
      to: muscatEndOfDay(year, month, day),
    };
  }

  if (preset === "week") {
    const end = muscatEndOfDay(year, month, day);
    const startDate = new Date(muscatMidnight(year, month, day));
    startDate.setDate(startDate.getDate() - 6);
    const startParts = muscatDateParts(startDate);
    const sy = startParts.find((p) => p.type === "year")?.value ?? year;
    const sm = startParts.find((p) => p.type === "month")?.value ?? month;
    const sd = startParts.find((p) => p.type === "day")?.value ?? day;
    return { from: muscatMidnight(sy, sm, sd), to: end };
  }

  const fromParts = customFrom?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const toParts = customTo?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (fromParts && toParts) {
    const from = muscatMidnight(fromParts[1], fromParts[2], fromParts[3]);
    const to = muscatEndOfDay(toParts[1], toParts[2], toParts[3]);
    if (from <= to) return { from, to };
  }

  return {
    from: muscatMidnight(year, month, day),
    to: muscatEndOfDay(year, month, day),
  };
}
