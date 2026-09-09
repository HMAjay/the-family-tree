"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { answerFamilyQuestion, type ChatReply } from "@/lib/chat";
import { snapshotFromStore, useFamilyStore } from "@/store/family-store";
import { cn } from "@/lib/utils";

const suggestions = [
  "Who is my grandfather?",
  "Show my ancestors",
  "Who are my cousins?",
  "How am I related to Rahul?",
  "Show my family lineage",
];

interface Msg {
  role: "user" | "guide";
  text: string;
  reply?: ChatReply;
}

export function FamilyGuide({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "guide",
      text: "I am The Family Guide. Ask me only about people recorded in this tree — I will not invent a kinship that is not there.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const setHighlight = useFamilyStore((s) => s.setHighlight);
  const router = useRouter();

  async function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    const snap = snapshotFromStore();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, snapshot: snap }),
      });
      const reply = (await res.json()) as ChatReply;
      setMessages((m) => [...m, { role: "guide", text: reply.text, reply }]);
    } catch {
      const reply = answerFamilyQuestion(snap, q);
      setMessages((m) => [...m, { role: "guide", text: reply.text, reply }]);
    } finally {
      setThinking(false);
    }
  }

  function showRel(reply: ChatReply) {
    const ids = reply.personIds;
    const pathIds = [reply.showRelationship?.fromId, ...(reply.path?.map((s) => s.toId) ?? [])].filter(
      Boolean
    ) as string[];
    setHighlight("path", ids, pathIds.length ? pathIds : ids);
    router.push("/tree");
  }

  return (
    <div className={cn("flex h-full flex-col", compact && "max-h-[70vh]")}>
      <div className="flex items-center gap-3 border-b border-gold/30 px-4 py-3">
        <span className="flex size-10 items-center justify-center rounded-full border border-gold bg-maroon text-gold">
          <TreeDeciduous className="size-5" />
        </span>
        <div>
          <p className="font-heading text-xl text-maroon">The Family Guide</p>
          <p className="text-xs text-muted-foreground">Ask Your Family — answers from the tree alone</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs text-maroon hover:bg-secondary"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-2">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-maroon text-ivory"
                : "border border-gold/30 bg-card text-foreground"
            )}
          >
            <RichText text={m.text} />
            {m.reply?.showRelationship && (
              <Button
                size="sm"
                className="mt-3 rounded-full bg-gold text-maroon hover:bg-gold/90"
                onClick={() => showRel(m.reply!)}
              >
                Show Relationship
              </Button>
            )}
          </motion.div>
        ))}
        {thinking && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <TreeDeciduous className="size-5 animate-pulse text-gold" />
            Tracing the lineage…
          </div>
        )}
      </div>
      <form
        className="flex gap-2 border-t border-gold/30 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a name on the tree…"
          className="rounded-full"
        />
        <Button type="submit" className="rounded-full bg-maroon text-ivory">
          Ask
        </Button>
      </form>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="text-maroon">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
