"use client";

import { useId } from "react";

/** Labelled range slider with a live value readout. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
        <output htmlFor={id} className="figure text-sm font-semibold text-navy">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-valuetext={format(value)}
      />
      {hint && <p className="-mt-0.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** A compact numeric input with a unit, for tools. Keeps the raw text so typing feels natural. */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  prefix,
  step = "any",
  min,
  max,
  hint,
  error,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  prefix?: string;
  step?: number | "any";
  min?: number;
  max?: number;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-ink">
        {label}
      </label>
      <div className={`flex h-10 items-center rounded-xl border bg-white px-3 focus-within:border-electric focus-within:ring-2 focus-within:ring-electric/20 ${error ? "border-error" : "border-line-strong"}`}>
        {prefix && <span className="mr-1 text-sm text-ink-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="figure w-full min-w-0 bg-transparent text-sm text-ink outline-none"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-help` : undefined}
        />
        {unit && <span className="ml-1 text-sm text-ink-muted">{unit}</span>}
      </div>
      {(error || hint) && (
        <p id={`${id}-help`} className={`mt-1 text-xs ${error ? "text-error-ink" : "text-ink-muted"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
