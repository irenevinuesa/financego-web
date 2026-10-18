import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, Calculator, CircleCheck, MessagesSquare, Target, Trophy, UsersRound } from "lucide-react";
import { ALL_COURSES, FEATURED_COURSE_IDS } from "@/content/courses";
import { Cover, HandArrow } from "@/components/art/Cover";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/primitives";
import { CourseCard } from "@/components/learn/CourseCard";
import { ProgressPreview, QuestionOfTheDay } from "@/components/home/HomeClient";
import { WaccEv } from "@/components/learn/widgets/valuation";
import { CHALLENGE_TARGET, STAGES, STAGE_SIZE } from "@/lib/challenge";

const PATHS = [
  { href: "/technicals/", title: "Technicals", text: "Theory courses, practice by section, the 500 Challenge and a technical mock interview.", icon: Target, cta: "Master the technicals" },
  { href: "/behaviourals/", title: "Behaviourals", text: "The STAR method, a library of fit questions, your own story bank and a behavioural mock interview.", icon: UsersRound, cta: "Prepare your stories" },
  { href: "/tools/", title: "Tools", text: "Working WACC, DCF, bond and compounding tools that calculate real results from your assumptions.", icon: Calculator, cta: "Open the toolkit" },
  { href: "/career/", title: "Career", text: "In-depth guides to ten finance careers: the day-to-day, teams, skills, recruiting and exits.", icon: Briefcase, cta: "Explore careers" },
];

export default function HomePage() {
  const featured = FEATURED_COURSE_IDS.map((id) => ALL_COURSES.find((c) => c.id === id)!).filter(Boolean);

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow mb-5">Learn Finance · Think Bigger · Go Further</p>
            <h1 className="font-serif text-[2.9rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              Your future in finance starts here.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              Learn the fundamentals. Master the technicals. Practice with real cases. Build your financial future.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/learn/" size="lg">
                Start Learning <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#explore" variant="secondary" size="lg">
                Explore FinanceGo
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
              <div>
                <dt className="text-ink-muted">Sections</dt>
                <dd className="mt-0.5 font-semibold text-navy">Learn to Career</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Price</dt>
                <dd className="mt-0.5 font-semibold text-navy">Free MVP</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Sign-up</dt>
                <dd className="mt-0.5 font-semibold text-navy">Not required</dd>
              </div>
            </dl>
          </div>

          {/* Product preview: a contour panel in the logo's blue with three real parts of FinanceGo. */}
          <div className="relative mx-auto w-full max-w-xl pb-14 lg:max-w-none">
            <Cover name="alps" className="rounded-[2rem] shadow-lift" title="FinanceGo product preview">
              <span className="absolute -bottom-4 right-5 select-none font-serif text-[7rem] leading-none text-cream/10 sm:text-[9rem]">FG</span>

              {/* Cards flow in a column with staggered alignment, so they never overlap at any width. */}
              <div className="flex flex-col gap-4 p-5 sm:p-8">
                <div className="w-[92%] self-start rounded-2xl bg-white p-4 shadow-lift sm:w-[72%]">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <MessagesSquare className="h-3.5 w-3.5" /> Interview Simulator
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-navy">What happens to a DCF valuation if the WACC increases?</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success-ink">
                    <CircleCheck className="h-3.5 w-3.5 shrink-0" /> It falls. Now, why does terminal value fall the most?
                  </p>
                </div>

                <div className="hidden w-[46%] self-end rounded-2xl bg-white p-4 shadow-lift sm:block">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <Calculator className="h-3.5 w-3.5" /> WACC Calculator
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-navy">8.77%</p>
                  <dl className="mt-1.5 space-y-0.5 text-xs text-ink-muted">
                    <div className="flex justify-between gap-2">
                      <dt>Cost of equity</dt>
                      <dd className="figure text-ink">10.60%</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>After-tax debt</dt>
                      <dd className="figure text-ink">4.50%</dd>
                    </div>
                  </dl>
                </div>

                <div className="w-[92%] self-start rounded-2xl bg-white p-4 shadow-lift sm:ml-6 sm:w-[58%]">
                  <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-electric">
                    <BookOpen className="h-3.5 w-3.5" /> Course
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy">Valuation Essentials: DCF</p>
                  <p className="mt-0.5 text-xs text-ink-muted">6 lessons · interactive models · final assessment</p>
                  <div className="mt-2.5 flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="h-1.5 flex-1 rounded-full bg-ice-soft" />
                    ))}
                  </div>
                </div>
              </div>
            </Cover>
            <div className="absolute bottom-0 right-2 flex items-end gap-1 text-navy sm:right-8">
              <HandArrow className="mb-5 h-9 w-14 -scale-x-100 rotate-[200deg] text-electric" />
              <p className="font-hand text-2xl leading-none sm:text-[1.7rem]">Small steps. Big opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Choose your path ───────────── */}
      <section id="explore" className="container-page pt-16 sm:pt-20">
        <SectionHeading eyebrow="Choose your path" title="Four ways to move forward" description="Every concept you learn connects to an exercise, a model or an interview question. Start wherever you are." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.href} href={p.href} className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-electric/50 hover:shadow-lift">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-electric">
                  {p.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────── 500 Challenge band ───────────── */}
      <section className="mt-20 bg-navy py-16 text-white sm:mt-28 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ice">
              <Trophy className="h-4 w-4" /> The 500 Challenge
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl">{CHALLENGE_TARGET} questions. One at a time.</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ice-soft/85">
              A single mixed path for recruiting season. Answer a question to unlock the next, right or wrong. Missed questions go to a list you can repeat until you get them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/challenge/" size="lg" variant="secondary" className="border-white/0">
                Start the challenge <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {STAGES.map((st, i) => (
              <li key={st.title} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs text-ice">Stage {i + 1}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-white">{st.title}</p>
                <p className="mt-1 text-xs text-ice-soft/70">
                  Q{i * STAGE_SIZE + 1}–{(i + 1) * STAGE_SIZE}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── Featured courses ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading
          eyebrow="Featured courses"
          title="Start with the essentials"
          description="Six complete courses are available today; the rest of the library is in development and clearly marked."
          action={
            <ButtonLink href="/learn/" variant="secondary">
              All courses <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {featured.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* ───────────── Question of the day + interview challenge ───────────── */}
      <section className="container-page grid gap-10 pt-20 sm:pt-28 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading eyebrow="Question of the day" title="Think it through" description="One question a day that rewards reasoning over memorisation. Your answer is saved to your dashboard." />
          <div className="mt-8">
            <QuestionOfTheDay />
          </div>
        </div>
        <div className="flex flex-col">
          <SectionHeading eyebrow="Interview challenge" title="Could you answer this live?" />
          <div className="mt-8 flex flex-1 flex-col rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-8">
            <div className="space-y-4">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm leading-relaxed">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice">Interviewer</p>
                What happens to a DCF valuation if the WACC increases?
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-electric px-4 py-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice-soft">You</p>
                The valuation decreases.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm leading-relaxed">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ice">Interviewer</p>
                Correct. Why might a 100-basis-point increase in WACC produce a disproportionately large decline in terminal value?
              </div>
            </div>
            <p className="mt-6 text-sm text-ice-soft/80">
              The simulator follows up on your answers, digs deeper when you are right and probes when you are not, then gives structured feedback.
            </p>
            <div className="mt-auto pt-6">
              <ButtonLink href="/technicals/interview/" variant="secondary" className="border-white/0">
                Open the Interview Simulator <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Featured tool ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading
          eyebrow="Featured tool"
          title="See how rates, risk and leverage move value"
          description="Move the sliders: this is the same maths that sits inside every DCF. Higher rates or beta raise WACC; moderate leverage lowers it."
          action={
            <ButtonLink href="/tools/wacc/" variant="secondary">
              Full WACC Calculator <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="mt-8">
          <WaccEv compact />
        </div>
      </section>

      {/* ───────────── Personal progress ───────────── */}
      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading eyebrow="Your journey" title="Pick up where you left off" />
        <div className="mt-8">
          <ProgressPreview />
        </div>
      </section>
    </>
  );
}
