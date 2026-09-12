/**
 * Phase 0 Hinglish — Romanized glossary + small phrase aliases → English intent surface.
 * No cloud STT. No Devanagari MT. Cap aliases; prefer normalize over catalog duplication.
 *
 * Also covers common Web Speech scrambles (e.g. "today my what Kam is").
 */

/** Fold STT spelling variants before alias / glossary. */
function foldSttSpellings(text: string): string {
  return text.replace(/\bkam\b/gi, "kaam").replace(/\bkyaa\b/gi, "kya");
}

/** Word/token glossary (Romanized Hindi → English intent lexicon). */
const GLOSSARY: Array<[RegExp, string]> = [
  [/\baaj\b/gi, "today"],
  [/\bkal\b/gi, "tomorrow"],
  [/\bparso\b/gi, "day after tomorrow"],
  [/\bmera\b/gi, "my"],
  [/\bmere\b/gi, "my"],
  [/\bmeri\b/gi, "my"],
  [/\bhamaara\b/gi, "our"],
  [/\bhamara\b/gi, "our"],
  [/\bkya\b/gi, "what"],
  [/\bkaun\b/gi, "who"],
  [/\bkais[ea]\b/gi, "how"],
  [/\bkaamkaaj\b/gi, "tasks"],
  [/\bkaam\b/gi, "tasks"],
  [/\bdikha(?:o|ana)?\b/gi, "show"],
  [/\bbata(?:o|ana)?\b/gi, "tell"],
  [/\bbataao\b/gi, "tell"],
  [/\bshuru\b/gi, "start"],
  [/\bshuruu\b/gi, "start"],
  [/\bkhatam\b/gi, "done"],
  [/\bcomplete\s+kar\s+do\b/gi, "mark done"],
  [/\bkar\s+do\b/gi, "do"],
  [/\bkaro\b/gi, "do"],
  [/\bhai\b/gi, "is"],
  [/\bhain\b/gi, "are"],
  [/\bho\s+gaya\b/gi, "done"],
  [/\bho\s+gyi\b/gi, "done"],
];

type Alias =
  | { match: RegExp; english: string; whole?: false }
  /** Replace the entire utterance when match hits (STT scrambles / long Hinglish). */
  | { match: RegExp; english: string; whole: true };

/**
 * Full-phrase aliases (match after STT fold). Keep small — dual-surface smoke these.
 * Order: STT-scrambled / whole-utterance task intents first.
 */
const PHRASE_ALIASES: Alias[] = [
  // Web Speech scramble of "aaj mera kya kaam hai"
  {
    whole: true,
    match: /\b(today|aaj)\b[\s\S]{0,48}\b(my|mera|mere)\b[\s\S]{0,24}\b(what|kya)\b[\s\S]{0,24}\b(kaam|tasks?)\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(my|mera|mere)\b[\s\S]{0,24}\b(what|kya)\b[\s\S]{0,24}\b(kaam|tasks?)\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(what|kya)\b[\s\S]{0,24}\b(kaam|tasks?)\b[\s\S]{0,16}\b(is|hai|are|hain)\b/i,
    english: "what are my tasks today",
  },
  // "my kam jaane ki koshish kar raha hun"
  {
    whole: true,
    match: /\b(my|mera|mere)\s+(kaam|tasks?)\s+jaan(?:e|na)?\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(kaam|tasks?).{0,40}\bjaan(?:e|na).{0,20}koshish\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(my|mera|mere)\s+(kaam|tasks?).{0,48}\bkoshish\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(aaj\s+)?(mera|mere)\s+kya\s+kaam(\s+hai[n]?)?\b/i,
    english: "what are my tasks today",
  },
  {
    whole: true,
    match: /\b(aaj\s+)?(mera|mere)\s+(kya\s+)?(kaam|tasks?)(\s+hai[n]?)?\b/i,
    english: "what are my tasks today",
  },
  { match: /\bmere\s+tasks?\s+(kya\s+hai|dikhao|batao)\b/i, english: "what are my tasks today", whole: true },
  { match: /\b(urgent\s+)?tasks?\s+(mere|for\s+me)\b/i, english: "urgent tasks for me", whole: true },
  { match: /\b(mera\s+)?shift\s+(start|shuru)\s*(karo|kar\s+do)?\b/i, english: "start my shift", whole: true },
  { match: /\bshift\s+start\s+kar(?:o|do)\b/i, english: "start my shift", whole: true },
  { match: /\b(start|shuru)\s+(mera\s+)?shift\b/i, english: "start my shift", whole: true },
  {
    whole: true,
    match: /\b(kisi\s+ne|kisne|anyone)\s+(drill|drills)\s+(try|kiye|kiya)/i,
    english: "has anyone tried any drills",
  },
  {
    whole: true,
    match: /\bdrills?\s+(kisi\s+ne\s+)?(try\s+)?(kiye|kiya|ki)\b/i,
    english: "has anyone tried any drills",
  },
  { match: /\bstaff\s+(log\s+)?(performance|engagement)\b/i, english: "staff performance" },
  // Capture groups — must use String.replace (not whole english literal)
  { match: /\b([A-Za-z][A-Za-z'-]{1,40})\s+ka\s+performance\b/i, english: "$1's performance" },
  { match: /\b([A-Za-z][A-Za-z'-]{1,40})\s+ki\s+performance\b/i, english: "$1's performance" },
  // Feedback — typed or Sarvam codemix. No trailing \\b after Devanagari (\\b is ASCII-only).
  // Not “what feedback have I received”.
  {
    whole: true,
    match:
      /\b(?:main\s+|mein\s+|i\s+)?feedback\s+(?:kaise|kese|कैसे)\s+(?:dete\s+hain|dete\s+hai|doon|dun|du|de|do|dete\s+हैं|देते\s+हैं)(?=$|[\s?.!,।])/i,
    english: "how do I give feedback",
  },
  {
    whole: true,
    match: /\bfeedback\s+कैसे\s+देते\s+हैं(?=$|[\s?.!,।])/i,
    english: "how do I give feedback",
  },
  {
    whole: true,
    match: /(?:^|[\s])फीडबैक\s+(?:kaise|kese|कैसे)\s+(?:dete\s+hain|देते\s+हैं)(?=$|[\s?.!,।])/i,
    english: "how do I give feedback",
  },
  {
    whole: true,
    match:
      /(?:^|[\s])(?:main\s+|mein\s+|मैं\s+)?feedback\s+(?:kaise|kese|कैसे)\s+submit\s+(?:karu|karun|kare|करूं|करूँ|करें)(?=$|[\s?.!,।])/i,
    english: "how do I submit feedback",
  },
  {
    whole: true,
    match:
      /\bfeedback\s+(?:ka|का)\s+(?:page|पेज)\s+(?:kahan|kaha|kahaan|कहाँ|कहा)(?:\s*(?:hai|है))?(?=$|[\s?.!,।])/i,
    english: "where is the feedback page",
  },
  {
    whole: true,
    match:
      /(?:reschedul\w*|cancel\w*).{0,48}(?:fee|charge|charged|lagega|lagegi|lagenge|लगेगा)|(?:fee|charge|charged|lagega|lagenge|लगेगा).{0,48}(?:reschedul\w*|cancel\w*)/i,
    english: "can the patient reschedule and will they be charged again Klarity cancellation fee",
  },
  // Typed Hinglish: booked, can't show, move the slot, will extra charges apply.
  // "schedule kar sakte" + "charges lagenge" — not the English word reschedule.
  {
    whole: true,
    match:
      /appointment[\s\S]{0,220}(?:schedule|reschedul\w*|nahin\s+show|nahi\s+show|can(?:'t|not)\s+show)[\s\S]{0,180}(?:charges?|fees?|lagenge|lagega|lagegi|लगे)/i,
    english: "can the patient reschedule and will they be charged again Klarity cancellation fee",
  },
  // SOP how-to — before glossary turns "kaise"/"hai" into "how"/"is" and drops Devanagari.
  {
    whole: true,
    match:
      /(?:^|[\s])sops?\s+(?:kaise|kese|कैसे)\s+(?:bana(?:na|te|ye|o|ni|unga|ungi)?|banate\s+hain|likh(?:na|o|en|e)?|बन\S*|लिख\S*)(?=$|[\s?.!,।])/i,
    english: "how to write an SOP",
  },
  {
    whole: true,
    match:
      /(?:^|[\s])(?:kaise|kese|कैसे)\s+(?:bana\S*|banate|banaye|likh\S*|बन\S*|लिख\S*)\s+sops?(?=$|[\s?.!,।])/i,
    english: "how to write an SOP",
  },
  { match: /\b(clear\s+chat|chat\s+clear)\s+(kaise|kese)\b/i, english: "how do I use clear chat", whole: true },
  { match: /\bmic\s+(kaise|kese)\s+(use\s+)?(kare|karu|karun)\b/i, english: "how do I use the mic", whole: true },
  { match: /\btalk\s+mode\s+(kaise|kese)\b/i, english: "how do I use Talk Mode", whole: true },
];

function collapseSpaces(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/**
 * Normalize Romanized Hinglish toward English intent text.
 * Idempotent enough for English input (glossary mostly no-ops on English).
 */
export function normalizeHinglishForAsk(text: string): string {
  let t = collapseSpaces(foldSttSpellings(text)).replace(/[?!.,।]+$/g, "").trim();
  if (!t) return t;

  for (const row of PHRASE_ALIASES) {
    if (!row.match.test(t)) continue;
    // RegExp.test with /g advances lastIndex — rebuild without sticky state
    const re = new RegExp(row.match.source, row.match.flags.replace("g", ""));
    if (row.whole) {
      return collapseSpaces(row.english);
    }
    t = t.replace(re, row.english);
    return collapseSpaces(t);
  }

  for (const [re, eng] of GLOSSARY) {
    t = t.replace(re, eng);
  }
  return collapseSpaces(t);
}

/** Exposed for smokes — alias count stays intentionally small. */
export function hinglishAliasCount(): number {
  return PHRASE_ALIASES.length;
}
