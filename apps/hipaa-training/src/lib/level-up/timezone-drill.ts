/** Pacific / Central / Eastern → India (IST) drills — uses IANA zones + DST. */

export type UsZone = "America/Los_Angeles" | "America/Chicago" | "America/New_York";

const ZONE_LABEL: Record<UsZone, string> = {
  "America/Los_Angeles": "Pacific (PT)",
  "America/Chicago": "Central (CT)",
  "America/New_York": "Eastern (ET)",
};

function findUtcForLocal(zone: UsZone, hour: number, minute: number, ref: Date): Date {
  const y = ref.getUTCFullYear();
  const mo = ref.getUTCMonth();
  const da = ref.getUTCDate();
  let candidate = new Date(Date.UTC(y, mo, da, 0, 0, 0));
  for (let step = 0; step < 24 * 4; step++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(candidate);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const min = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    if (h === hour && min === minute) return candidate;
    candidate = new Date(candidate.getTime() + 15 * 60 * 1000);
  }
  return candidate;
}

export function usLocalToIstLabel(
  zone: UsZone,
  hour: number,
  minute: number,
  ref = new Date(),
): { istLabel: string; istHour24: number; istMinute: number } {
  const utc = findUtcForLocal(zone, hour, minute, ref);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(utc);
  const h12 = parts.find((p) => p.type === "hour")?.value ?? "?";
  const min = parts.find((p) => p.type === "minute")?.value ?? "00";
  const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value ?? "";

  const parts24 = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(utc);
  const istHour24 = Number(parts24.find((p) => p.type === "hour")?.value ?? 0);
  const istMinute = Number(parts24.find((p) => p.type === "minute")?.value ?? 0);

  return {
    istLabel: `${h12}:${min} ${dayPeriod} IST`.replace(/\s+/g, " ").trim(),
    istHour24,
    istMinute,
  };
}

function format12(h24: number, min: number): string {
  const period = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 || 12;
  return `${h}:${min.toString().padStart(2, "0")} ${period}`;
}

export type TimezoneDrill = {
  id: string;
  scenario: string;
  zone: UsZone;
  usHour: number;
  usMinute: number;
  choices: string[];
  correctIndex: number;
  explain: string;
};

export function buildTimezoneDrill(ref = new Date()): TimezoneDrill {
  const zones: UsZone[] = ["America/Los_Angeles", "America/Chicago", "America/New_York"];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  const usHour = [9, 10, 11, 14, 15, 16, 17][Math.floor(Math.random() * 7)];
  const usMinute = [0, 30][Math.floor(Math.random() * 2)];

  const { istHour24, istMinute, istLabel } = usLocalToIstLabel(zone, usHour, usMinute, ref);
  const correct = istLabel;

  const wrongSet = new Set<string>();
  while (wrongSet.size < 3) {
    const delta = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
    let h = istHour24 + delta;
    if (h < 0) h += 24;
    if (h > 23) h -= 24;
    wrongSet.add(format12(h, istMinute) + " IST");
  }

  const choices = [correct, ...wrongSet].sort(() => Math.random() - 0.5);

  const usLabel = format12(usHour, usMinute);
  const zoneName = ZONE_LABEL[zone];

  return {
    id: `${zone}-${usHour}-${usMinute}`,
    scenario: `A patient in ${zoneName} says: "I'm free at ${usLabel} my time." What time is that in India for your calendar?`,
    zone,
    usHour,
    usMinute,
    choices,
    correctIndex: choices.indexOf(correct),
    explain: `${usLabel} ${zoneName} → ${correct} on this date (accounts for US daylight saving). Always confirm the patient's timezone.`,
  };
}

/** Daily-stable drill (same for everyone each UTC day). */
export function timezoneDrillOfDay(ref = new Date()): TimezoneDrill {
  const day = ref.toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  const zones: UsZone[] = ["America/Los_Angeles", "America/Chicago", "America/New_York"];
  const zone = zones[h % zones.length];
  const hours = [9, 12, 15, 17];
  const usHour = hours[(h >> 4) % hours.length];
  const usMinute = (h & 1) === 0 ? 0 : 30;

  const { istLabel } = usLocalToIstLabel(zone, usHour, usMinute, ref);
  const correct = istLabel;
  const { istHour24, istMinute } = usLocalToIstLabel(zone, usHour, usMinute, ref);

  const wrong = [
    format12((istHour24 + 2) % 24, istMinute) + " IST",
    format12((istHour24 + 24 - 3) % 24, istMinute) + " IST",
    format12((istHour24 + 1) % 24, istMinute) + " IST",
  ];
  const choices = [correct, ...wrong].sort(() => Math.random() - 0.5);
  const usLabel = format12(usHour, usMinute);

  return {
    id: `daily-${day}`,
    scenario: `Patient (${ZONE_LABEL[zone]}): "Let's meet at ${usLabel} my time." India team sees which time?`,
    zone,
    usHour,
    usMinute,
    choices,
    correctIndex: choices.indexOf(correct),
    explain: `${usLabel} ${ZONE_LABEL[zone]} → ${correct}. Tip: Dallas = Central, Los Angeles = Pacific, Miami = Eastern.`,
  };
}
