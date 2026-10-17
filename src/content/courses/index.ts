import type { CategoryId, Course, CourseMeta, Lesson } from "../types";
import { accountingFundamentals } from "./accounting";
import { PLANNED_COURSES } from "./catalog";
import { dcfCourse } from "./dcf";
import { finance101 } from "./finance-101";
import { fixedIncome } from "./fixed-income";
import { maFundamentals } from "./ma-fundamentals";
import { tradingComps } from "./trading-comps";

/** Courses with complete lessons, in recommended order. */
export const COURSES: Course[] = [finance101, accountingFundamentals, dcfCourse, tradingComps, maFundamentals, fixedIncome];

export const ALL_COURSES: CourseMeta[] = [...COURSES, ...PLANNED_COURSES];

/** Homepage "Featured courses", in display order. */
export const FEATURED_COURSE_IDS = ["finance-101", "accounting-fundamentals", "dcf", "financial-markets", "ma-private-equity"];

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getCourseMeta(id: string): CourseMeta | undefined {
  return ALL_COURSES.find((c) => c.id === id);
}

export function getLesson(courseId: string, lessonId: string): { course: Course; lesson: Lesson; index: number } | undefined {
  const course = getCourse(courseId);
  if (!course) return undefined;
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return undefined;
  return { course, lesson: course.lessons[index], index };
}

export function coursesInCategory(category: CategoryId): CourseMeta[] {
  return ALL_COURSES.filter((c) => c.category === category);
}

/** What to study after finishing a course. */
export const NEXT_COURSE: Record<string, string> = {
  "finance-101": "accounting-fundamentals",
  "accounting-fundamentals": "dcf",
  dcf: "trading-comps",
  "trading-comps": "ma-fundamentals",
  "ma-fundamentals": "fixed-income-course",
};

export function lessonHref(courseId: string, lessonId: string) {
  return `/learn/${courseId}/${lessonId}/`;
}
