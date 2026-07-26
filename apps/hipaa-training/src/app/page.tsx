"use client";

import { SiyaChat } from "@/components/siya/SiyaChat";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-teal-100 bg-teal-50/50 px-4 py-3 text-center dark:border-teal-950 dark:bg-teal-950/20">
        <h1 className="text-lg font-semibold">I&apos;m Siya — how can I help?</h1>
        <p className="text-xs text-zinc-500">Internal workforce assistant</p>
      </div>
      <div className="min-h-0 flex-1">
        <SiyaChat />
      </div>
    </div>
  );
}
