export type QuestionType = "mcq" | "tf" | "scenario";

export type WorkforceRole = "provider" | "nurse" | "admin" | "other";

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  /** e.g. HIPAA Test Q14 */
  sourceRef: string;
  moduleId: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctKey: string;
  explanation: string;
  distractorHints?: Partial<Record<string, string>>;
  /** Optional: only show for these roles; omit = all roles */
  roles?: WorkforceRole[];
}

export interface LessonSection {
  title: string;
  paragraphs: string[];
  /** Internal `/resources/[slug]` pages that link through to official documents */
  readMoreSlugs?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  shortTitle: string;
  order: number;
  summary: string;
  keyConcepts: string[];
  scenarios: string[];
  /** Deeper lesson narrative (headings + paragraphs) aligned to the official test. */
  lessonSections?: LessonSection[];
  /** Short bullets: what the module quiz is checking you understood. */
  quizFocus?: string[];
  outlineRef: string;
  /** Empty = all roles */
  roles?: WorkforceRole[];
}

export interface QuizAttemptRecord {
  questionId: string;
  selectedKey: string;
  correct: boolean;
  primaryTag: string;
  wasReinforcement: boolean;
  at: number;
}

export interface ProgressState {
  version: string;
  courseVersion: string;
  role: WorkforceRole;
  /** Shown on certificate and reports; stored locally only. */
  learnerName?: string;
  startedAt: number;
  updatedAt: number;
  secondsInCourse: number;
  modulesCompleted: string[];
  moduleQuizScores: Record<string, { correct: number; total: number; at: number }>;
  topicStats: Record<string, { correct: number; attempted: number }>;
  finalExam?: {
    correct: number;
    total: number;
    attempts: QuizAttemptRecord[];
    at: number;
    readiness: "ready" | "needs_review";
  };
}
