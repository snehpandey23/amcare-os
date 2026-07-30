/**
 * Staff-facing copy — no engineering / WorkDrive / git vocabulary in chat output.
 */

const INTERNAL_PATH =
  /(?:Common Folder\/SiyaOS|WorkDrive|Zoho WorkDrive|docs\/siyaos-knowledge-base|apps\/siya-health|apps\/siya-assistant|bot_retrieve|SiyaOS|npm run kb:build|git KB|status:\s*live|npm run|\.md\b|\.mjs\b)/gi;

const BACKTICK_PATH = /`[^`]+`/g;

const DROP_LINE =
  /Authoritative for staff|Extended company memory|legacy ingests|founders mark|approved sections into|staff AI \(this assistant\)|topics with only|Does the bot know/i;

export function sanitizeStaffText(text: string): string {
  const lines = text.split("\n");
  const kept: string[] = [];

  for (let line of lines) {
    line = line
      .replace(INTERNAL_PATH, "")
      .replace(BACKTICK_PATH, "")
      .replace(/\bCompany Memory\b/g, "approved internal guides")
      .replace(/\bCMO \(Sonakshi Soni\)/g, "Marketing lead (CMO)")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!line) continue;
    if (DROP_LINE.test(line)) continue;
    if (line.length < 8) continue;
    kept.push(line);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Display titles without infrastructure subtitles */
export function staffTopicLabel(title: string): string {
  return title
    .replace(/\s*—\s*WorkDrive.*/i, "")
    .replace(/\s*\(SiyaOS[^)]*\)/i, "")
    .replace(/\s*\(canonical for staff chat\)/i, "")
    .replace(/^Company Memory.*$/i, "Internal policy guides")
    .trim();
}

export function wantsInternalMetaQuery(q: string): boolean {
  return /workdrive|siyaos|where.*(?:sop|policy|doc)|knowledge base|company memory stored|git |internal wiki|how does the bot/i.test(
    q,
  );
}
