import type { Bilingual, InterviewConcept, InterviewItem } from "../types";

/*
 * Behavioural interview items for the Behaviourals mock interview. Checks are
 * transparent pattern matches for the elements a strong answer contains
 * (STAR structure, ownership, specifics). Patterns are lower case and accent-free.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });
const c = (id: string, en: string, es: string, patterns: string[], key = false): InterviewConcept => ({ id, label: b(en, es), patterns, key });

const SITUATION = c("situation", "Context: when and where", "Contexto: cuándo y dónde", ["when i", "during", "while i", "at my", "in my (first|second|third|final|last)", "last (year|summer|term)", "cuando", "durante", "en mi", "el (ano|verano|curso) pasado"]);
const TASK = c("task", "Your role or goal", "Tu papel u objetivo", ["my role", "responsible for", "my task", "i had to", "the goal", "objective", "mi papel", "responsable de", "tenia que", "el objetivo", "mi tarea"]);
const ACTION = c(
  "action",
  "What you did, in the first person",
  "Lo que hiciste tú, en primera persona",
  ["\\bi (decided|organi[sz]ed|proposed|led|built|created|spoke|asked|set up|took|analy[sz]ed|reached out|split|prioriti[sz]ed|called|wrote|changed|suggested|explained|met)", "decidi", "organice", "propuse", "lidere", "hable con", "prepare", "analice", "cree", "priorice", "explique", "sugeri"],
  true,
);
const RESULT = c("result", "The result, ideally measurable", "El resultado, a ser posible medible", ["result", "as a result", "outcome", "we (won|delivered|finished|achieved|raised|increased|met)", "\\d+ ?%", "resultado", "conseguimos", "logramos", "ganamos", "aumento", "entregamos", "cumplimos"], true);
const LEARNING = c("learning", "What you learned", "Qué aprendiste", ["learn", "lesson", "next time", "taught me", "reali[sz]ed", "aprendi", "leccion", "la proxima vez", "me enseno", "me di cuenta"]);
const STAR = [SITUATION, TASK, ACTION, RESULT, LEARNING];

const REFLECT = {
  deeper: b("Good. Looking back, what would you do differently?", "Bien. Mirando atrás, ¿qué harías de otra manera?"),
  concepts: [c("reflection", "A specific change you would make", "Un cambio concreto que harías", ["differently", "would have", "earlier", "next time", "instead", "de otra manera", "habria", "antes", "la proxima vez", "en vez de"], true)],
};

export const BEHAVIOURAL_ITEMS: InterviewItem[] = [
  {
    id: "iv-b-yourself",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("Tell me about yourself.", "Háblame de ti."),
    concepts: [
      c("present", "Where you are now", "Dónde estás ahora", ["i am|i'm (a|an|in my|studying|currently)", "currently", "studying", "estudio", "actualmente", "estoy (en|cursando)"], true),
      c("past", "Relevant experience", "Experiencia relevante", ["internship", "experience", "worked", "society|club", "competition", "practicas", "experiencia", "trabaje", "club", "competicion"], true),
      c("why", "Why this role, now", "Por qué este puesto, ahora", ["interested in", "that's why", "which is why", "why i('m| am) here", "this role", "me interesa", "por eso", "este puesto"]),
      c("concise", "A clear arc: present, past, future", "Un hilo claro: presente, pasado, futuro", ["first|then|now|today|next", "primero|luego|ahora|hoy|despues"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Thanks. What's one thing on your CV you'd like me to ask you about, and why?", "Gracias. ¿Qué parte de tu CV te gustaría que te preguntara y por qué?"),
      probe: b("How does your background connect to this role specifically?", "¿Cómo conecta tu trayectoria con este puesto en concreto?"),
      concepts: [
        c("specific", "A specific experience", "Una experiencia concreta", ["internship", "project", "competition", "club", "practicas", "proyecto", "competicion"], true),
        c("link", "Linked to the job's skills", "Conectada con lo que exige el puesto", ["skill", "model", "analy", "team", "client", "habilidad", "modelo", "anali", "equipo", "cliente"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Aim for 60–90 seconds in three parts. Present: who you are now (degree, year, what you focus on). Past: two or three experiences that built relevant skills, each in one line with what you did. Future: why that leads to this role and this firm now. End by handing the conversation back.",
      "Apunta a 60–90 segundos en tres partes. Presente: quién eres ahora (carrera, curso, en qué te centras). Pasado: dos o tres experiencias que te dieron habilidades relevantes, cada una en una frase con lo que hiciste. Futuro: por qué eso te lleva a este puesto y a esta firma ahora. Termina devolviendo la conversación.",
    ),
    followUpModelAnswer: b(
      "Pick the experience you can discuss in most depth, ideally with a concrete result, and connect it to a skill the job needs (analysis, teamwork under pressure, client work).",
      "Elige la experiencia de la que puedas hablar con más profundidad, a ser posible con un resultado concreto, y conéctala con una habilidad que pide el puesto (análisis, trabajo en equipo bajo presión, trato con clientes).",
    ),
  },
  {
    id: "iv-b-why-ib",
    format: "behavioral",
    topics: ["strategy"],
    tracks: ["investment-banking", "corporate-finance"],
    difficulty: "Beginner",
    prompt: b("Why investment banking?", "¿Por qué banca de inversión?"),
    concepts: [
      c("deals", "Interest in transactions and advice", "Interés en operaciones y asesoramiento", ["deal", "transaction", "m&a", "advis", "capital rais", "operacion", "asesor", "fusiones"], true),
      c("learning", "The learning curve and skills", "La curva de aprendizaje y las habilidades", ["learn", "skill", "model", "valuation", "steep", "aprend", "habilidad", "modelo", "valoracion"]),
      c("evidence", "Evidence from your experience", "Evidencia de tu experiencia", ["internship", "club", "competition", "project", "course", "practicas", "competicion", "proyecto"], true),
      c("role", "Understanding of the analyst role", "Entender el trabajo de analista", ["analyst", "pitch", "model", "due diligence", "hours", "analista", "presentacion", "modelo"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Why banking rather than consulting or private equity?", "¿Por qué banca y no consultoría o private equity?"),
      probe: b("What specifically have you done that confirms this interest?", "¿Qué has hecho en concreto que confirme ese interés?"),
      concepts: [
        c("contrast", "A real difference between the paths", "Una diferencia real entre los caminos", ["transaction|deal|advis", "operational|strategy|invest", "operacion|asesor", "operativ|estrategia|inver"], true),
        c("example", "A concrete example", "Un ejemplo concreto", ["internship", "project", "club", "competition", "practicas", "proyecto", "competicion"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Name what attracts you to the work itself (advising on transactions that change companies), the skills you want to build (financial analysis, valuation, working with senior clients), and the evidence that this is informed (an internship, investment club, a deal you followed). Show you know what the analyst job involves.",
      "Explica qué te atrae del trabajo en sí (asesorar en operaciones que cambian empresas), qué habilidades quieres desarrollar (análisis financiero, valoración, trato con clientes sénior) y la evidencia de que es una decisión informada (unas prácticas, un club de inversión, una operación que seguiste). Demuestra que sabes en qué consiste el trabajo de analista.",
    ),
    followUpModelAnswer: b(
      "Contrast honestly: banking gives exposure to many transactions and companies in a short time; consulting is more operational and strategic; private equity is investing, usually after banking experience. Tie the choice to your own interests.",
      "Compara con honestidad: la banca da exposición a muchas operaciones y empresas en poco tiempo; la consultoría es más operativa y estratégica; el private equity es invertir, normalmente tras pasar por banca. Relaciona la elección con tus intereses.",
    ),
  },
  {
    id: "iv-b-why-firm",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Why our firm rather than our competitors?", "¿Por qué nuestra firma y no la competencia?"),
    concepts: [
      c("specifics", "Specific facts about the firm", "Datos concretos de la firma", ["deal", "transaction", "sector", "group", "division", "fund", "client", "operacion", "sector", "division", "fondo"], true),
      c("people", "People you have spoken to", "Personas con las que has hablado", ["spoke (to|with)", "conversation", "met", "coffee", "event", "hable con", "conoci", "conversacion", "evento"], true),
      c("culture", "Culture or structure", "Cultura o estructura", ["culture", "team", "lean", "exposure", "small", "cultura", "equipo", "exposicion"]),
      c("fit", "Why it fits you", "Por qué encaja contigo", ["because i", "which matches", "fits", "my interest", "encaja", "porque me", "mi interes"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Tell me about one thing you learned from someone here.", "Cuéntame algo que hayas aprendido de alguien de aquí."),
      probe: b("That could apply to many firms. What is specific to us?", "Eso podría aplicarse a muchas firmas. ¿Qué es específico de nosotros?"),
      concepts: [
        c("specific", "Something only true of this firm", "Algo propio de esta firma", ["deal", "group", "sector", "program", "training", "operacion", "grupo", "programa", "formacion"], true),
        c("person", "A person or conversation", "Una persona o conversación", ["spoke|told me|conversation", "hable|me conto|conversacion"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Give two or three reasons only this firm satisfies: a sector or product strength you care about, recent work you studied, and what people you spoke to said about the culture or the analyst experience. Link each to your own goals. Avoid generic praise like “prestige” or “great culture”.",
      "Da dos o tres razones que solo cumpla esta firma: una fortaleza en un sector o producto que te interesa, trabajo reciente que hayas estudiado y lo que te contaron las personas con las que hablaste sobre la cultura o la experiencia del analista. Conecta cada una con tus objetivos. Evita elogios genéricos como “prestigio” o “buena cultura”.",
    ),
    followUpModelAnswer: b(
      "Name the person or team (without overstating the relationship) and one concrete insight that changed or confirmed your view.",
      "Menciona a la persona o al equipo (sin exagerar la relación) y una idea concreta que cambió o confirmó tu visión.",
    ),
  },
  {
    id: "iv-b-failure",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Tell me about a time you failed.", "Cuéntame una ocasión en la que fracasaste."),
    concepts: [SITUATION, c("ownership", "You take responsibility", "Asumes la responsabilidad", ["my fault", "i should have", "i was responsible", "i underestimated", "i didn't", "mi culpa", "deberia haber", "subestime", "no hice"], true), ACTION, RESULT, LEARNING],
    minConcepts: 3,
    followUp: { ...REFLECT, probe: b("What part of that was your responsibility, and what did you learn?", "¿Qué parte fue responsabilidad tuya y qué aprendiste?"), minConcepts: 1 },
    modelAnswer: b(
      "Choose a real failure with stakes (not a disguised success). Set the scene briefly, own your part clearly, describe what you did to recover, and spend real time on what you learned and how you now behave differently.",
      "Elige un fracaso real y con consecuencias (no un éxito disfrazado). Describe brevemente el contexto, asume con claridad tu parte, explica qué hiciste para recuperarte y dedica tiempo a lo que aprendiste y a cómo actúas ahora de otra forma.",
    ),
    followUpModelAnswer: b("A concrete change, such as checking work earlier, asking for help sooner, or setting interim deadlines.", "Un cambio concreto, como revisar antes, pedir ayuda antes o fijar plazos intermedios."),
  },
  {
    id: "iv-b-leadership",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Describe a time you led a team.", "Describe una ocasión en la que lideraste un equipo."),
    concepts: STAR,
    minConcepts: 4,
    followUp: {
      deeper: b("How did you handle someone in the team who wasn't contributing?", "¿Cómo gestionaste a alguien del equipo que no aportaba?"),
      probe: b("What did you personally do as the leader, and what was the outcome?", "¿Qué hiciste tú como líder y cuál fue el resultado?"),
      concepts: [
        c("conversation", "Spoke to them directly", "Hablaste con la persona directamente", ["spoke|talked|asked|one-to-one|1:1", "hable|pregunte|a solas"], true),
        c("adapt", "Adapted roles or support", "Adaptaste tareas o apoyo", ["role|task|support|strength", "tarea|papel|apoyo|fortaleza"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Use STAR. Situation and goal in two sentences; most of the time on your actions as leader (setting direction, splitting work by strengths, keeping momentum, unblocking people); a measurable result; and what you learned about leading.",
      "Usa STAR. Situación y objetivo en dos frases; la mayor parte del tiempo en tus acciones como líder (marcar la dirección, repartir el trabajo según fortalezas, mantener el ritmo, desbloquear a la gente); un resultado medible; y lo que aprendiste sobre liderar.",
    ),
    followUpModelAnswer: b("Raise it privately and early, understand the cause, then adjust their role or support and agree clear next steps.", "Hablarlo en privado y pronto, entender la causa, y después ajustar su papel o el apoyo y acordar próximos pasos claros."),
  },
  {
    id: "iv-b-conflict",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Tell me about a disagreement with a teammate and how you resolved it.", "Cuéntame un desacuerdo con un compañero y cómo lo resolviste."),
    concepts: [SITUATION, c("listen", "You listened to their view", "Escuchaste su punto de vista", ["listened", "understood (their|his|her)", "their perspective", "asked why", "escuche", "entendi", "su punto de vista", "pregunte por que"], true), ACTION, RESULT, LEARNING],
    minConcepts: 3,
    followUp: { ...REFLECT, probe: b("How did you make sure you understood their point of view?", "¿Cómo te aseguraste de entender su punto de vista?"), minConcepts: 1 },
    modelAnswer: b(
      "Pick a professional disagreement, not a personal feud. Show that you listened and understood the other view, focused on the shared goal and the evidence, found a solution, and kept the relationship strong. Close with the result and the lesson.",
      "Elige un desacuerdo profesional, no un conflicto personal. Demuestra que escuchaste y entendiste la otra postura, te centraste en el objetivo común y en los datos, encontrasteis una solución y la relación siguió siendo buena. Termina con el resultado y la lección.",
    ),
    followUpModelAnswer: b("Ask questions, restate their view in your own words, and look for the evidence or the shared goal you can both agree on.", "Hacer preguntas, reformular su postura con tus palabras y buscar los datos o el objetivo común en el que ambos estéis de acuerdo."),
  },
  {
    id: "iv-b-pressure",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Tell me about a time you had to deliver under a tight deadline.", "Cuéntame una ocasión en la que tuviste que entregar algo con un plazo muy ajustado."),
    concepts: [SITUATION, c("prioritise", "How you prioritised", "Cómo priorizaste", ["prioriti", "most important", "first i", "broke (it|the work) down", "plan", "priorice", "lo mas importante", "primero", "dividi", "plan"], true), ACTION, RESULT, LEARNING],
    minConcepts: 3,
    followUp: {
      deeper: b("What would you do if two senior people gave you urgent work at the same time?", "¿Qué harías si dos personas sénior te dieran trabajo urgente a la vez?"),
      probe: b("How exactly did you decide what to do first?", "¿Cómo decidiste exactamente qué hacer primero?"),
      concepts: [
        c("communicate", "Tell both and agree priorities", "Avisar a ambos y acordar prioridades", ["tell|inform|let (them|both) know|ask|flag|communicat", "avisar|informar|preguntar|comunicar"], true),
        c("deadline", "Clarify deadlines", "Aclarar plazos", ["deadline|when (it|they) need|timing", "plazo|cuando lo necesit"]),
      ],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Show calm structure: you clarified what mattered, broke the work into steps, prioritised, communicated progress or risks early, and delivered. Quantify the outcome and what you would repeat.",
      "Muestra calma y estructura: aclaraste lo importante, dividiste el trabajo en pasos, priorizaste, comunicaste avances o riesgos pronto y entregaste. Cuantifica el resultado y qué repetirías.",
    ),
    followUpModelAnswer: b("Be transparent: tell both, clarify each deadline, and let them agree the priority rather than guessing or silently missing one.", "Ser transparente: avisar a ambos, aclarar cada plazo y dejar que acuerden la prioridad, en lugar de adivinar o incumplir uno en silencio."),
  },
  {
    id: "iv-b-weakness",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("What is your greatest weakness?", "¿Cuál es tu mayor debilidad?"),
    concepts: [
      c("genuine", "A genuine weakness", "Una debilidad real", ["weakness", "struggle", "i tend to", "not (as )?good at", "debilidad", "me cuesta", "tiendo a"], true),
      c("action", "What you are doing about it", "Qué estás haciendo para mejorarla", ["working on", "improv", "to fix (this|it)", "now i", "i started", "estoy trabajando", "mejorar", "ahora", "empece a"], true),
      c("evidence", "Evidence of progress", "Evidencia de progreso", ["for example", "recently", "last (month|term)", "por ejemplo", "recientemente", "el (mes|curso) pasado"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("How would that weakness show up in this job, and how would you manage it?", "¿Cómo se notaría esa debilidad en este trabajo y cómo la gestionarías?"),
      probe: b("What concrete steps have you taken to improve it?", "¿Qué pasos concretos has dado para mejorarla?"),
      concepts: [c("plan", "A concrete plan", "Un plan concreto", ["check|deadline|ask|routine|habit|system|list", "revisar|plazo|pedir|rutina|habito|sistema|lista"], true)],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Choose a real but not disqualifying weakness, give a short example of how it showed up, and spend most of the answer on the specific steps you are taking and the evidence they are working. Avoid clichés like “I'm a perfectionist”.",
      "Elige una debilidad real pero no descalificante, da un ejemplo breve de cómo se manifestó y dedica la mayor parte de la respuesta a los pasos concretos que estás dando y a la evidencia de que funcionan. Evita tópicos como “soy perfeccionista”.",
    ),
    followUpModelAnswer: b("Name a habit or system you already use (for example, a checklist before sending work) and how you would apply it on the job.", "Menciona un hábito o sistema que ya uses (por ejemplo, una lista de comprobación antes de enviar trabajo) y cómo lo aplicarías en el puesto."),
  },
  {
    id: "iv-b-strength",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("What is your greatest strength? Give me an example.", "¿Cuál es tu mayor fortaleza? Dame un ejemplo."),
    concepts: [
      c("named", "A clearly named strength", "Una fortaleza concreta", ["strength", "i('m| am) (good|strong) at", "i can", "fortaleza", "se me da bien", "soy bueno|soy buena"], true),
      ACTION,
      RESULT,
      c("relevance", "Why it matters for this role", "Por qué importa en este puesto", ["this role", "analyst", "the job", "useful (here|in)", "este puesto", "analista", "el trabajo", "util"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("Would your teammates say the same? What would they add?", "¿Dirían lo mismo tus compañeros? ¿Qué añadirían?"),
      probe: b("Can you give me a specific example where that strength made a difference?", "¿Puedes darme un ejemplo concreto en el que esa fortaleza marcara la diferencia?"),
      concepts: [c("example", "A specific example", "Un ejemplo concreto", ["when|during|project|internship", "cuando|durante|proyecto|practicas"], true)],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Name one strength relevant to the job (for example, attention to detail or learning fast), prove it with a short STAR example and a result, and link it to how it would help you as an analyst.",
      "Nombra una fortaleza relevante para el puesto (por ejemplo, atención al detalle o aprender rápido), demuéstrala con un ejemplo STAR breve y un resultado, y conéctala con cómo te ayudaría como analista.",
    ),
    followUpModelAnswer: b("Be consistent with your example and add a second, complementary trait others value in you.", "Sé coherente con tu ejemplo y añade un segundo rasgo, complementario, que los demás valoren de ti."),
  },
  {
    id: "iv-b-mistake",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Intermediate",
    prompt: b("Tell me about a mistake you made in your work and how you handled it.", "Cuéntame un error que cometiste en tu trabajo y cómo lo gestionaste."),
    concepts: [
      SITUATION,
      c("raised", "You raised it quickly", "Lo comunicaste rápido", ["told (my|the)", "flagged", "raised it", "let (my|the) .* know", "immediately", "avise", "comunique", "inmediatamente", "lo dije"], true),
      c("fixed", "You fixed it", "Lo corregiste", ["fixed", "corrected", "re-?did", "checked", "correg", "arregle", "revise"]),
      LEARNING,
    ],
    minConcepts: 3,
    followUp: { ...REFLECT, probe: b("Who did you tell, and how quickly?", "¿A quién se lo dijiste y con qué rapidez?"), minConcepts: 1 },
    modelAnswer: b(
      "Pick a real but recoverable mistake. Show that you spotted it, raised it promptly and honestly, fixed it, and changed your process (for example, a check you now always do).",
      "Elige un error real pero recuperable. Demuestra que lo detectaste, lo comunicaste pronto y con honestidad, lo corregiste y cambiaste tu forma de trabajar (por ejemplo, una comprobación que ahora siempre haces).",
    ),
    followUpModelAnswer: b("A specific process change, such as tying out numbers to the source or asking for a quick review before sending.", "Un cambio concreto de proceso, como cuadrar los números con la fuente o pedir una revisión rápida antes de enviar."),
  },
  {
    id: "iv-b-ethics",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Advanced",
    prompt: b(
      "You notice an error in a model that a senior colleague is about to send to a client. What do you do?",
      "Detectas un error en un modelo que un compañero sénior está a punto de enviar a un cliente. ¿Qué haces?",
    ),
    concepts: [
      c("raise", "Raise it before it goes out", "Comunicarlo antes de que salga", ["tell|raise|flag|let (him|her|them) know|point (it )?out", "decir|avisar|comunicar|senalar"], true),
      c("check", "Double-check first, quickly", "Comprobarlo antes, rápido", ["check|verify|make sure|double", "comprobar|verificar|asegurar"]),
      c("respect", "Do it respectfully and privately", "Hacerlo con respeto y en privado", ["privately|respectful|politely|directly", "en privado|con respeto|educad|directamente"]),
      c("client", "Accuracy for the client comes first", "La precisión para el cliente es lo primero", ["client|accura|reputation|wrong number", "cliente|precision|reputacion|error"]),
    ],
    minConcepts: 3,
    followUp: {
      deeper: b("And if they dismiss it and send it anyway?", "¿Y si lo descarta y lo envía igualmente?"),
      probe: b("Would you say something even though they are more senior? How?", "¿Dirías algo aunque sea más sénior? ¿Cómo?"),
      concepts: [c("escalate", "Explain clearly, then escalate appropriately", "Explicarlo con claridad y, si hace falta, escalarlo", ["escalat|another senior|manager|explain|evidence", "escalar|otro senior|responsable|explicar|evidencia"], true)],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Quickly double-check the error, then raise it with the colleague immediately and privately, explaining what you found and why it matters. Accuracy for the client outweighs any awkwardness about seniority.",
      "Comprobar rápido el error y comunicárselo al compañero de inmediato y en privado, explicando qué has visto y por qué importa. La precisión para el cliente pesa más que cualquier incomodidad por la jerarquía.",
    ),
    followUpModelAnswer: b("Explain the evidence once more; if it still goes out wrong, raise it with the appropriate senior person. Ignoring a known error is not an option.", "Volver a explicar la evidencia; si aun así sale con el error, comunicarlo a la persona sénior adecuada. Ignorar un error conocido no es una opción."),
  },
  {
    id: "iv-b-five-years",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("Where do you see yourself in five years?", "¿Dónde te ves dentro de cinco años?"),
    concepts: [
      c("growth", "Growth in this field", "Crecer en este campo", ["grow|develop|progress|promot|responsib", "crecer|desarroll|progres|ascen|responsab"], true),
      c("skills", "Skills you will have built", "Las habilidades que habrás desarrollado", ["skill|expert|sector|deal|client", "habilidad|experto|sector|operacion|cliente"]),
      c("commit", "Commitment to the path", "Compromiso con el camino", ["here|this (firm|team|role)|career in", "aqui|esta (firma|empresa)|este (equipo|puesto)|carrera en"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("What would you need to learn in your first year to get there?", "¿Qué tendrías que aprender en tu primer año para llegar ahí?"),
      probe: b("How does this role fit into that plan?", "¿Cómo encaja este puesto en ese plan?"),
      concepts: [c("concrete", "Concrete skills or steps", "Habilidades o pasos concretos", ["model|valuation|client|sector|technical", "modelo|valoracion|cliente|sector|tecnic"], true)],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Show ambition within the path you are applying for: the responsibilities and expertise you hope to build, and why this role is the right foundation. Avoid naming an unrelated next job.",
      "Muestra ambición dentro del camino al que te presentas: las responsabilidades y conocimientos que esperas desarrollar y por qué este puesto es la base adecuada. Evita mencionar un trabajo siguiente que no tenga relación.",
    ),
    followUpModelAnswer: b("Technical depth (modelling, valuation), sector knowledge and how to work with senior people and clients.", "Profundidad técnica (modelos, valoración), conocimiento sectorial y saber trabajar con personas sénior y con clientes."),
  },
  {
    id: "iv-b-questions",
    format: "behavioral",
    topics: ["strategy"],
    tracks: "all",
    difficulty: "Beginner",
    prompt: b("We're nearly out of time. Do you have any questions for me?", "Casi no nos queda tiempo. ¿Tienes alguna pregunta para mí?"),
    concepts: [
      c("asks", "Asks real questions", "Hace preguntas de verdad", ["\\?", "what|how|which|why", "que|como|cual|por que"], true),
      c("thoughtful", "About the work, team or learning", "Sobre el trabajo, el equipo o el aprendizaje", ["team|learn|day|challenge|mentor|culture|first year|feedback", "equipo|aprend|dia|reto|mentor|cultura|primer ano"], true),
      c("personal", "About the interviewer's experience", "Sobre la experiencia del entrevistador", ["you|your (experience|time|career)", "usted|tu experiencia|tu carrera|te ha"]),
    ],
    minConcepts: 2,
    followUp: {
      deeper: b("Good question. Anything else?", "Buena pregunta. ¿Algo más?"),
      probe: b("Is there anything you'd like to know about the team or the role?", "¿Hay algo que te gustaría saber sobre el equipo o el puesto?"),
      concepts: [c("asks", "Another genuine question", "Otra pregunta genuina", ["\\?", "what|how|which", "que|como|cual"], true)],
      minConcepts: 1,
    },
    modelAnswer: b(
      "Always ask two or three questions you couldn't answer from the website: what distinguishes the best analysts on the team, how feedback works in the first year, what the interviewer enjoys most about their work. Avoid pay or hours in a first interview.",
      "Haz siempre dos o tres preguntas que no se respondan con la web: qué distingue a los mejores analistas del equipo, cómo funciona el feedback el primer año, qué es lo que más disfruta el entrevistador de su trabajo. Evita preguntar por sueldo u horario en una primera entrevista.",
    ),
    followUpModelAnswer: b("A second question about the team's current focus or how analysts learn.", "Una segunda pregunta sobre el foco actual del equipo o cómo aprenden los analistas."),
  },
];
