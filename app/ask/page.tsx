"use client";

import { FamilyGuide } from "@/components/family-guide";

export default function AskPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
      <div className="gold-border h-[min(40rem,75vh)] overflow-hidden rounded-3xl border bg-card">
        <FamilyGuide />
      </div>
    </div>
  );
}
