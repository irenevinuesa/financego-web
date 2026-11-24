import { describe, expect, it } from "vitest";
import { addDays, buildPlan, daysBetween, planToIcs, validatePlanInput, type PlanInput } from "./planner";
import { sanitizeState } from "./store";

const base: PlanInput = {
  startDate: "2026-11-24",
  interviewDate: "2027-01-24",
  track: "investment-banking",
  firm: "",
  daysPerWeek: 5,
  minutesPerDay: 60,
  focus: "both",
  level: "new",
};

describe("planner dates", () => {
  it("adds days and counts between dates across months", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(daysBetween("2026-11-24", "2027-01-24")).toBe(61);
  });

  it("rejects dates that are too close, too far or missing", () => {
    expect(validatePlanInput({ startDate: base.startDate, interviewDate: "" })).not.toBeNull();
    expect(validatePlanInput({ startDate: base.startDate, interviewDate: "2026-11-25" })).not.toBeNull();
    expect(validatePlanInput({ startDate: base.startDate, interviewDate: "2028-01-01" })).not.toBeNull();
    expect(validatePlanInput(base)).toBeNull();
  });
});

describe("buildPlan", () => {
  it("covers the time up to the interview, in phase order, ending on the interview", () => {
    const plan = buildPlan(base);
    const dates = plan.days.map((d) => d.date);
    expect(dates[0]).toBe(base.startDate);
    expect(dates.at(-1)).toBe(base.interviewDate);
    expect(dates.at(-2)).toBe(addDays(base.interviewDate, -1));
    expect([...dates].sort()).toEqual(dates);
    const order = ["foundations", "practice", "final", "eve", "interview"];
    const phases = plan.days.map((d) => order.indexOf(d.phase));
    expect([...phases].sort((a, b) => a - b)).toEqual(phases);
  });

  it("only schedules study on the chosen weekdays (plus the day before and the day itself)", () => {
    const plan = buildPlan({ ...base, daysPerWeek: 3 });
    for (const d of plan.days.filter((x) => x.phase !== "eve" && x.phase !== "interview")) {
      expect([1, 3, 5]).toContain(new Date(d.date + "T12:00").getDay());
    }
  });

  it("respects the daily budget whenever a day has more than one task", () => {
    const plan = buildPlan(base);
    for (const d of plan.days.filter((x) => x.phase !== "eve" && x.tasks.length > 1)) {
      expect(d.tasks.reduce((s, t) => s + t.minutes, 0)).toBeLessThanOrEqual(base.minutesPerDay);
    }
  });

  it("links every task to a page on the site, with unique ids", () => {
    const plan = buildPlan(base);
    expect(plan.tasks.length).toBeGreaterThan(30);
    expect(new Set(plan.tasks.map((t) => t.id)).size).toBe(plan.tasks.length);
    for (const t of plan.tasks) expect(t.href.startsWith("/")).toBe(true);
    const kinds = new Set(plan.tasks.map((t) => t.kind));
    for (const k of ["learn", "practice", "challenge", "mock", "behavioural", "career", "review", "interview"]) expect(kinds).toContain(k);
  });

  it("is deterministic, so ticked task ids stay valid", () => {
    expect(buildPlan(base).tasks.map((t) => t.id)).toEqual(buildPlan(base).tasks.map((t) => t.id));
  });

  it("follows the focus", () => {
    const tech = buildPlan({ ...base, focus: "technical" });
    expect(tech.tasks.some((t) => t.kind === "behavioural")).toBe(false);
    const behav = buildPlan({ ...base, focus: "behavioural" });
    expect(behav.tasks.some((t) => ["learn", "practice", "challenge", "mock"].includes(t.kind))).toBe(false);
    expect(behav.tasks.some((t) => t.kind === "behavioural")).toBe(true);
  });

  it("names the firm and still works with only a few days to go", () => {
    const short = buildPlan({ ...base, interviewDate: addDays(base.startDate, 3), firm: "Acme Capital" });
    expect(short.days.length).toBeGreaterThanOrEqual(3);
    expect(short.tasks.at(-1)!.title).toBe("Interview at Acme Capital");
    expect(short.skippedLessons).toBeGreaterThan(0);
  });

  it("exports a calendar file with one event per day", () => {
    const plan = buildPlan(base);
    const ics = planToIcs(plan, "IB interview", "https://example.test");
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(plan.days.length);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270124");
  });
});

describe("planner options", () => {
  it("adds brain teasers for trading, quant and consulting tracks only", () => {
    const has = (track: PlanInput["track"]) => buildPlan({ ...base, track }).tasks.some((t) => t.href === "/brain-teasers/");
    expect(has("sales-trading")).toBe(true);
    expect(has("quant-finance")).toBe(true);
    expect(has("investment-banking")).toBe(false);
  });

  it("handles very short and very long study days", () => {
    for (const minutesPerDay of [15, 480]) {
      const plan = buildPlan({ ...base, minutesPerDay });
      expect(plan.days.at(-1)!.phase).toBe("interview");
      for (const d of plan.days.filter((x) => !["eve", "interview"].includes(x.phase))) {
        expect(d.tasks.length).toBeGreaterThan(0);
        if (d.tasks.length > 1) expect(d.tasks.reduce((s, t) => s + t.minutes, 0)).toBeLessThanOrEqual(minutesPerDay);
      }
    }
    // Eight hours a day leaves no lesson out and fills the days.
    const long = buildPlan({ ...base, minutesPerDay: 480 });
    expect(long.skippedLessons).toBe(0);
    const practiceDay = long.days.find((d) => d.phase === "practice")!;
    expect(practiceDay.tasks.reduce((s, t) => s + t.minutes, 0)).toBeGreaterThan(300);
  });
});

describe("saved plans", () => {
  it("survive sanitizeState and default to none", () => {
    expect(sanitizeState({ version: 1 }).plans).toEqual([]);
    const plans = sanitizeState({ version: 1, plans: [{ ...base, id: "p", createdAt: "", done: ["x"] }, { bad: true }] }).plans;
    expect(plans).toHaveLength(1);
    expect(plans[0].done).toEqual(["x"]);
  });
});

describe("planner in Spanish", () => {
  it("generates the same tasks, ids and dates in both languages", () => {
    const inputs: PlanInput[] = [
      base,
      { ...base, level: "strong", firm: "Acme Capital", track: "sales-trading" },
      { ...base, focus: "behavioural", daysPerWeek: 3, minutesPerDay: 15 },
      { ...base, focus: "technical", interviewDate: addDays(base.startDate, 4), minutesPerDay: 480 },
    ];
    for (const input of inputs) {
      const en = buildPlan(input);
      const es = buildPlan(input, "es");
      const shape = (p: typeof en) => p.tasks.map((t) => [t.id, t.date, t.kind, t.phase, t.href, t.minutes]);
      expect(shape(es)).toEqual(shape(en));
      expect(es.days.map((d) => [d.date, d.phase])).toEqual(en.days.map((d) => [d.date, d.phase]));
      expect(es.skippedLessons).toBe(en.skippedLessons);
    }
  });

  it("translates the text but keeps lesson and course titles", () => {
    const es = buildPlan({ ...base, firm: "Acme Capital" }, "es");
    expect(es.tasks.at(-1)!.title).toBe("Entrevista en Acme Capital");
    expect(es.tasks.find((t) => t.kind === "learn")!.detail).toMatch(/ · lección 1 de \d+$/);
    expect(validatePlanInput({ startDate: base.startDate, interviewDate: "" }, "es")).toBe("Elige la fecha de tu entrevista.");
    expect(planToIcs(buildPlan(base, "es"), "Entrevista", "https://example.test", "es")).toMatch(/SUMMARY:Entrevista: \d+ tareas?/);
  });
});
