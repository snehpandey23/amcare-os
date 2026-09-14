/**
 * Strong-example calibration fixture — Janet spoken chat-sim (MA competency sitting).
 *
 * Source: real unedited spoken conversation, transcribed and scored without
 * intervention (2026-09 sitting · attempt #1 · Chat simulator spoken · 89/100).
 *
 * Use as a regression anchor for Relevance / Politeness / Grammar — not as a
 * substitute for a multi-speaker STT accuracy study.
 */

import type { SimMessage } from "@/lib/patient-drill/evaluate";

/** Live session scores at capture (mean of Grammar · Politeness · Relevance ≈ 89). */
export const JANET_SPOKEN_SCHEDULING_EXPECTED = {
  label: "Janet · spoken scheduling (strong example)",
  sittingLabel: "2026-09",
  modality: "spoken" as const,
  grammarScore: 100,
  politenessScore: 80,
  relevanceScore: 87,
  /** Composite used by competency chat-sim section (mean of G/P/R). */
  sectionScore: 89,
} as const;

/**
 * Exact alternating turns from the founder paste (patient = Janet, MA = you).
 * Final patient confirm has no MA reply in the scored set.
 */
export const JANET_SPOKEN_SCHEDULING_MESSAGES: SimMessage[] = [
  {
    who: "Janet",
    text: "I need to move Thursday’s visit. Mornings are better. What times do you actually have?",
  },
  {
    who: "you",
    text: "Hello Janet, good morning. Let me check on the schedule of the providers and get back to you on that question. Okay. So yeah, I am checking right now and I can see that Thursday we have a slot at 11 a.m.",
    inputModality: "spoken",
  },
  {
    who: "Janet",
    text: "11 a.m. might work, but I really need to know if there are any earlier times available. Mornings are just so much better for us.",
  },
  {
    who: "you",
    text: "Unfortunately Janet, we do not have any openings sooner than that. But you know what, I'm gonna put you on a cancellation kind of a list where if we get any earlier cancellations, I will just call you right away in the morning or the night before whenever we get them.",
    inputModality: "spoken",
  },
  {
    who: "Janet",
    text: "I appreciate that, but it's really important for us to have an earlier time if possible. Is there any chance you could check for other providers or days? I just want to make sure we get the best timing for my son.",
  },
  {
    who: "you",
    text: "I think we can definitely look at other providers such as you. So you wanted to move your appointment sooner than Thursday. Do you have any preferable days in mind?",
    inputModality: "spoken",
  },
  {
    who: "Janet",
    text: "Yes, if there are any openings earlier in the week, that would be great. I just want to make sure we can get in as soon as possible. What do you have available?",
  },
  {
    who: "you",
    text: "I have an opening on Tuesday at 9:30 am. Would that work?",
    inputModality: "spoken",
  },
  {
    who: "Janet",
    text: "Yes, Tuesday at 9:30 a.m. works much better for us. Can you please go ahead and schedule that?",
  },
  {
    who: "you",
    text: "Yes ma'am, I'm going to go ahead and schedule you guys and make sure you get all the intake forms before your visit as well as the invoice on your email so that you can fill out the forms, clear the invoice and be all set for a hassle-free appointment on Tuesday at 9:30 a.m.",
    inputModality: "spoken",
  },
  {
    who: "Janet",
    text: "Thank you for that! I really appreciate it. Just to confirm, I’ll receive the intake forms and invoice by email before the appointment, right?",
  },
];

/**
 * Politeness 80 analysis (4/5 MA turns pass binary isPoliteMessage).
 *
 * Failing turn (index 3 among MA replies):
 *   “I have an opening on Tuesday at 9:30 am. Would that work?”
 *
 * Verdict: scorer under-credit — not a real courtesy gap.
 * The reply is a clean, professional slot offer. It fails only because it
 * hits none of POLITENESS_PHRASES / ACK_MARKERS / HELP_MARKERS / WARM_GREETING
 * (no “okay/sure/sorry/let me/schedule…” stem). Human read: fully polite.
 *
 * Do not “fix” this fixture by relaxing scorers without an explicit product
 * decision — the regression locks the live scores so changes stay intentional.
 */
export const JANET_SPOKEN_POLITENESS_GAP = {
  maReplyIndex: 3,
  excerpt: "I have an opening on Tuesday at 9:30 am. Would that work?",
  classification: "scorer_under_credit" as const,
  fairRealCourtesyGap: false,
} as const;

/** Relevance soft spot on turn 2 (cancellation-list reply to “any earlier times?”). */
export const JANET_SPOKEN_RELEVANCE_SOFT = {
  maReplyIndex: 1,
  note: "On-topic but weak/incomplete for a scheduling ask that pressed for earlier slots — cancellation waitlist is helpful but not a full slot-shaped answer.",
} as const;
