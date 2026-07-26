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

/** Employee-facing labels (routing stays stable in logs). */
const DEPARTMENT_DISPLAY: Record<Department, string> = {
  Accounts: "Accounts & expenses",
  HR: "People & HR",
  Marketing: "Marketing & content",
  "Clinical Operations": "Care operations",
  Compliance: "Compliance & privacy",
  Technology: "Tools & IT",
  Leadership: "Leadership",
  General: "General",
};

export function displayDepartment(department: Department): string {
  return DEPARTMENT_DISPLAY[department] ?? department;
}

export type Confidence = "high" | "medium" | "low";

export interface RouteResult {
  department: Department;
  task: string;
  confidence: Confidence;
  followUpQuestions: string[];
  flowId?: string;
}
