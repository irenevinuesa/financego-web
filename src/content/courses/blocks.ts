import type { Block, CalloutVariant, Question, TopicId, WidgetId } from "../types";

/* Small builders that keep lesson files readable. */

export const p = (text: string): Block => ({ type: "p", text });
export const h = (text: string): Block => ({ type: "h", text });
export const list = (items: string[], ordered = false): Block => ({ type: "list", items, ordered });
export const formula = (tex: string, caption?: string, where?: [string, string][]): Block => ({ type: "formula", tex, caption, where });
export const widget = (id: WidgetId, caption?: string): Block => ({ type: "widget", widget: id, caption });
export const callout = (variant: CalloutVariant, title: string, text: string): Block => ({ type: "callout", variant, title, text });
export const table = (headers: string[], rows: string[][], caption?: string): Block => ({ type: "table", headers, rows, caption });
export const example = (
  title: string,
  steps: { label: string; tex?: string; text?: string }[],
  result: string,
  setup?: string,
): Block => ({ type: "example", title, steps, result, setup });

/** Knowledge-check / assessment MCQ. */
export function mcq(
  id: string,
  topic: TopicId,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  extra: Partial<Question> = {},
): Question {
  return {
    id,
    topic,
    difficulty: "Beginner",
    format: "mcq",
    tracks: [],
    minutes: 1,
    prompt,
    options,
    answer,
    explanation,
    ...extra,
  };
}

/** Knowledge-check / assessment numeric question. */
export function num(
  id: string,
  topic: TopicId,
  prompt: string,
  value: number,
  tolerance: number,
  unit: string,
  explanation: string,
  extra: Partial<Question> = {},
): Question {
  return {
    id,
    topic,
    difficulty: "Beginner",
    format: "numeric",
    tracks: [],
    minutes: 2,
    prompt,
    numeric: { value, tolerance, unit },
    explanation,
    ...extra,
  };
}
