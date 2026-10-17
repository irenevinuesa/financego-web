"use client";

import { useMemo } from "react";
import { useHydrated, useStore } from "@/lib/store";
import { incorrectQuestionIds } from "@/lib/progress";
import { Badge } from "@/components/ui/primitives";

export function ReviewCount() {
  const state = useStore();
  const hydrated = useHydrated();
  const n = useMemo(() => incorrectQuestionIds(state).length, [state]);
  if (!hydrated) return null;
  return <Badge tone={n ? "error" : "neutral"}>{n} to review</Badge>;
}
