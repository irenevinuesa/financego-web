/* Behavioural interview guide. General, widely used advice; no claims about any specific firm's process. */

export interface GuideSection {
  id: string;
  title: string;
  intro: string;
  points: { title: string; body: string }[];
  example?: { label: string; lines: string[] };
}

export const WHAT_THEY_TEST = [
  { title: "Motivation", body: "Do you understand the job, and is your interest backed by things you have actually done?" },
  { title: "Fit and teamwork", body: "Will people want to work long hours next to you? Can you take feedback and support a team?" },
  { title: "Judgement and integrity", body: "Do you raise problems early, own your mistakes and handle confidential information properly?" },
  { title: "Communication", body: "Can you answer clearly, in a structure, in the time a busy senior person will give you?" },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "star",
    title: "The STAR method",
    intro: "Most “tell me about a time…” questions are answered best as a short story with a clear structure. STAR keeps you focused on what you did and what changed because of it.",
    points: [
      { title: "Situation (10%)", body: "One or two sentences of context: where you were, what was at stake. Skip details the interviewer doesn't need." },
      { title: "Task (10%)", body: "Your responsibility or the goal. Make it clear what was yours, not just the team's." },
      { title: "Action (60%)", body: "What you did, step by step, in the first person. This is where interviewers judge you, so spend most of your time here." },
      { title: "Result (20%)", body: "The outcome, with a number where you honestly have one, and what you learned or would do differently." },
    ],
    example: {
      label: "Skeleton of a two-minute STAR answer",
      lines: [
        "S: In my second year I was one of four students running our university investment club's stock pitch competition.",
        "T: I was responsible for getting judges and sponsors three weeks before the event.",
        "A: I listed alumni in finance, wrote a short personal message to each, followed up after five days and offered two time slots to make saying yes easy.",
        "R: Five of the eight people I contacted agreed to judge. I learned that a specific, low-effort ask gets far more replies than a general one.",
      ],
    },
  },
  {
    id: "yourself",
    title: "“Tell me about yourself”",
    intro: "Usually the first question, and it sets the tone. It is not your life story: it is a 60–90 second pitch for why you are sitting in that chair.",
    points: [
      { title: "Present", body: "Who you are now: degree, year, university, and the area you focus on." },
      { title: "Past", body: "Two or three experiences that shaped your interest, each with one concrete thing you did or learned." },
      { title: "Future", body: "Why this role, at this firm, is the logical next step, so the interviewer's next question comes naturally." },
      { title: "Practise out loud", body: "Time yourself. Prepare a 30-second version for networking and a 90-second version for interviews." },
    ],
  },
  {
    id: "why",
    title: "Why finance, why this role, why this firm",
    intro: "Interviewers hear generic answers all day. The answers that stand out are specific and backed by evidence from your own experience.",
    points: [
      { title: "Why finance", body: "Name the moment your interest started and how you tested it: an internship, a club, a competition, a project." },
      { title: "Why this role", body: "Show you know what the job involves day to day, and which parts of it you want to get good at." },
      { title: "Why this firm", body: "Give two or three reasons that apply to this firm and not to every competitor: a sector it is strong in, its structure, people you spoke to." },
      { title: "Avoid", body: "Money, prestige or exit opportunities as your main reason, and facts read straight off the firm's homepage." },
    ],
  },
  {
    id: "stories",
    title: "Build a bank of stories",
    intro: "You do not need a different story for every question. Six to eight strong, well-practised stories can answer almost anything if you know which ones fit which category.",
    points: [
      { title: "Cover the categories", body: "Teamwork, leadership, failure, conflict, pressure, initiative and ethics. One story can often cover two or three." },
      { title: "Use real, recent examples", body: "University, work, sport, volunteering or part-time jobs all count. What matters is your action and the result." },
      { title: "Write them down once", body: "Write each story in STAR form, then practise saying it from bullet points, not a script." },
      { title: "Prepare the follow-ups", body: "“What would you do differently?” and “What did the others think?” are almost always asked." },
    ],
  },
  {
    id: "ask",
    title: "Your questions for the interviewer",
    intro: "“Do you have any questions?” is part of the assessment. Good questions show curiosity and that you have done your research.",
    points: [
      { title: "About their experience", body: "“What has surprised you most since you joined?” or “What kind of work do you enjoy most?”" },
      { title: "About the role", body: "“What distinguishes analysts who do really well in their first year?”" },
      { title: "About learning", body: "“How does feedback work on the team?” or “What training do new joiners get?”" },
      { title: "Avoid", body: "Questions answered on the website, and pay or holidays in an early round." },
    ],
  },
  {
    id: "delivery",
    title: "Delivery on the day",
    intro: "How you say it matters almost as much as what you say, especially in short first-round and video interviews.",
    points: [
      { title: "Answer first, then explain", body: "Lead with the headline, then give the story. A busy interviewer should know where you are going." },
      { title: "Keep it to two minutes", body: "Most answers should run 1–2 minutes. Stop and let them ask follow-ups." },
      { title: "Be honest", body: "Never invent a story or overstate your role. Follow-up questions expose it quickly." },
      { title: "Video interviews", body: "Look at the camera, check your light and sound, and keep notes off-screen to bullet points only." },
    ],
  },
];
