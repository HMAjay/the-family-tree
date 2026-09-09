"use client";

import { use } from "react";
import { PersonProfile } from "@/components/person-profile";

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PersonProfile id={id} />;
}
