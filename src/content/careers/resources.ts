/* Career preparation resources: CV, networking, illustrative interview scenarios, roadmaps and checklists. */

export const CV_GUIDE = {
  structure: [
    { title: "Header", text: "Name, city, phone, professional email, LinkedIn URL. No photo, date of birth or marital status unless the market expects it." },
    { title: "Education", text: "University, degree, expected graduation date, grade if strong, and relevant coursework or awards. Students list education first." },
    { title: "Experience", text: "Reverse chronological. Firm, role, location, dates, then 2–4 bullets per role focused on what you did and the result." },
    { title: "Leadership & activities", text: "Investment clubs, competitions, societies, volunteering: anything that shows initiative, teamwork or interest in finance." },
    { title: "Skills & interests", text: "Languages with level, technical skills (Excel, modelling, Python), certifications, and two or three specific interests that could start a conversation." },
  ],
  bulletFormula: "Action verb + what you did + how / with what + quantified result or scope",
  bullets: [
    { weak: "Helped with company valuations.", strong: "Built trading-comparables and DCF analyses for a mid-market software company as part of a team of three, informing the client's pricing expectations ahead of a sale process." },
    { weak: "Member of the investment club.", strong: "Pitched a long thesis on a European industrial to a 20-member investment committee; the club allocated 8% of its paper portfolio after a two-round review." },
    { weak: "Did research on markets.", strong: "Wrote a weekly two-page macro briefing on rates and FX for 150 students, growing readership 40% over a semester." },
    { weak: "Worked on Excel models.", strong: "Automated a monthly budget-variance model in Excel, cutting preparation time from two days to three hours for the finance team." },
  ],
  bulletNote: "These bullets are illustrative examples written by FinanceGo to show the format. Only write claims you can discuss in detail.",
  mistakes: [
    "More than one page for a student or graduate CV.",
    "Responsibilities with no results (“responsible for…”).",
    "Unexplained abbreviations or internal jargon.",
    "Inconsistent formatting, dates or tense; typos.",
    "Listing skills you cannot demonstrate in an interview, such as advanced modelling you have never done.",
  ],
  coverLetter: [
    { title: "Opening", text: "The role, how you heard about it, and a one-sentence hook that links you to the firm." },
    { title: "Why this field", text: "A specific story or experience that sparked and confirmed your interest." },
    { title: "Why this firm", text: "Concrete reasons: deals, sectors, culture or people you have spoken to. Avoid generic praise." },
    { title: "Why you", text: "Two or three pieces of evidence for the skills the role needs, each tied to an example." },
    { title: "Close", text: "Brief thanks and availability. Keep the whole letter to one page." },
  ],
};

export const NETWORKING = {
  templates: [
    {
      title: "Cold email to an alumnus / alumna",
      body: `Subject: [University] student interested in [team/firm]

Dear [Name],

I'm a [year] student studying [degree] at [University]. I came across your profile while researching [firm/team] and was interested to see that you moved from [shared background] into [current role].

I'm exploring a career in [field] and would really value 15 minutes of your time to hear how you made that move and what you enjoy about your work. I'm happy to work around your schedule.

Thank you for considering it.

Best regards,
[Your name]
[LinkedIn URL]`,
    },
    {
      title: "LinkedIn connection note (under 300 characters)",
      body: `Hi [Name], I'm a [degree] student at [University] interested in [field]. Your path from [shared background] to [team] stood out to me. Would you be open to a 15-minute call to share your experience? Thank you!`,
    },
    {
      title: "Thank-you follow-up (send within 24 hours)",
      body: `Subject: Thank you, [short reference to the conversation]

Dear [Name],

Thank you for taking the time to speak with me today. Your point about [specific insight] was especially helpful, and I've already started [action you are taking].

I'll keep you posted on my progress. Thanks again for your generosity.

Best regards,
[Your name]`,
    },
    {
      title: "Checking in a few weeks later",
      body: `Dear [Name],

I hope you're well. Following our conversation in [month], I wanted to share a quick update: [what you did, e.g. completed a valuation course, submitted applications]. Your advice on [topic] made a real difference.

If you have a moment, I'd love to hear whether you'd recommend anyone else on the team I could learn from.

Best,
[Your name]`,
    },
  ],
  questions: [
    "What does a typical week look like in your role?",
    "What surprised you most when you started?",
    "What skills distinguish the best junior people on your team?",
    "How did you prepare for your interviews?",
    "What do you wish you had known as a student?",
    "Is there anyone else you would recommend I speak with?",
  ],
  principles: [
    "Do your homework: read their profile and the firm's recent news before the call.",
    "Respect their time: ask for 15 minutes and finish on time.",
    "Ask for advice and insight, not for a job.",
    "Take notes and follow up with something specific.",
  ],
};

export interface IllustrativeScenario {
  id: string;
  title: string;
  track: string;
  format: string;
  stages: string[];
  sampleQuestions: { q: string; practiceId?: string }[];
  tips: string[];
}

/**
 * Illustrative scenarios written by FinanceGo to show common interview formats.
 * They are composites for preparation, NOT reports from real candidates.
 */
export const ILLUSTRATIVE_SCENARIOS: IllustrativeScenario[] = [
  {
    id: "ib-first-round",
    title: "Investment banking first round",
    track: "Investment Banking",
    format: "30–45 minutes, one or two interviewers",
    stages: ["Introduction and “walk me through your CV”", "Motivation: why banking, why this firm", "Technical questions: accounting and valuation", "Your questions"],
    sampleQuestions: [
      { q: "Walk me through how depreciation affects the three statements.", practiceId: "acc-interest-cash" },
      { q: "Why might a company trade at a low EV/EBITDA but a high P/E?", practiceId: "val-ev-ebitda-vs-pe" },
      { q: "What is the implied share price given a peer multiple?", practiceId: "val-implied-price-comps" },
    ],
    tips: ["Answer technicals in a fixed order (income statement → cash flow → balance sheet).", "Keep the CV walk-through under two minutes.", "Have two deals ready to discuss."],
  },
  {
    id: "pe-case",
    title: "Private equity case study",
    track: "Private Equity",
    format: "2–3 hour modelling test or take-home case, then discussion",
    stages: ["Read a case pack on a business", "Build a simple LBO and returns analysis", "Form an investment recommendation", "Discuss risks and key diligence questions"],
    sampleQuestions: [
      { q: "Calculate MOIC and IRR for this paper LBO.", practiceId: "lbo-returns-multistep" },
      { q: "Is this a good LBO candidate?", practiceId: "lbo-good-candidate" },
      { q: "When can leverage hurt returns?", practiceId: "lbo-leverage-double-edge" },
    ],
    tips: ["State the recommendation first, then support it.", "Separate business quality from deal price.", "List the three diligence questions that would change your mind."],
  },
  {
    id: "st-superday",
    title: "Sales & trading final round",
    track: "Sales & Trading",
    format: "Several 20–30 minute interviews with different desks",
    stages: ["Market discussion", "Trade pitch", "Mental maths and probability", "Motivation for a specific desk"],
    sampleQuestions: [
      { q: "What happens to bonds, equities and the currency after a surprise hike?", practiceId: "mkt-rate-hike-currency" },
      { q: "Estimate the price change of a bond with duration 7 when yields rise 50bp.", practiceId: "fi-duration-estimate" },
      { q: "What is the fair value of a die game with one reroll?", practiceId: "bt-reroll-game" },
    ],
    tips: ["Know the level and recent direction of the main rates, FX and equity markets from reliable sources.", "Think out loud on maths questions.", "Have a view and a risk plan for your trade."],
  },
  {
    id: "consulting-case",
    title: "Consulting case interview",
    track: "Consulting",
    format: "30–45 minutes: case plus fit questions",
    stages: ["Fit question (a leadership or teamwork story)", "Case prompt and clarifying questions", "Structure, analysis and maths", "Synthesis and recommendation"],
    sampleQuestions: [
      { q: "Profits fell while revenue was flat. Where do you start?", practiceId: "st-profit-decline" },
      { q: "Compute the break-even volume.", practiceId: "st-break-even" },
      { q: "Size the market for new smartphones in Spain.", practiceId: "bt-market-sizing" },
    ],
    tips: ["Ask clarifying questions before structuring.", "Make your structure MECE and say it out loud.", "End with a clear recommendation, risks and next steps."],
  },
];

export interface Roadmap {
  slug: string;
  title: string;
  summary: string;
  steps: { title: string; detail: string; href: string; cta: string }[];
}

export const ROADMAPS: Roadmap[] = [
  {
    slug: "beginner-to-ib-analyst",
    title: "Beginner to Investment Banking Analyst",
    summary: "From zero finance background to interview-ready for a banking internship or analyst role.",
    steps: [
      { title: "Learn the language", detail: "Time value of money, risk and value creation.", href: "/learn/finance-101/", cta: "Finance 101" },
      { title: "Master the statements", detail: "The three statements and how they link.", href: "/learn/accounting-fundamentals/", cta: "Accounting Fundamentals" },
      { title: "Value a company", detail: "DCF, WACC, terminal value and the equity bridge.", href: "/learn/dcf/", cta: "DCF course" },
      { title: "Drill technicals", detail: "Accounting and valuation questions until you score 80%+.", href: "/practice/accounting/", cta: "Accounting practice" },
      { title: "Deal technicals", detail: "M&A questions, including accretion/dilution and deal rationale.", href: "/practice/ma/", cta: "M&A practice" },
      { title: "Build it yourself", detail: "Run the DCF tool and explain every assumption.", href: "/tools/dcf/", cta: "DCF Builder" },
      { title: "Interview questions", detail: "Investment banking interview questions, weighted towards traps and cases.", href: "/practice/session/?mode=interview&track=investment-banking", cta: "IB interview prep" },
      { title: "Rehearse your story", detail: "“Why banking?”, your CV walk-through and teamwork questions.", href: "/behaviourals/stories/", cta: "Story bank" },
    ],
  },
  {
    slug: "accounting-to-valuation",
    title: "Accounting to Valuation",
    summary: "Turn accounting knowledge into valuation skill.",
    steps: [
      { title: "Statements as a system", detail: "Linking the statements and working capital.", href: "/learn/accounting-fundamentals/linking-statements/", cta: "Linking the statements" },
      { title: "From EBIT to free cash flow", detail: "Build unlevered FCF line by line.", href: "/learn/dcf/unlevered-fcf/", cta: "Unlevered FCF lesson" },
      { title: "The discount rate", detail: "WACC and how it moves enterprise value.", href: "/learn/dcf/wacc/", cta: "WACC lesson" },
      { title: "Practise valuation", detail: "Valuation question set with feedback.", href: "/practice/valuation/", cta: "Valuation practice" },
      { title: "Use the tools", detail: "WACC Calculator and DCF Builder.", href: "/tools/wacc/", cta: "WACC Calculator" },
    ],
  },
  {
    slug: "ib-to-pe",
    title: "Investment Banking to Private Equity",
    summary: "What changes when you move from advising on deals to investing in them.",
    steps: [
      { title: "Sharpen valuation", detail: "Terminal value, sensitivities and sanity checks.", href: "/learn/dcf/sensitivity/", cta: "Sensitivity lesson" },
      { title: "LBO intuition", detail: "Paper LBOs, IRR and MOIC rules of thumb.", href: "/practice/lbo/", cta: "LBO practice" },
      { title: "Think like an investor", detail: "Business quality, value creation and risks.", href: "/career/private-equity/", cta: "PE career guide" },
      { title: "Interview questions", detail: "Private equity technical and case questions.", href: "/practice/session/?mode=interview&track=private-equity", cta: "PE interview prep" },
      { title: "Explain the move", detail: "“Why private equity?” and the deals on your CV.", href: "/behaviourals/stories/", cta: "Story bank" },
    ],
  },
  {
    slug: "student-to-st",
    title: "Finance Student to Sales & Trading",
    summary: "Build market fluency, bond and option intuition and quick maths.",
    steps: [
      { title: "Risk and discounting", detail: "Why rates move asset prices.", href: "/learn/finance-101/time-value-of-money/", cta: "Time value of money" },
      { title: "Bond maths", detail: "Price, duration and convexity, hands-on.", href: "/tools/bond-pricing/", cta: "Bond Pricing tool" },
      { title: "Markets questions", detail: "Rates, FX and equity reactions to data and policy, until the reasoning is automatic.", href: "/practice/markets/", cta: "Markets practice" },
      { title: "Derivatives questions", detail: "Option payoffs, the Greeks and volatility.", href: "/practice/derivatives/", cta: "Derivatives practice" },
      { title: "Brain teasers", detail: "Probability and mental maths.", href: "/practice/brain-teasers/", cta: "Brain teasers" },
      { title: "Interview questions", detail: "Market discussions and trade ideas.", href: "/practice/session/?mode=interview&track=sales-trading", cta: "S&T interview prep" },
    ],
  },
  {
    slug: "markets-to-hf-research",
    title: "Financial Markets to Hedge Fund Research",
    summary: "From following markets to building and defending investment ideas.",
    steps: [
      { title: "Valuation toolkit", detail: "DCF and the equity bridge.", href: "/learn/dcf/", cta: "DCF course" },
      { title: "Read the statements critically", detail: "Accruals, working capital and earnings quality.", href: "/learn/accounting-fundamentals/accruals/", cta: "Accruals lesson" },
      { title: "Valuation questions", detail: "Practise the trap questions on multiples and earnings quality.", href: "/practice/valuation/", cta: "Valuation practice" },
      { title: "Markets questions", detail: "How macro and rates feed into the assets you pitch.", href: "/practice/markets/", cta: "Markets practice" },
      { title: "Interview questions", detail: "Hedge fund interview questions, including pitch-style cases.", href: "/practice/session/?mode=interview&track=hedge-funds", cta: "HF interview prep" },
    ],
  },
];

export interface Checklist {
  id: string;
  title: string;
  items: { id: string; text: string }[];
}

export const CHECKLISTS: Checklist[] = [
  {
    id: "before-applications",
    title: "Before applications open",
    items: [
      { id: "cv", text: "One-page CV reviewed by at least two people" },
      { id: "linkedin", text: "LinkedIn profile consistent with the CV" },
      { id: "list", text: "Target list of firms and roles you plan to apply to" },
      { id: "dates", text: "Checked each firm's official careers page for application windows" },
      { id: "why", text: "Drafted “Why this field?” and “Why this firm?” answers" },
      { id: "network", text: "Spoken to at least three people working in the field" },
    ],
  },
  {
    id: "before-first-round",
    title: "Before a first-round interview",
    items: [
      { id: "cv-walk", text: "Two-minute CV walk-through rehearsed out loud" },
      { id: "technicals", text: "Core technical questions practised (accounting, valuation)" },
      { id: "firm", text: "Researched the firm: recent deals, news, culture" },
      { id: "stories", text: "Three STAR stories ready (teamwork, leadership, failure)" },
      { id: "markets", text: "Read up on current market developments from reliable sources" },
      { id: "questions", text: "Three thoughtful questions for the interviewer" },
      { id: "mock", text: "Completed at least one mock interview" },
    ],
  },
  {
    id: "before-final-round",
    title: "Before a final round",
    items: [
      { id: "deep-technicals", text: "Advanced technicals reviewed (LBO, M&A, or desk-specific)" },
      { id: "case", text: "Practised a timed case or modelling test" },
      { id: "pitch", text: "Stock or trade pitch prepared with risks" },
      { id: "logistics", text: "Logistics confirmed: time, location or video link" },
      { id: "thank-you", text: "Thank-you notes planned for each interviewer" },
    ],
  },
  {
    id: "after-offer",
    title: "After an offer",
    items: [
      { id: "terms", text: "Read the offer letter and deadline carefully" },
      { id: "compare", text: "Compared the offer with your goals and other processes" },
      { id: "withdraw", text: "Updated or withdrawn other applications courteously" },
      { id: "thank", text: "Thanked everyone who helped you" },
    ],
  },
];
