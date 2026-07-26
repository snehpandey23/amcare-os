"use client";

import { SiyaChat } from "@/components/siya/SiyaChat";

export default function SiyaHomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-teal-100 bg-gradient-to-b from-teal-50/80 to-transparent px-4 py-4 dark:border-teal-950 dark:from-teal-950/30">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
            Internal workforce · SiyaOS
          </p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            I&apos;m Siya — how can I help?
          </h1>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <SiyaChat />
      </div>
    </div>
  );
}
