/**
 * Systematic phrasing banks for Ask routing expansion.
 * Smokes assert every variant matches the intended detector — not ad-hoc one-offs.
 */

/** Admin/lead · another person's attendance / hours over a date range. */
export const PERSON_ATTENDANCE_PHRASINGS = [
  // verbs × attendance
  "pull up Anmol's attendance for August and September",
  "show me Sonu's attendance for last month",
  "get me Priya's attendance for this week",
  "look up Bhavini's attendance record for September",
  "check Isha's attendance for August",
  "open Anmol's attendance hours for last month",
  "where are Sonu's attendance hours for this month",
  "I want to know Priya's attendance for August and September",
  // hours / working / break framings
  "how many hours did Anmol work last month",
  "how many hours did Sonu work in August",
  "what were Bhavini's hours last month",
  "show me Priya's working time totals for August",
  "get me Anmol's break and working time for last month",
  "fetch Sonu's break time totals for September",
  "pull up break and working totals for Priya last month",
  "how much time did Isha work in August",
  "list Anmol's hours from August to September",
  "show Priya's hours August through September",
  // compact possessives
  "Anmol's attendance for September",
  "Sonu's attendance record for this week",
  "Bhavini's hours for August and September",
  "I need Priya's attendance hours for last month",
] as const;

/** Live presence / who-to-escalate-to-now → Team pulse (same answer path). */
export const TEAM_PULSE_PHRASINGS = [
  // on shift / working
  "who's on shift now",
  "who is on shift right now",
  "who is currently on shift",
  "who's working right now",
  "who is working now",
  "who is currently working",
  "anyone working right now",
  "who's on the clock now",
  "who is on the floor right now",
  // online / here / around / available
  "who's online right now",
  "who is online now",
  "who's here right now",
  "who's around right now",
  "who's available right now",
  "who is available now",
  // on-call
  "who's on call",
  "who is on call right now",
  "who's on-call now",
  // escalate / talk to
  "who do I talk to if I need something now",
  "who do I talk to right now",
  "who should I talk to if I need help now",
  "who can I escalate to right now",
  "who do I escalate to if I need something now",
] as const;

/** Must NOT steal into Team pulse (calendar / duty roster). */
export const TEAM_PULSE_NEGATIVE_PHRASINGS = [
  "who is on duty tomorrow",
  "who's working tomorrow",
  "show the MA duty roster for September",
  "who is scheduled this week",
] as const;

/** Must NOT steal into person-attendance (self / unrelated). */
export const PERSON_ATTENDANCE_NEGATIVE_PHRASINGS = [
  "what's my attendance",
  "show my attendance hours",
  "how many hours did I work last month",
  "who's on shift now",
  "when do I work this week",
] as const;
