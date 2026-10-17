import { useId } from "react";
import type { SceneName } from "@/content/types";

/**
 * Generator for FinanceGo's original vector landscapes in the Alpine Blue
 * palette. It is not used at runtime: `npm run scenes` renders each scene once
 * to public/scenes/<name>.svg, and the <Scene> component shows those files, so
 * pages stay light and the browser caches every scene.
 */

const W = 800;
const H = 600;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Midpoint-displacement ridge line → closed path down to the bottom of the canvas. */
function ridge(seed: number, baseY: number, amp: number, rough = 0.52, bottom = H, segments = 64): string {
  const r = rng(seed);
  const ys = new Array<number>(segments + 1);
  ys[0] = baseY + (r() - 0.5) * amp * 0.6;
  ys[segments] = baseY + (r() - 0.5) * amp * 0.6;
  let step = segments;
  let scale = amp;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < segments; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (r() - 0.5) * scale;
    }
    scale *= rough;
    step = half;
  }
  const pts = ys.map((y, i) => `${r1((i * W) / segments)},${r1(y)}`).join(" L");
  return `M0,${bottom} L${pts} L${W},${bottom} Z`;
}

/** A jagged band used to clip snow caps: everything above it is snow. */
function snowClip(seed: number, y: number, jitter: number): string {
  const r = rng(seed);
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 20) pts.push(`${x},${r1(y + (r() - 0.5) * jitter)}`);
  return `M0,0 L${W},0 L${pts.reverse().join(" L")} Z`;
}

function pine(x: number, y: number, h: number): string {
  const w = h * 0.42;
  const t1 = `M${r1(x)},${r1(y - h)} L${r1(x + w * 0.55)},${r1(y - h * 0.55)} L${r1(x - w * 0.55)},${r1(y - h * 0.55)} Z`;
  const t2 = `M${r1(x)},${r1(y - h * 0.78)} L${r1(x + w * 0.8)},${r1(y - h * 0.25)} L${r1(x - w * 0.8)},${r1(y - h * 0.25)} Z`;
  const t3 = `M${r1(x)},${r1(y - h * 0.5)} L${r1(x + w)},${r1(y)} L${r1(x - w)},${r1(y)} Z`;
  return `${t1} ${t2} ${t3}`;
}

function forest(seed: number, y: number, from: number, to: number, minH: number, maxH: number, density = 14): string {
  const r = rng(seed);
  const out: string[] = [];
  for (let x = from; x < to; x += density * (0.6 + r() * 0.8)) {
    out.push(pine(x, y + r() * 6, minH + r() * (maxH - minH)));
  }
  return out.join(" ");
}


type Pt = [number, number];

/** Recursive midpoint jitter between two points, for natural rocky edges. */
function jagged(r: () => number, a: Pt, b: Pt, depth: number, amp: number, out: Pt[]) {
  if (depth === 0) {
    out.push(b);
    return;
  }
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (r() - 0.5) * amp];
  jagged(r, a, mid, depth - 1, amp * 0.55, out);
  jagged(r, mid, b, depth - 1, amp * 0.55, out);
}

/**
 * Builds a mountain range from explicit peaks: valleys are inserted between
 * neighbouring peaks, every edge gets a little rocky jitter, and each peak
 * returns a shaded right-hand face for a faceted, sunlit look.
 */
function range(seed: number, peaks: Pt[], bottom: number, valleyDepth: [number, number], rough = 14) {
  const r = rng(seed);
  const pts: Pt[] = [peaks[0]];
  const faces: string[] = [];
  for (let i = 0; i < peaks.length - 1; i++) {
    const a = peaks[i];
    const b = peaks[i + 1];
    const vx = a[0] + (b[0] - a[0]) * (0.38 + r() * 0.24);
    const vy = Math.max(a[1], b[1]) + valleyDepth[0] + r() * (valleyDepth[1] - valleyDepth[0]);
    const valley: Pt = [vx, vy];
    const down: Pt[] = [];
    jagged(r, a, valley, 3, rough, down);
    const up: Pt[] = [];
    jagged(r, valley, b, 3, rough, up);
    pts.push(...down, ...up);
    // Shaded face: from the peak down its right-hand slope to the valley, back up the fall line.
    const foot: Pt = [a[0] + (vx - a[0]) * 0.25, vy + 6];
    faces.push(`M${r1(a[0])},${r1(a[1])} ${down.map(([x, y]) => `L${r1(x)},${r1(y)}`).join(" ")} L${r1(foot[0])},${r1(foot[1])} Z`);
  }
  const line = pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" L");
  return { d: `M${r1(pts[0][0])},${bottom} L${line} L${r1(pts[pts.length - 1][0])},${bottom} Z`, faces: faces.join(" ") };
}

const FAR_PEAKS: Pt[] = [[-30, 285], [70, 205], [170, 255], [285, 128], [380, 222], [465, 168], [555, 246], [655, 118], [760, 214], [840, 250]];
const MID_PEAKS: Pt[] = [[-30, 318], [95, 262], [230, 312], [345, 236], [470, 320], [590, 258], [715, 306], [840, 270]];
const NEAR_PEAKS: Pt[] = [[-30, 372], [140, 340], [300, 378], [430, 350], [580, 384], [720, 346], [840, 366]];

function buildings(seed: number, baseY: number, minH: number, maxH: number, from = 0, to = W): { x: number; w: number; h: number }[] {
  const r = rng(seed);
  const out: { x: number; w: number; h: number }[] = [];
  let x = from;
  while (x < to) {
    const w = 16 + Math.floor(r() * 30);
    const h = minH + r() * (maxH - minH);
    out.push({ x, w, h });
    x += w + (r() < 0.25 ? 2 : 0);
  }
  return out;
}

function Defs({ id, sky = ["#cfe0f2", "#e9f0f7", "#f7f4ee"] }: { id: string; sky?: string[] }) {
  return (
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={sky[0]} />
        <stop offset="0.6" stopColor={sky[1]} />
        <stop offset="1" stopColor={sky[2]} />
      </linearGradient>
      <radialGradient id={`${id}-sun`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset="0.45" stopColor="#fff3dc" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fff3dc" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a9c8e8" />
        <stop offset="1" stopColor="#3d66ad" />
      </linearGradient>
      <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7f4ee" stopOpacity="0" />
        <stop offset="1" stopColor="#f7f4ee" stopOpacity="0.55" />
      </linearGradient>
      <pattern id={`${id}-win`} width="7" height="9" patternUnits="userSpaceOnUse">
        <rect x="1.5" y="2" width="3" height="4" fill="#e4eef8" opacity="0.55" />
      </pattern>
    </defs>
  );
}

function Alps({ id, lake }: { id: string; lake: boolean }) {
  const water = 410;
  const bottom = lake ? water : H;
  const far = range(11, FAR_PEAKS, bottom, [55, 95], 16);
  const mid = range(23, MID_PEAKS, bottom, [40, 70], 12);
  const near = range(37, NEAR_PEAKS, bottom, [20, 40], 8);
  const mountains = (
    <>
      <path d={far.d} fill="#b4cdea" />
      <path d={far.faces} fill="#8fb0da" opacity="0.55" />
      <clipPath id={`${id}-snow1`}>
        <path d={snowClip(5, 216, 44)} />
      </clipPath>
      <g clipPath={`url(#${id}-snow1)`}>
        <path d={far.d} fill="#ffffff" />
        <path d={far.faces} fill="#d6e4f4" />
      </g>
      <path d={mid.d} fill="#7fa3d6" />
      <path d={mid.faces} fill="#5c86c4" opacity="0.6" />
      <clipPath id={`${id}-snow2`}>
        <path d={snowClip(9, 276, 28)} />
      </clipPath>
      <g clipPath={`url(#${id}-snow2)`}>
        <path d={mid.d} fill="#eef4fb" />
        <path d={mid.faces} fill="#c9dcef" />
      </g>
      <path d={near.d} fill="#3d66ad" />
      <path d={near.faces} fill="#2a5298" opacity="0.7" />
      <path d={forest(41, lake ? water + 2 : 430, -10, W + 10, 18, 34, 11)} fill="#1d4590" />
    </>
  );
  return (
    <>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx="590" cy="150" r="120" fill={`url(#${id}-sun)`} />
      <circle cx="590" cy="150" r="34" fill="#fffaf0" opacity="0.9" />
      {mountains}
      {lake ? (
        <>
          <rect y={water} width={W} height={H - water} fill={`url(#${id}-water)`} />
          <g transform={`translate(0 ${water * 2}) scale(1 -1)`} opacity="0.3">
            <path d={far.d} fill="#e4eef8" />
            <path d={mid.d} fill="#7fa3d6" />
            <path d={near.d} fill="#123a80" />
          </g>
          {[436, 458, 487, 515, 548, 580].map((y, i) => (
            <line key={y} x1={60 + i * 37} x2={300 + i * 61} y1={y} y2={y} stroke="#ffffff" strokeOpacity={0.35 - i * 0.04} strokeWidth="1.5" strokeLinecap="round" />
          ))}
          <path d={forest(77, 600, -20, 260, 70, 130, 26)} fill="#0d2b61" />
          <path d={forest(78, 600, 640, W + 20, 60, 120, 26)} fill="#0d2b61" />
        </>
      ) : (
        <>
          <path d={ridge(53, 470, 50, 0.5)} fill="#123a80" />
          <path d={forest(61, 520, -20, W + 20, 40, 80, 20)} fill="#0d2b61" />
        </>
      )}
      <rect width={W} height={H} fill={`url(#${id}-haze)`} opacity="0.35" />
    </>
  );
}

function Summit({ id }: { id: string }) {
  const peak = "M80,600 L300,310 L350,330 L420,180 L470,240 L520,215 L760,600 Z";
  return (
    <>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx="210" cy="140" r="110" fill={`url(#${id}-sun)`} />
      <path d={ridge(301, 330, 150, 0.5)} fill="#bcd3ec" />
      <path d={peak} fill="#5c86c4" />
      <path d="M420,180 L470,240 L452,236 L436,254 L418,228 L398,240 Z" fill="#ffffff" />
      <path d="M420,180 L520,215 L560,270 L500,262 L470,240 Z" fill="#3d66ad" opacity="0.55" />
      <line x1="420" y1="181" x2="420" y2="128" stroke="#0d2b61" strokeWidth="2.5" />
      <path d="M421,129 L458,141 L421,153 Z" fill="#2165c5" />
      <path d="M180,600 C260,560 230,520 300,500 S360,430 330,400 S400,330 420,260" fill="none" stroke="#fffaf0" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity="0.9" />
      <path d={ridge(311, 500, 60, 0.5)} fill="#123a80" />
      <path d={forest(313, 560, -20, W + 20, 40, 80, 22)} fill="#0d2b61" />
    </>
  );
}

function Trail({ id }: { id: string }) {
  return (
    <>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx="620" cy="170" r="110" fill={`url(#${id}-sun)`} />
      <path d={ridge(401, 300, 170, 0.5)} fill="#bcd3ec" />
      <clipPath id={`${id}-snow`}>
        <path d={snowClip(3, 262, 40)} />
      </clipPath>
      <path d={ridge(401, 300, 170, 0.5)} fill="#ffffff" clipPath={`url(#${id}-snow)`} />
      <path d="M0,600 L0,420 C140,380 260,400 400,430 S660,380 800,400 L800,600 Z" fill="#8fb0da" />
      <path d="M0,600 L0,470 C160,450 300,470 450,500 S700,460 800,470 L800,600 Z" fill="#5c86c4" />
      <path d="M0,600 L0,530 C200,520 320,545 520,560 S720,535 800,540 L800,600 Z" fill="#123a80" />
      <path d="M520,600 C470,560 560,540 500,505 S420,470 470,440 S560,410 520,385" fill="none" stroke="#fffaf0" strokeWidth="4" strokeDasharray="1 11" strokeLinecap="round" opacity="0.85" />
      <path d={forest(407, 535, -20, 300, 40, 75, 20)} fill="#0d2b61" />
      <path d={forest(409, 548, 640, W + 20, 30, 60, 18)} fill="#0d2b61" />
    </>
  );
}

function Skyline({ id, city }: { id: string; city: "nyc" | "london" }) {
  const shore = city === "nyc" ? 455 : 470;
  const back = buildings(city === "nyc" ? 501 : 601, shore, 60, city === "nyc" ? 200 : 110);
  const front = buildings(city === "nyc" ? 503 : 603, shore, 30, city === "nyc" ? 140 : 70);
  const sky = city === "nyc" ? ["#c6d9ef", "#e6eef7", "#f7efe3"] : ["#d4e1ef", "#e9eef5", "#f3efe7"];
  return (
    <>
      <Defs id={id} sky={sky} />
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx={city === "nyc" ? 640 : 170} cy="190" r="120" fill={`url(#${id}-sun)`} />
      <g fill="#a9c8e8">
        {back.map((b, i) => (
          <rect key={i} x={b.x} y={shore - b.h - 30} width={b.w} height={b.h + 30} />
        ))}
      </g>
      {city === "nyc" ? (
        <g fill="#3d66ad">
          {/* Stepped art-deco tower with spire */}
          <rect x="356" y="185" width="56" height="270" />
          <rect x="366" y="160" width="36" height="30" />
          <rect x="374" y="140" width="20" height="22" />
          <rect x="382" y="96" width="4" height="46" />
          {/* Slim supertall */}
          <rect x="520" y="130" width="22" height="325" />
          <rect x="560" y="210" width="40" height="245" />
          {/* Crowned tower */}
          <rect x="196" y="230" width="44" height="225" />
          <path d="M196,230 L218,182 L240,230 Z" />
          <rect x="216" y="160" width="3" height="24" />
        </g>
      ) : (
        <g fill="#3d66ad">
          {/* Clock tower */}
          <rect x="120" y="230" width="34" height="240" />
          <path d="M116,232 L137,176 L158,232 Z" />
          <rect x="136" y="150" width="3" height="28" />
          <circle cx="137" cy="258" r="11" fill="#e4eef8" />
          {/* Shard */}
          <path d="M560,470 L600,120 L640,470 Z" />
          {/* Gherkin */}
          <path d="M410,470 C392,380 396,300 430,262 C464,300 468,380 450,470 Z" />
          {/* Observation wheel */}
          <circle cx="285" cy="360" r="78" fill="none" stroke="#3d66ad" strokeWidth="3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1="285" y1="360" x2={r1(285 + Math.cos(a) * 78)} y2={r1(360 + Math.sin(a) * 78)} stroke="#3d66ad" strokeWidth="1" />;
          })}
          <path d="M270,470 L285,360 L300,470 Z" />
        </g>
      )}
      <g>
        {front.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={shore - b.h} width={b.w} height={b.h} fill="#123a80" />
            <rect x={b.x + 2} y={shore - b.h + 4} width={Math.max(0, b.w - 4)} height={Math.max(0, b.h - 8)} fill={`url(#${id}-win)`} />
          </g>
        ))}
      </g>
      <rect y={shore} width={W} height={H - shore} fill={`url(#${id}-water)`} />
      <g transform={`translate(0 ${shore * 2}) scale(1 -1)`} opacity="0.22">
        {front.map((b, i) => (
          <rect key={i} x={b.x} y={shore - b.h} width={b.w} height={b.h} fill="#0d2b61" />
        ))}
      </g>
      {[shore + 22, shore + 48, shore + 80, shore + 112].map((y, i) => (
        <line key={y} x1={80 + i * 50} x2={360 + i * 70} y1={y} y2={y} stroke="#ffffff" strokeOpacity={0.4 - i * 0.07} strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </>
  );
}

function Campus({ id }: { id: string }) {
  const cols = Array.from({ length: 8 }, (_, i) => 262 + i * 38);
  return (
    <>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <circle cx="610" cy="150" r="110" fill={`url(#${id}-sun)`} />
      <path d={ridge(701, 330, 120, 0.5)} fill="#c9dcef" />
      <path d="M0,600 L0,440 C200,420 600,420 800,440 L800,600 Z" fill="#8fb0da" />
      {/* Library façade */}
      <g>
        <path d="M230,262 L400,196 L570,262 Z" fill="#3d66ad" />
        <path d="M262,256 L400,206 L538,256 Z" fill="#e4eef8" opacity="0.35" />
        <rect x="236" y="262" width="328" height="16" fill="#3d66ad" />
        {cols.map((x) => (
          <rect key={x} x={x} y="278" width="14" height="140" fill="#e4eef8" />
        ))}
        <rect x="244" y="278" width="312" height="140" fill="#123a80" opacity="0.18" />
        <rect x="226" y="418" width="348" height="12" fill="#3d66ad" />
        <rect x="214" y="430" width="372" height="12" fill="#5c86c4" />
        <rect x="202" y="442" width="396" height="12" fill="#7fa3d6" />
      </g>
      {/* Trees */}
      {[90, 150, 650, 715].map((x, i) => (
        <g key={x}>
          <rect x={x - 4} y="400" width="8" height="60" fill="#0d2b61" />
          <circle cx={x} cy={390 - (i % 2) * 14} r={42 + (i % 2) * 8} fill="#123a80" />
          <circle cx={x + 18} cy={372 - (i % 2) * 14} r="26" fill="#1d4590" />
        </g>
      ))}
      <path d="M0,600 L0,500 C260,486 540,486 800,500 L800,600 Z" fill="#123a80" />
      <path d="M330,600 L370,454 L430,454 L470,600 Z" fill="#e4eef8" opacity="0.4" />
    </>
  );
}

export function SceneSvg({ name, className, title }: { name: SceneName; className?: string; title?: string }) {
  const rawId = useId();
  const id = `sc${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {name !== "nyc" && name !== "london" && <Defs id={id} />}
      {name === "alps" && <Alps id={id} lake={false} />}
      {name === "lake" && <Alps id={id} lake />}
      {name === "summit" && <Summit id={id} />}
      {name === "trail" && <Trail id={id} />}
      {name === "campus" && <Campus id={id} />}
      {(name === "nyc" || name === "london") && <Skyline id={id} city={name} />}
    </svg>
  );
}
