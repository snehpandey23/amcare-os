import type { RecurrenceConfig, TaskRecurrence } from "./task-store.js";

/** Pure: should this template generate a task on calendar date YYYY-MM-DD? */
export function templateRunsOnDate(
  recurrence: TaskRecurrence,
  config: RecurrenceConfig,
  dateStr: string,
): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const dow = d.getDay();
  const dom = d.getDate();
  switch (recurrence) {
    case "daily":
      return true;
    case "weekly":
      return config.daysOfWeek?.length ? config.daysOfWeek.includes(dow) : dow === 1;
    case "monthly":
      return dom === (config.dayOfMonth ?? 1);
    case "custom_cron":
      return false;
    default:
      return false;
  }
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Next N calendar dates (from startDate inclusive) when template would run. */
export function nextOccurrenceDates(
  recurrence: TaskRecurrence,
  config: RecurrenceConfig,
  startDate: string,
  count: number,
): string[] {
  const out: string[] = [];
  let cursor = startDate;
  for (let i = 0; i < 366 * 2 && out.length < count; i++) {
    if (templateRunsOnDate(recurrence, config, cursor)) out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}
