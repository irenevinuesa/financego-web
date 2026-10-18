import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSES, getCourse } from "@/content/courses";
import { PageHeader } from "@/components/layout/PageHeader";
import { Assessment } from "@/components/learn/Assessment";
import { StudyTimer } from "@/components/learn/LessonClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ courseId: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  return { title: `Final assessment · ${getCourse(courseId)?.title ?? "Course"}` };
}

export default async function AssessmentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  return (
    <>
      <StudyTimer />
      <PageHeader
        eyebrow="Final assessment"
        title={course.title}
        description={<p>{course.assessment.length} questions covering the whole course. Score 70% or more to complete the course. Feedback appears after you submit.</p>}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/technicals/", label: "Technicals" },
          { href: "/learn/", label: "Learn" },
          { href: `/learn/${course.id}/`, label: course.title },
          { label: "Assessment" },
        ]}
      />
      <div className="container-page mt-10 max-w-3xl">
        <Assessment courseId={course.id} questions={course.assessment} />
      </div>
    </>
  );
}
