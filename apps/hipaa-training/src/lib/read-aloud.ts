/**
 * Read-aloud helpers for long-form Learn content (HIPAA modules).
 * Uses browser SpeechSynthesis — same stack as Talk Mode.
 */

/** Strip light markdown emphasis used in module copy (`**bold**`). */
export function stripForReadAloud(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export type ReadAloudUnit = {
  id: string;
  /** Plain text spoken aloud. */
  speak: string;
  /** Optional short label for progress UI. */
  label?: string;
};

export type ReadAloudRate = 0.75 | 1 | 1.25 | 1.5;

export const READ_ALOUD_RATES: ReadAloudRate[] = [0.75, 1, 1.25, 1.5];

/**
 * Prefer paragraph-sized units (natural follow-along). Split very long
 * paragraphs into sentences so highlight stays readable.
 */
export function unitsFromParagraph(idPrefix: string, paragraph: string, label?: string): ReadAloudUnit[] {
  const cleaned = stripForReadAloud(paragraph);
  if (!cleaned) return [];
  if (cleaned.length < 280) {
    return [{ id: idPrefix, speak: cleaned, label }];
  }
  const sentences = splitSentences(cleaned);
  if (sentences.length <= 1) {
    return [{ id: idPrefix, speak: cleaned, label }];
  }
  return sentences.map((s, i) => ({
    id: `${idPrefix}-s${i}`,
    speak: s,
    label: label ? `${label} (${i + 1}/${sentences.length})` : undefined,
  }));
}

/** Lightweight sentence split — good enough for training prose. */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) return [text];
  return parts.map((p) => p.trim()).filter(Boolean);
}

export type ModuleReadAloudSource = {
  title: string;
  summary: string;
  lessonSections?: Array<{ title: string; paragraphs: string[] }>;
  keyConcepts?: string[];
  scenarios?: string[];
};

/** Build ordered speak units for a HIPAA certification module page. */
export function buildModuleReadAloudUnits(mod: ModuleReadAloudSource): ReadAloudUnit[] {
  const units: ReadAloudUnit[] = [];
  units.push({
    id: "title",
    speak: stripForReadAloud(mod.title),
    label: "Title",
  });
  units.push(...unitsFromParagraph("summary", mod.summary, "Summary"));
  (mod.lessonSections || []).forEach((sec, si) => {
    units.push({
      id: `sec-${si}-title`,
      speak: stripForReadAloud(sec.title),
      label: sec.title,
    });
    sec.paragraphs.forEach((p, pi) => {
      units.push(...unitsFromParagraph(`sec-${si}-p${pi}`, p, sec.title));
    });
  });
  if (mod.keyConcepts?.length) {
    units.push({
      id: "concepts-intro",
      speak: "Key concepts.",
      label: "Key concepts",
    });
    mod.keyConcepts.forEach((c, i) => {
      units.push(...unitsFromParagraph(`concept-${i}`, c, "Key concept"));
    });
  }
  if (mod.scenarios?.length) {
    units.push({
      id: "scenarios-intro",
      speak: "Scenarios.",
      label: "Scenarios",
    });
    mod.scenarios.forEach((s, i) => {
      units.push(...unitsFromParagraph(`scenario-${i}`, s, "Scenario"));
    });
  }
  return units.filter((u) => u.speak.length > 0);
}

/** Map a unit id back to a highlight key for the module page DOM. */
export function highlightKeyForUnitId(unitId: string): string | null {
  if (unitId === "summary" || unitId.startsWith("summary-")) return "summary";
  const sec = unitId.match(/^sec-(\d+)-p(\d+)/);
  if (sec) return `sec-${sec[1]}-p${sec[2]}`;
  const concept = unitId.match(/^concept-(\d+)/);
  if (concept) return `concept-${concept[1]}`;
  const scenario = unitId.match(/^scenario-(\d+)/);
  if (scenario) return `scenario-${scenario[1]}`;
  if (unitId.startsWith("sec-") && unitId.endsWith("-title")) {
    const m = unitId.match(/^sec-(\d+)-title/);
    return m ? `sec-${m[1]}-title` : null;
  }
  return null;
}
