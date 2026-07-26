/** v1 help-desk routing taxonomy — keep to 8; do not nest 74 categories. */
export const DEPARTMENTS = [
  "Accounts",
  "HR",
  "Marketing",
  "Clinical Operations",
  "Compliance",
  "Technology",
  "Leadership",
  "General",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export type Confidence = "high" | "medium" | "low";

export interface RouteResult {
  department: Department;
  task: string;
  confidence: Confidence;
  followUpQuestions: string[];
  flowId?: string;
}
