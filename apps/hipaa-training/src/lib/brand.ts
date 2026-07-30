/** Staff-facing SiyaOS — company operating system (Work · Learn · Grow). */
export const RELEASE = {
  environmentLabel: "Internal Preview",
  version: "0.1-alpha",
  releaseLevel: 1,
} as const;

export const BRAND = {
  appName: "SiyaOS",
  appTagline: "My day · my work · my growth",
  homeSubtitle: "A minute here each day — get clearer, get better at your role.",
  growthLine: "You're building skills, not just checking boxes.",
  legacyAssistantName: "Siya Assistant",
  internalBadge: "Internal · approved answers only",
  entityNote: "Siya Health · Amcare India · all teams welcome",
  privacyFootnote:
    "Internal approved answers only. Keep patient names, DOB, MRN, SSN, and chart details out of this chat.",
  mission:
    "When someone leaves Siya, they should use AI responsibly to keep growing — personally and professionally.",
  chatSafetyLine:
    "Do not enter patient names, DOB, MRN, SSN, contact details, chart screenshots, or other identifying information. Use the approved EHR and secure channels for patient-specific work.",
} as const;
