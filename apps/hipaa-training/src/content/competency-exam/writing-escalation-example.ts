/**
 * Worked Part B example — founder-dictated MA / EHR provider-message voice (2026-09-13).
 * Calibration only: dismissible “see an example,” never textarea ghost-text.
 *
 * Source spirit: experienced MAs already write these notes from voicemail / chat /
 * visit scenarios — history if known, what was done, what was found, patient
 * explanation, then a natural close that keeps the provider in the loop.
 *
 * PHI: John Doe / James Doe placeholders only. Dictation named a real clinician;
 * example uses Dr. James Doe. Never invent real-sounding unique identifiers.
 */
export const WRITING_ESCALATION_WORKED_EXAMPLE = [
  "Dear Dr. James Doe — regarding patient John Doe.",
  "John Doe is a 21-year-old male last seen by you.",
  "He was initially diagnosed under your care with ADHD, has been on his once-daily controlled stimulant as prescribed, and refills have been sent on the usual monthly cycle; last fill was about 18 days ago.",
  "Today I saw him for a pill count visit.",
  "The patient appears well and has no acute complaints or distress.",
  "He was cooperative throughout the encounter, and we were able to empty the pill bottle and put the pills back into the bottle one by one.",
  "We found a discrepancy: 21 tablets remaining on day 18 of a 30-day once-daily supply (expected about 12), so the count is higher than expected.",
  "He explained that he sometimes skips weekend doses when he doesn't need to focus.",
  "Pharmacy is checked and verified; I have not pended a refill pending your review.",
  "I wanted to let you know before your next visit or before you call in the next refill / make a refill decision — just wanted to keep you in the loop.",
  "Please feel free to reach out if you need more information, or if anything else could be done for the patient.",
].join(" ");
