export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function statusOf(err: unknown, fallback = 500) {
  if (err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number") {
    return (err as { status: number }).status;
  }
  return fallback;
}

export function messageOf(err: unknown, fallback = "Something went wrong.") {
  return err instanceof Error ? err.message : fallback;
}
