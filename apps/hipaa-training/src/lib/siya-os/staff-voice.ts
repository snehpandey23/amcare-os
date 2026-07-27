/**
 * Staff-facing copy — no engineering / WorkDrive / git vocabulary in chat output.
 */

const INTERNAL_PATH =
  /(?:Common Folder\/SiyaOS|WorkDrive|Zoho WorkDrive|docs\/siyaos-knowledge-base|apps\/siya-health|apps\/siya-assistant|bot_retrieve|SiyaOS|npm run kb:build|git KB|WorkDrive `[^`]+`)/gi;

const BACKTICK_PATH = /`[^`]*(?:\/|\\)[^`]*`/g;

export function sanitizeStaffText(text: string): string {
  let out = text
    .replace(INTERNAL_PATH, "")
    .replace(BACKTICK_PATH, "")
    .replace(/\bCompany Memory\b/g, "our approved internal guides")
    .replace(/\bCMO \(Sonakshi Soni\)/g, "Marketing lead (CMO)")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  out = out.replace(/Does the bot know[^?]*\?\s*/gi, "");
  out = out.replace(/Summaries may exist in WorkDrive[^.]*\.\s*/gi, "");
  out = out.replace(/Not promoted to git[^.]*\.\s*/gi, "");

  return out;
}

/** Display titles without “(SiyaOS vs git KB)” style noise */
export function staffTopicLabel(title: string): string {
  return title
    .replace(/\s*—\s*WorkDrive.*/i, "")
    .replace(/\s*\(SiyaOS[^)]*\)/i, "")
    .replace(/\s*\(canonical for staff chat\)/i, "")
    .trim();
}

export function wantsInternalMetaQuery(q: string): boolean {
  return /workdrive|siyaos|where.*(?:sop|policy|doc)|knowledge base|company memory stored|git |internal wiki/i.test(q);
}
