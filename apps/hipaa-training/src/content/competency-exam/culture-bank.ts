/**
 * Culture / language exam bank.
 * Live draw stays disabled until at least 25 items are status "approved" after Sonu review.
 * The daily trivia pool is not an exam bank and is not imported here.
 */
export type CultureExamItem = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  status: "draft_pending_sonu" | "approved";
};

/** Empty on purpose — do not fill from daily trivia. */
export const CULTURE_EXAM_APPROVED: CultureExamItem[] = [];

export const CULTURE_SECTION_HELD_REASON =
  "Culture / language is held. The daily trivia pool is not an exam bank. This section stays off until about 25–40 MCQs are authored and Sonu marks them approved.";
