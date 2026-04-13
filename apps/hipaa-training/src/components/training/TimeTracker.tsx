"use client";

import { useEffect, useRef } from "react";
import { loadProgress, saveProgress } from "@/lib/progressStorage";

/** Adds elapsed seconds to local progress while the app tab is open. */
export function TimeTracker() {
  const last = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.min(120, Math.round((now - last.current) / 1000));
      last.current = now;
      if (delta <= 0) return;
      const p = loadProgress();
      p.secondsInCourse += delta;
      saveProgress(p);
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
