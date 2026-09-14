/**
 * Stable, gender-correct TTS voice mapping for chat-sim personas.
 *
 * Rules:
 * - Same personaId → same voiceURI for the session (and across sessions on that browser).
 * - Female personas NEVER resolve to a male-tagged voice (and vice versa).
 * - Does NOT use the staff Talk Mode voice.
 * - Personas speak English in chat-sim → only English (en-*) voices.
 *   Never Spanish/Hindi language packs (those are not accented English).
 */

import { listTtsVoices, type TtsVoiceOption } from "@/lib/text-to-speech";

export type PersonaVoiceGender = "female" | "male" | "neutral";

export type PersonaVoiceProfile = {
  displayName: string;
  gender: PersonaVoiceGender;
  ageBand: "young" | "adult" | "senior";
  /** Ordered name substrings — only applied inside the gender-safe English pool. */
  preferNameSubstrings: string[];
  /**
   * Optional note for reviewers — e.g. accent intent deferred until a real
   * accented-English TTS option is bake-off approved.
   */
  accentNote?: string;
};

/** Fixed profile per catalog persona — gender is authoritative for voice choice. */
export const PERSONA_TTS_PROFILES: Record<string, PersonaVoiceProfile> = {
  "persona-emma": {
    displayName: "Emma",
    gender: "female",
    ageBand: "young",
    preferNameSubstrings: ["Samantha", "Karen", "Moira", "Tessa", "Fiona", "Zira", "Female"],
  },
  "persona-michael": {
    displayName: "Michael",
    gender: "male",
    ageBand: "adult",
    preferNameSubstrings: ["Daniel", "Alex", "Fred", "David", "Mark", "Male"],
  },
  "persona-priya": {
    displayName: "Dr. Priya",
    gender: "female",
    ageBand: "adult",
    // English-only pool: do not prefer Lekha/Veena Hindi-locale voices for English lines.
    preferNameSubstrings: ["Moira", "Samantha", "Karen", "Zira", "Female"],
    accentNote: "Indian-accented English deferred — uses neutral English until bake-off.",
  },
  "persona-janet": {
    displayName: "Janet",
    gender: "female",
    ageBand: "senior",
    preferNameSubstrings: ["Kathy", "Victoria", "Susan", "Karen", "Samantha", "Zira", "Female"],
  },
  "persona-carlos": {
    displayName: "Carlos",
    gender: "male",
    ageBand: "adult",
    // Do NOT prefer Jorge/Juan/Diego — those match es_MX Spanish-language voices.
    // Mexican-accented English is not in the browser set; use neutral English male until bake-off.
    preferNameSubstrings: ["Daniel", "Alex", "Fred", "David", "Mark", "Male"],
    accentNote:
      "Mexican-accented English unavailable in browser TTS. Uses neutral English male (not es_MX Spanish).",
  },
  "persona-aisha": {
    displayName: "Aisha",
    gender: "female",
    ageBand: "adult",
    preferNameSubstrings: ["Tessa", "Moira", "Samantha", "Karen", "Zira", "Female"],
  },
  "persona-robert": {
    displayName: "Robert",
    gender: "male",
    ageBand: "senior",
    preferNameSubstrings: ["Bruce", "Ralph", "Albert", "Daniel", "David", "Male"],
  },
  "persona-sam": {
    displayName: "Sam",
    gender: "neutral",
    ageBand: "young",
    preferNameSubstrings: ["Sam", "Jordan", "Taylor", "Alex", "Samantha"],
  },
};

/** Names/labels that clearly present as female. */
export const FEMALE_VOICE_HINT =
  /female|woman|\bzira\b|\bsamantha\b|\bkaren\b|\bmoira\b|\btessa\b|\bveena\b|\braveena\b|\blekha\b|\bkathy\b|\bvictoria\b|\bsusan\b|\bfiona\b|\bserena\b|\ballison\b|\bava\b|\bjenny\b|\bsalli\b|\bkimberly\b|\bivy\b|\bjoanna\b|\bkendra\b|\bamy\b|\bnicky\b|\bheather\b|\blinda\b/i;

/** Names/labels that clearly present as male — includes Neel (must never map to Priya/Janet/etc.). */
export const MALE_VOICE_HINT =
  /male|\bman\b|\balex\b|\bdaniel\b|\bfred\b|\bdavid\b|\bmark\b|\bbruce\b|\bralph\b|\balbert\b|\bjorge\b|\bjuan\b|\bdiego\b|\btom\b|\baaron\b|\bmatthew\b|\bjustin\b|\bjoey\b|\bbrian\b|\bguy\b|\beric\b|\bravi\b|\bneel\b|\bnathan\b|\bjames\b/i;

export function isEnglishTtsLocale(lang: string): boolean {
  return /^en([-_]|$)/i.test((lang || "").trim());
}

function hashPersonaId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function classifyVoiceGender(voice: TtsVoiceOption): PersonaVoiceGender {
  const n = `${voice.name} ${voice.label}`;
  const female = FEMALE_VOICE_HINT.test(n);
  const male = MALE_VOICE_HINT.test(n);
  if (female && !male) return "female";
  if (male && !female) return "male";
  if (female && male) {
    // e.g. odd compound labels — prefer the more specific trailing token
    if (/\bfemale\b/i.test(n) && !/\bmale\b/i.test(n.replace(/female/gi, ""))) return "female";
    if (/\bmale\b/i.test(n) && !/\bfemale\b/i.test(n)) return "male";
  }
  return "neutral";
}

function preferScore(voice: TtsVoiceOption, prefers: string[]): number {
  const n = `${voice.name} ${voice.label}`.toLowerCase();
  for (let i = 0; i < prefers.length; i++) {
    if (n.includes(prefers[i]!.toLowerCase())) return 100 - i;
  }
  return 0;
}

export function personaVoiceProfile(personaId: string): PersonaVoiceProfile {
  if (PERSONA_TTS_PROFILES[personaId]) return PERSONA_TTS_PROFILES[personaId]!;
  const g: PersonaVoiceGender = hashPersonaId(personaId) % 2 === 0 ? "female" : "male";
  return {
    displayName: personaId,
    gender: g,
    ageBand: "adult",
    preferNameSubstrings: g === "female" ? ["Samantha", "Zira", "Female"] : ["Daniel", "David", "Male"],
  };
}

/** Gender-safe English pool — chat-sim lines are English; never pick Spanish/Hindi language packs. */
export function genderSafeVoicePool(
  personaId: string,
  voices: TtsVoiceOption[],
): TtsVoiceOption[] {
  const profile = personaVoiceProfile(personaId);
  const english = voices.filter((v) => isEnglishTtsLocale(v.lang));
  const pool = english.length ? english : voices;

  if (profile.gender === "neutral") return pool;

  const matching = pool.filter((v) => classifyVoiceGender(v) === profile.gender);
  if (matching.length) return matching;

  // No clearly gendered voices — use ambiguous/neutral only (never opposite gender).
  const ambiguous = pool.filter((v) => classifyVoiceGender(v) === "neutral");
  return ambiguous.length
    ? ambiguous
    : pool.filter((v) => classifyVoiceGender(v) !== (profile.gender === "female" ? "male" : "female"));
}

/**
 * Resolve a stable voiceURI for this persona.
 * Hard rule: female personas cannot get male-tagged voices (and vice versa).
 */
export function resolvePersonaTtsVoiceURI(
  personaId: string,
  voices: TtsVoiceOption[] = listTtsVoices(),
): string | null {
  if (!voices.length) return null;
  const profile = personaVoiceProfile(personaId);
  const safe = genderSafeVoicePool(personaId, voices);
  if (!safe.length) return null;

  const ranked = [...safe].sort((a, b) => {
    const sa = preferScore(a, profile.preferNameSubstrings) * 10 + (a.localService ? 1 : 0);
    const sb = preferScore(b, profile.preferNameSubstrings) * 10 + (b.localService ? 1 : 0);
    if (sb !== sa) return sb - sa;
    return a.voiceURI.localeCompare(b.voiceURI);
  });

  const preferred = ranked.find((v) => preferScore(v, profile.preferNameSubstrings) > 0);
  const chosen = preferred ?? ranked[hashPersonaId(personaId) % ranked.length]!;

  // Final safety net — never return opposite gender even if ranking glitched.
  if (profile.gender === "female" || profile.gender === "male") {
    const g = classifyVoiceGender(chosen);
    if (g !== "neutral" && g !== profile.gender) {
      const fallback = ranked.find(
        (v) => classifyVoiceGender(v) === profile.gender || classifyVoiceGender(v) === "neutral",
      );
      return fallback?.voiceURI ?? null;
    }
  }
  return chosen.voiceURI;
}

/** Debug / verify helper — what gender did we actually pick? */
export function resolvePersonaTtsVoice(
  personaId: string,
  voices: TtsVoiceOption[] = listTtsVoices(),
): {
  voiceURI: string | null;
  voiceName: string | null;
  voiceLang: string | null;
  classifiedGender: PersonaVoiceGender | null;
  profileGender: PersonaVoiceGender;
  accentNote?: string;
} {
  const profile = personaVoiceProfile(personaId);
  const uri = resolvePersonaTtsVoiceURI(personaId, voices);
  const voice = uri ? voices.find((v) => v.voiceURI === uri) : undefined;
  return {
    voiceURI: uri,
    voiceName: voice?.name ?? null,
    voiceLang: voice?.lang ?? null,
    classifiedGender: voice ? classifyVoiceGender(voice) : null,
    profileGender: profile.gender,
    accentNote: profile.accentNote,
  };
}

export function personaTtsPitch(personaId: string): number {
  const band = personaVoiceProfile(personaId).ageBand;
  const gender = personaVoiceProfile(personaId).gender;
  // Extra pitch separation when OS only exposes ambiguous voices.
  const genderNudge = gender === "female" ? 0.06 : gender === "male" ? -0.04 : 0;
  if (band === "young") return 1.08 + genderNudge;
  if (band === "senior") return 0.92 + genderNudge;
  return 1 + genderNudge;
}

export function personaTtsRate(personaId: string): number {
  const band = personaVoiceProfile(personaId).ageBand;
  if (band === "young") return 1.05;
  if (band === "senior") return 0.95;
  return 1;
}

/** True if this assignment would be a name/voice gender mismatch (bug). */
export function isPersonaVoiceGenderMismatch(
  personaId: string,
  voices: TtsVoiceOption[],
): boolean {
  const profile = personaVoiceProfile(personaId);
  if (profile.gender === "neutral") return false;
  const resolved = resolvePersonaTtsVoice(personaId, voices);
  if (!resolved.classifiedGender || resolved.classifiedGender === "neutral") return false;
  return resolved.classifiedGender !== profile.gender;
}
