/**
 * Chat Simulator session bounds.
 * Wall-clock cutoff removed — reply count is the sole hard boundary.
 */

/** Max MA (trainee) replies per session. Full weak T1→T2-C ladder needs 4. */
export const MAX_MA_TURNS = 12;

/** After this many completed exchanges (your reply + patient reply), offer conclude + feedback. */
export const CONCLUDE_OFFER_AFTER_TURNS = 3;

/** MA turns needed for a consistently-weak climb to frustrated exit. */
export const WEAK_LADDER_MA_TURNS_TO_EXIT = 4;
