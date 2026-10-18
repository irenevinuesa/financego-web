/* Shared content model. All MVP content is static TypeScript data shipped with the build. */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type TopicId =
  | "accounting"
  | "corporate-finance"
  | "valuation"
  | "ma"
  | "lbo"
  | "markets"
  | "fixed-income"
  | "derivatives"
  | "macro"
  | "credit-risk"
  | "quant"
  | "brain-teasers"
  | "strategy"
  | "capital-markets"
  | "industries"
  | "restructuring";

export type TrackId =
  | "investment-banking"
  | "private-equity"
  | "sales-trading"
  | "hedge-funds"
  | "equity-research"
  | "asset-management"
  | "consulting"
  | "risk-management"
  | "quant-finance"
  | "corporate-finance";

export type SkillId =
  | "accounting"
  | "valuation"
  | "ma"
  | "lbo"
  | "fixed-income"
  | "derivatives"
  | "macro"
  | "quant";

export type CategoryId =
  | "foundations"
  | "corporate-finance"
  | "valuation"
  | "ib-ma"
  | "markets"
  | "macro"
  | "pe-hf"
  | "quant";

export type SceneName = "alps" | "lake" | "summit" | "trail" | "nyc" | "london" | "campus";

export interface LessonRef {
  courseId: string;
  lessonId: string;
}

/* ───────────── Questions (shared by Practice, knowledge checks and assessments) ───────────── */

export type QuestionFormat = "mcq" | "numeric" | "open" | "multistep";
export type QuestionKind = "scenario" | "trap" | "brain-teaser" | "case";

export interface NumericAnswer {
  value: number;
  /** Absolute tolerance in the units the user types. */
  tolerance: number;
  /** Unit shown next to the input, e.g. "%", "$m", "x", "years". */
  unit?: string;
}

export interface QuestionStep {
  prompt: string;
  format: "mcq" | "numeric";
  options?: string[];
  answer?: number;
  numeric?: NumericAnswer;
  explanation: string;
}

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  format: QuestionFormat;
  kinds?: QuestionKind[];
  tracks: TrackId[];
  minutes: number;
  prompt: string;
  /** Data or a situation the question refers to. */
  context?: string;
  options?: string[];
  /** Index of the correct option for MCQs. */
  answer?: number;
  numeric?: NumericAnswer;
  /** Open-ended questions: model answer and the key points used for self-assessment. */
  modelAnswer?: string;
  keyPoints?: string[];
  steps?: QuestionStep[];
  explanation: string;
  formula?: string;
  mistakes?: string[];
  followUp?: string;
  lesson?: LessonRef;
}

/* ───────────── Courses & lessons ───────────── */

export type WidgetId =
  | "pv-explorer"
  | "diversification"
  | "roic-growth"
  | "depreciation-walk"
  | "cash-conversion"
  | "fcf-build"
  | "wacc-ev"
  | "terminal-value"
  | "ev-bridge"
  | "sensitivity-grid"
  | "price-yield"
  | "rate-shock"
  | "yield-curve"
  | "comps-range"
  | "deal-value"
  | "accretion-dilution";

export type CalloutVariant = "insight" | "interview" | "mistake" | "real-world";

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "formula"; tex: string; caption?: string; where?: [string, string][] }
  | {
      type: "example";
      title: string;
      setup?: string;
      steps: { label: string; tex?: string; text?: string }[];
      result: string;
    }
  | { type: "widget"; widget: WidgetId; caption?: string }
  | { type: "callout"; variant: CalloutVariant; title: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string };

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  objectives: string[];
  blocks: Block[];
  /** Mistakes candidates commonly make on this topic in interviews. */
  mistakes: string[];
  check: Question[];
}

export interface CourseMeta {
  id: string;
  title: string;
  category: CategoryId;
  summary: string;
  difficulty: Difficulty;
  minutes: number;
  lessonCount: number;
  scene: SceneName;
  status: "available" | "planned";
  /** Planned courses list their intended outline so learners can see what is coming. */
  plannedOutline?: string[];
}

export interface Course extends CourseMeta {
  status: "available";
  overview: string;
  objectives: string[];
  prerequisites: string[];
  skills: SkillId[];
  lessons: Lesson[];
  assessment: Question[];
}

/* ───────────── Interview simulator ───────────── */

export type Lang = "en" | "es";
export type Bilingual = Record<Lang, string>;
export type InterviewFormat = "technical" | "case" | "market" | "pitch" | "behavioral";

export interface InterviewConcept {
  id: string;
  label: Bilingual;
  /** Lower-case, accent-free regular-expression sources; any match counts as covering the concept. */
  patterns: string[];
  /** A key concept must be present for the answer to count as strong. */
  key?: boolean;
}

export interface InterviewItem {
  id: string;
  format: InterviewFormat;
  topics: TopicId[];
  tracks: TrackId[] | "all";
  difficulty: Difficulty;
  prompt: Bilingual;
  numeric?: { value: number; tolerance: number; unit: string };
  concepts: InterviewConcept[];
  /** Concepts needed for the answer to count as strong. */
  minConcepts: number;
  followUp: {
    /** Asked when the first answer is strong: pushes for depth. */
    deeper: Bilingual;
    /** Asked when the first answer is incomplete: probes the gap. */
    probe: Bilingual;
    concepts: InterviewConcept[];
    minConcepts: number;
    numeric?: { value: number; tolerance: number; unit: string };
  };
  modelAnswer: Bilingual;
  followUpModelAnswer: Bilingual;
  lesson?: LessonRef;
}
