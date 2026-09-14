/**
 * Plain-language sitting hub entry copy — shared by cards + start modal.
 * Keep scannable; avoid scoring jargon on the hub face.
 */
import type { ExamSectionId } from "./types";
import { COMPETENCY_EXAM_TIMERS } from "./exam-timer";
import { SECTION_LABEL } from "./weights";

export type SittingSectionEntryCopy = {
  id: ExamSectionId;
  name: string;
  /** Short estimate shown on the card (e.g. "About 2 minutes"). */
  estimatedTime: string;
  /** 2–3 plain lines for the hub card. */
  summaryLines: [string, string, string];
  /** Modal: what is about to happen. */
  aboutToHappen: string;
  /** Modal rules — one point per line, breathing room in UI. */
  rules: string[];
};

function minutesLabel(sec: number): string {
  const m = Math.round(sec / 60);
  if (m <= 1) return "About 2 minutes";
  return `About ${m} minutes`;
}

export const SITTING_SECTION_ENTRY: Record<ExamSectionId, SittingSectionEntryCopy> = {
  typing: {
    id: "typing",
    name: SECTION_LABEL.typing,
    estimatedTime: minutesLabel(COMPETENCY_EXAM_TIMERS.typing),
    summaryLines: [
      "Type one short workplace passage from the screen.",
      "Accuracy and steady pace both matter.",
      "The clock starts when you type your first character.",
    ],
    aboutToHappen:
      "You’ll get one passage to type. When you confirm below, the section arms — the timer starts on your first keystroke.",
    rules: [
      "One passage only for this attempt.",
      "Timer is about 2 minutes and starts on your first keystroke.",
      "Type yourself — no paste from another window.",
      "Submit when you’re done, or when time runs out.",
    ],
  },
  mcq: {
    id: "mcq",
    name: SECTION_LABEL.mcq,
    estimatedTime: minutesLabel(COMPETENCY_EXAM_TIMERS.mcq),
    summaryLines: [
      "Answer multiple-choice questions on privacy, clinical basics, and US culture.",
      "Work steadily through the set — unanswered counts as incorrect.",
      "The clock starts when you begin the section.",
    ],
    aboutToHappen:
      "You’ll answer a fixed set of multiple-choice questions. When you confirm below, the 20-minute timer starts.",
    rules: [
      "About 40 questions in one timed block.",
      "20-minute timer starts when you begin — it does not pause.",
      "You can change an answer before you submit the section.",
      "Anything left blank is scored as incorrect.",
    ],
  },
  listening: {
    id: "listening",
    name: SECTION_LABEL.listening,
    estimatedTime: minutesLabel(COMPETENCY_EXAM_TIMERS.listening),
    summaryLines: [
      "Listen to one patient voicemail (you may replay it).",
      "Write one clear message to the provider with a concrete ask.",
      "About 10 minutes for your written response.",
    ],
    aboutToHappen:
      "You’ll hear one voicemail, then write a provider message. When you confirm below, the listening section begins.",
    rules: [
      "One fixed voicemail recording — headphones help.",
      "Replay is allowed; write the provider message yourself.",
      "Include a clear ask (as if you already tried calling the patient back).",
      "About 10 minutes on the clock for your written response.",
      "Use placeholder names only (e.g. James Doe) — no real patient details.",
    ],
  },
  "chat-sim-typed": {
    id: "chat-sim-typed",
    name: SECTION_LABEL["chat-sim-typed"],
    estimatedTime: minutesLabel(COMPETENCY_EXAM_TIMERS.chat),
    summaryLines: [
      "Role-play a patient conversation by typing your replies.",
      "Stay professional, clear, and on-topic.",
      "Up to six replies under a shared wall-clock timer.",
    ],
    aboutToHappen:
      "You’ll chat with a simulated patient by typing. When you confirm below, the timed chat section starts.",
    rules: [
      "Type your replies — this is the typed lane, not spoken.",
      "Up to 6 replies in this attempt.",
      "A wall-clock timer covers the whole chat (about 10 minutes).",
      "Be accurate and polite; don’t invent clinical decisions you shouldn’t make.",
    ],
  },
  "chat-sim-spoken": {
    id: "chat-sim-spoken",
    name: SECTION_LABEL["chat-sim-spoken"],
    estimatedTime: minutesLabel(COMPETENCY_EXAM_TIMERS.chat),
    summaryLines: [
      "Same patient role-play, but you speak your replies aloud.",
      "A working microphone is required.",
      "Up to six replies under a shared wall-clock timer.",
    ],
    aboutToHappen:
      "You’ll speak replies to a simulated patient. When you confirm below, the timed spoken chat starts — allow microphone access if asked.",
    rules: [
      "Speak your replies — microphone permission is required.",
      "Up to 6 spoken turns in this attempt.",
      "A wall-clock timer covers the whole chat (about 10 minutes).",
      "Find a quiet spot; speak clearly in English for the exam lane.",
    ],
  },
};

export const SITTING_NO_PAUSE_LINE =
  "Once you start, you cannot go back or pause this section.";

export function sittingSectionEntry(id: ExamSectionId): SittingSectionEntryCopy {
  return SITTING_SECTION_ENTRY[id];
}
