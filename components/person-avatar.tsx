"use client";

import { useId } from "react";
import type { Gender, Person } from "@/lib/types";
import { displayPortrait, isCustomPortrait, portraitFill } from "@/lib/portraits";
import { cn } from "@/lib/utils";

function Silhouette({ gender, className }: { gender: Gender; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const { from, to } = portraitFill(gender);
  return (
    <svg viewBox="0 0 128 128" className={cn("block", className)} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="64" cy="64" r="64" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="128" height="128" fill={`url(#${uid}-bg)`} />
        <circle cx="64" cy="46" r="24" fill="#2C3A47" />
        <ellipse cx="64" cy="128" rx="46" ry="52" fill="#2C3A47" />
      </g>
    </svg>
  );
}

export function PersonAvatar({
  person,
  className,
  rounded = "full",
}: {
  person: Pick<Person, "name" | "gender" | "photo" | "customPhoto">;
  className?: string;
  rounded?: "full" | "none";
}) {
  if (isCustomPortrait(person)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displayPortrait(person)}
        alt=""
        className={cn("h-full w-full object-cover", rounded === "full" && "rounded-full", className)}
      />
    );
  }
  return <Silhouette gender={person.gender} className={cn("h-full w-full", rounded === "full" && "rounded-full", className)} />;
}
