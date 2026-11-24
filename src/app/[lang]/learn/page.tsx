import type { Metadata } from "next";
import { ALL_COURSES, COURSES } from "@/content/courses";
import type { CourseMeta } from "@/content/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Catalog } from "@/components/learn/Catalog";
import { CourseCard } from "@/components/learn/CourseCard";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Learn",
  description: "Structured finance courses from fundamentals to advanced, with interactive models in every lesson.",
};

/** Only the card fields go to the client, not full lesson content. */
function meta(c: CourseMeta): CourseMeta {
  const { id, title, category, summary, difficulty, minutes, lessonCount, scene, status, plannedOutline } = c;
  return { id, title, category, summary, difficulty, minutes, lessonCount, scene, status, plannedOutline };
}

export default function LearnPage() {
  const available = ALL_COURSES.filter((c) => c.status === "available").length;
  return (
    <>
      <PageHeader
        eyebrow="Technicals · Learn"
        title="Learn finance by doing it"
        description={
          <p>
            Structured courses that connect every concept to a decision, a model or an interview question. {available} courses are complete today;{" "}
            {ALL_COURSES.length - available} more are in development and clearly marked, with their planned outline.
          </p>
        }
        scene="trail"
        crumbs={[{ href: "/", label: "Home" }, { href: "/technicals/", label: "Technicals" }, { label: "Learn" }]}
      />

      <section className="container-page pt-12">
        <SectionHeading eyebrow="Recommended path" title="Start here" description="Take these in order: each one builds on the last and ends with a final assessment." />
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {COURSES.map((c, i) => (
            <li key={c.id} className="relative">
              <span className="absolute -left-2 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white shadow-card">{i + 1}</span>
              <CourseCard course={meta(c)} className="h-full" />
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page pt-16">
        <SectionHeading eyebrow="Course library" title="All courses" />
        <div className="mt-6">
          <Catalog courses={ALL_COURSES.map(meta)} />
        </div>
      </section>
    </>
  );
}
