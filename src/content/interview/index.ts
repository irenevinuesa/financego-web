import type { InterviewItem } from "../types";
import { BEHAVIOURAL_ITEMS } from "./behavioural-items";
import { INTERVIEW_ITEMS } from "./items";

export type InterviewScope = "technical" | "behavioural";

/** Every scripted interview item: technical, case, market and pitch items plus behavioural ones. */
export const ALL_INTERVIEW_ITEMS: InterviewItem[] = [...INTERVIEW_ITEMS, ...BEHAVIOURAL_ITEMS];

export function itemsForScope(scope: InterviewScope): InterviewItem[] {
  return ALL_INTERVIEW_ITEMS.filter((i) => (scope === "behavioural" ? i.format === "behavioral" : i.format !== "behavioral"));
}
