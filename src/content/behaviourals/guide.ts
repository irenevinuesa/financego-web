/* Behavioural interview guide. General, widely used advice; no claims about any specific firm's process. */

import type { Bilingual } from "../types";

export interface GuideSection {
  id: string;
  title: Bilingual;
  intro: Bilingual;
  points: { title: Bilingual; body: Bilingual }[];
  example?: { label: Bilingual; lines: Bilingual[] };
}

export const WHAT_THEY_TEST: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { en: "Motivation", es: "Motivación" },
    body: {
      en: "Do you understand the job, and is your interest backed by things you have actually done?",
      es: "¿Entiendes el puesto y tu interés está respaldado por cosas que has hecho de verdad?",
    },
  },
  {
    title: { en: "Fit and teamwork", es: "Fit y trabajo en equipo" },
    body: {
      en: "Will people want to work long hours next to you? Can you take feedback and support a team?",
      es: "¿Querrá la gente pasar muchas horas trabajando a tu lado? ¿Sabes recibir feedback y apoyar a un equipo?",
    },
  },
  {
    title: { en: "Judgement and integrity", es: "Criterio e integridad" },
    body: {
      en: "Do you raise problems early, own your mistakes and handle confidential information properly?",
      es: "¿Señalas los problemas pronto, asumes tus errores y tratas bien la información confidencial?",
    },
  },
  {
    title: { en: "Communication", es: "Comunicación" },
    body: {
      en: "Can you answer clearly, in a structure, in the time a busy senior person will give you?",
      es: "¿Sabes responder con claridad y estructura, en el tiempo que te dará alguien senior con poco tiempo?",
    },
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "star",
    title: { en: "The STAR method", es: "El método STAR" },
    intro: {
      en: "Most “tell me about a time…” questions are answered best as a short story with a clear structure. STAR keeps you focused on what you did and what changed because of it.",
      es: "La mayoría de preguntas del tipo «háblame de una vez que…» se responden mejor con una historia corta y bien estructurada. STAR te mantiene centrado en lo que hiciste tú y en lo que cambió gracias a ello.",
    },
    points: [
      {
        title: { en: "Situation (10%)", es: "Situation (10%)" },
        body: {
          en: "One or two sentences of context: where you were, what was at stake. Skip details the interviewer doesn't need.",
          es: "Una o dos frases de contexto: dónde estabas y qué estaba en juego. Sáltate los detalles que el entrevistador no necesita.",
        },
      },
      {
        title: { en: "Task (10%)", es: "Task (10%)" },
        body: {
          en: "Your responsibility or the goal. Make it clear what was yours, not just the team's.",
          es: "Tu responsabilidad o el objetivo. Deja claro qué era tuyo y no solo del equipo.",
        },
      },
      {
        title: { en: "Action (60%)", es: "Action (60%)" },
        body: {
          en: "What you did, step by step, in the first person. This is where interviewers judge you, so spend most of your time here.",
          es: "Lo que hiciste, paso a paso y en primera persona. Aquí es donde te evalúan, así que dedícale la mayor parte del tiempo.",
        },
      },
      {
        title: { en: "Result (20%)", es: "Result (20%)" },
        body: {
          en: "The outcome, with a number where you honestly have one, and what you learned or would do differently.",
          es: "El resultado, con una cifra si la tienes de verdad, y lo que aprendiste o harías de otra forma.",
        },
      },
    ],
    example: {
      label: { en: "Skeleton of a two-minute STAR answer", es: "Esqueleto de una respuesta STAR de dos minutos" },
      lines: [
        {
          en: "S: In my second year I was one of four students running our university investment club's stock pitch competition.",
          es: "S: En segundo de carrera era uno de los cuatro estudiantes que organizaban la competición de stock pitch del club de inversión de mi universidad.",
        },
        {
          en: "T: I was responsible for getting judges and sponsors three weeks before the event.",
          es: "T: Me encargaba de conseguir jurado y patrocinadores tres semanas antes del evento.",
        },
        {
          en: "A: I listed alumni in finance, wrote a short personal message to each, followed up after five days and offered two time slots to make saying yes easy.",
          es: "A: Hice una lista de alumni en finanzas, escribí un mensaje breve y personal a cada uno, hice seguimiento a los cinco días y ofrecí dos franjas horarias para que decir que sí fuera fácil.",
        },
        {
          en: "R: Five of the eight people I contacted agreed to judge. I learned that a specific, low-effort ask gets far more replies than a general one.",
          es: "R: Cinco de las ocho personas a las que contacté aceptaron ser jurado. Aprendí que una petición concreta y que exige poco esfuerzo recibe muchas más respuestas que una genérica.",
        },
      ],
    },
  },
  {
    id: "yourself",
    title: { en: "“Tell me about yourself”", es: "«Háblame de ti»" },
    intro: {
      en: "Usually the first question, and it sets the tone. It is not your life story: it is a 60–90 second pitch for why you are sitting in that chair.",
      es: "Suele ser la primera pregunta y marca el tono. No es tu biografía: es un pitch de 60–90 segundos que explica por qué estás sentado en esa silla.",
    },
    points: [
      {
        title: { en: "Present", es: "Presente" },
        body: {
          en: "Who you are now: degree, year, university, and the area you focus on.",
          es: "Quién eres ahora: carrera, curso, universidad y el área en la que te centras.",
        },
      },
      {
        title: { en: "Past", es: "Pasado" },
        body: {
          en: "Two or three experiences that shaped your interest, each with one concrete thing you did or learned.",
          es: "Dos o tres experiencias que despertaron tu interés, cada una con algo concreto que hiciste o aprendiste.",
        },
      },
      {
        title: { en: "Future", es: "Futuro" },
        body: {
          en: "Why this role, at this firm, is the logical next step, so the interviewer's next question comes naturally.",
          es: "Por qué este puesto, en esta firma, es el siguiente paso lógico, para que la siguiente pregunta del entrevistador surja de forma natural.",
        },
      },
      {
        title: { en: "Practise out loud", es: "Practica en voz alta" },
        body: {
          en: "Time yourself. Prepare a 30-second version for networking and a 90-second version for interviews.",
          es: "Cronométrate. Prepara una versión de 30 segundos para networking y otra de 90 segundos para entrevistas.",
        },
      },
    ],
  },
  {
    id: "why",
    title: { en: "Why finance, why this role, why this firm", es: "Por qué finanzas, por qué este puesto, por qué esta firma" },
    intro: {
      en: "Interviewers hear generic answers all day. The answers that stand out are specific and backed by evidence from your own experience.",
      es: "Los entrevistadores oyen respuestas genéricas todo el día. Las que destacan son concretas y están respaldadas por tu propia experiencia.",
    },
    points: [
      {
        title: { en: "Why finance", es: "Por qué finanzas" },
        body: {
          en: "Name the moment your interest started and how you tested it: an internship, a club, a competition, a project.",
          es: "Di en qué momento empezó tu interés y cómo lo pusiste a prueba: unas prácticas, un club, una competición, un proyecto.",
        },
      },
      {
        title: { en: "Why this role", es: "Por qué este puesto" },
        body: {
          en: "Show you know what the job involves day to day, and which parts of it you want to get good at.",
          es: "Demuestra que sabes en qué consiste el día a día del puesto y en qué partes quieres llegar a ser bueno.",
        },
      },
      {
        title: { en: "Why this firm", es: "Por qué esta firma" },
        body: {
          en: "Give two or three reasons that apply to this firm and not to every competitor: a sector it is strong in, its structure, people you spoke to.",
          es: "Da dos o tres motivos que se apliquen a esta firma y no a todos sus competidores: un sector en el que es fuerte, su estructura, personas con las que hablaste.",
        },
      },
      {
        title: { en: "Avoid", es: "Evita" },
        body: {
          en: "Money, prestige or exit opportunities as your main reason, and facts read straight off the firm's homepage.",
          es: "El dinero, el prestigio o las exit opportunities como motivo principal, y datos sacados tal cual de la web de la firma.",
        },
      },
    ],
  },
  {
    id: "stories",
    title: { en: "Build a bank of stories", es: "Crea un banco de historias" },
    intro: {
      en: "You do not need a different story for every question. Six to eight strong, well-practised stories can answer almost anything if you know which ones fit which category.",
      es: "No necesitas una historia distinta para cada pregunta. Entre seis y ocho historias sólidas y bien practicadas sirven para casi todo si sabes cuáles encajan en cada categoría.",
    },
    points: [
      {
        title: { en: "Cover the categories", es: "Cubre las categorías" },
        body: {
          en: "Teamwork, leadership, failure, conflict, pressure, initiative and ethics. One story can often cover two or three.",
          es: "Trabajo en equipo, liderazgo, fracaso, conflicto, presión, iniciativa y ética. Una misma historia suele cubrir dos o tres.",
        },
      },
      {
        title: { en: "Use real, recent examples", es: "Usa ejemplos reales y recientes" },
        body: {
          en: "University, work, sport, volunteering or part-time jobs all count. What matters is your action and the result.",
          es: "La universidad, el trabajo, el deporte, el voluntariado o un trabajo a tiempo parcial cuentan. Lo que importa es lo que hiciste y el resultado.",
        },
      },
      {
        title: { en: "Write them down once", es: "Escríbelas una vez" },
        body: {
          en: "Write each story in STAR form, then practise saying it from bullet points, not a script.",
          es: "Escribe cada historia en formato STAR y practica contándola a partir de unos puntos clave, no de un guion.",
        },
      },
      {
        title: { en: "Prepare the follow-ups", es: "Prepara las repreguntas" },
        body: {
          en: "“What would you do differently?” and “What did the others think?” are almost always asked.",
          es: "«¿Qué harías de otra forma?» y «¿Qué opinaban los demás?» casi siempre salen.",
        },
      },
    ],
  },
  {
    id: "ask",
    title: { en: "Your questions for the interviewer", es: "Tus preguntas para el entrevistador" },
    intro: {
      en: "“Do you have any questions?” is part of the assessment. Good questions show curiosity and that you have done your research.",
      es: "«¿Tienes alguna pregunta?» también forma parte de la evaluación. Las buenas preguntas demuestran curiosidad y que te has preparado.",
    },
    points: [
      {
        title: { en: "About their experience", es: "Sobre su experiencia" },
        body: {
          en: "“What has surprised you most since you joined?” or “What kind of work do you enjoy most?”",
          es: "«¿Qué es lo que más te ha sorprendido desde que entraste?» o «¿Qué tipo de trabajo es el que más disfrutas?»",
        },
      },
      {
        title: { en: "About the role", es: "Sobre el puesto" },
        body: {
          en: "“What distinguishes analysts who do really well in their first year?”",
          es: "«¿Qué distingue a los analysts a los que les va realmente bien en su primer año?»",
        },
      },
      {
        title: { en: "About learning", es: "Sobre el aprendizaje" },
        body: {
          en: "“How does feedback work on the team?” or “What training do new joiners get?”",
          es: "«¿Cómo funciona el feedback en el equipo?» o «¿Qué formación reciben los nuevos?»",
        },
      },
      {
        title: { en: "Avoid", es: "Evita" },
        body: {
          en: "Questions answered on the website, and pay or holidays in an early round.",
          es: "Preguntas que ya responde la web, y el sueldo o las vacaciones en una primera ronda.",
        },
      },
    ],
  },
  {
    id: "delivery",
    title: { en: "Delivery on the day", es: "Cómo comunicarlo el día de la entrevista" },
    intro: {
      en: "How you say it matters almost as much as what you say, especially in short first-round and video interviews.",
      es: "Cómo lo dices importa casi tanto como lo que dices, sobre todo en primeras rondas cortas y entrevistas por vídeo.",
    },
    points: [
      {
        title: { en: "Answer first, then explain", es: "Primero la respuesta, luego la explicación" },
        body: {
          en: "Lead with the headline, then give the story. A busy interviewer should know where you are going.",
          es: "Empieza por la idea principal y luego cuenta la historia. Un entrevistador con poco tiempo debe saber adónde vas.",
        },
      },
      {
        title: { en: "Keep it to two minutes", es: "No pases de dos minutos" },
        body: {
          en: "Most answers should run 1–2 minutes. Stop and let them ask follow-ups.",
          es: "La mayoría de respuestas deberían durar 1–2 minutos. Para y deja que te repregunten.",
        },
      },
      {
        title: { en: "Be honest", es: "Sé honesto" },
        body: {
          en: "Never invent a story or overstate your role. Follow-up questions expose it quickly.",
          es: "Nunca te inventes una historia ni exageres tu papel. Las repreguntas lo dejan en evidencia enseguida.",
        },
      },
      {
        title: { en: "Video interviews", es: "Entrevistas por vídeo" },
        body: {
          en: "Look at the camera, check your light and sound, and keep notes off-screen to bullet points only.",
          es: "Mira a la cámara, comprueba la luz y el sonido, y limita tus notas fuera de pantalla a unos pocos puntos clave.",
        },
      },
    ],
  },
];
