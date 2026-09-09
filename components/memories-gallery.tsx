"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useFamilyStore } from "@/store/family-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MediaType } from "@/lib/types";

export function MemoriesGallery() {
  const memories = useFamilyStore((s) => s.memories);
  const people = useFamilyStore((s) => s.people);
  const addMemory = useFamilyStore((s) => s.addMemory);
  const [active, setActive] = useState<string | null>(null);
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [media, setMedia] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const item = memories.find((m) => m.id === active);

  return (
    <div className="mx-auto max-w-6xl px-4 py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.3em] text-gold uppercase">Memories That Live On</p>
          <h1 className="font-heading mt-2 text-5xl text-maroon">What the album still holds</h1>
        </div>
        <Button className="rounded-full bg-maroon text-ivory" onClick={() => setForm(true)}>
          Add a memory
        </Button>
      </div>
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {memories.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setActive(m.id)}
            className={`gold-border mb-4 w-full break-inside-avoid overflow-hidden rounded-2xl border text-left ${m.vintage ? "film-grain" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.media} alt="" className={`w-full object-cover ${m.vintage ? "sepia-[0.35]" : ""}`} />
            <div className="p-4">
              <p className="font-heading text-xl text-maroon">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.date?.slice(0, 4)} · {m.mediaType}</p>
            </div>
          </motion.button>
        ))}
      </div>
      {!memories.length && (
        <p className="mt-12 text-center text-muted-foreground">The album is empty. Begin with one photograph.</p>
      )}

      <Dialog open={Boolean(item)} onOpenChange={() => setActive(null)}>
        <DialogContent className="overflow-hidden sm:max-w-2xl">
          {item && (
            <>
              <div className={`-mx-4 -mt-4 overflow-hidden ${item.vintage ? "film-grain" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.media} alt="" className={`max-h-[50vh] w-full object-cover ${item.vintage ? "sepia-[0.4]" : ""}`} />
              </div>
              <DialogHeader>
                <DialogTitle className="font-heading text-3xl text-maroon">{item.title}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{item.date}</p>
              <p>{item.description}</p>
              <p className="text-sm">
                With{" "}
                {item.associatedPeople
                  .map((id) => people.find((p) => p.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || "the family"}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={form} onOpenChange={setForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-maroon">Place a memory in the album</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title || !media) return;
              addMemory({
                title,
                description,
                date: date || undefined,
                media,
                mediaType,
                associatedPeople: [],
                vintage: mediaType === "photo" || mediaType === "letter",
              });
              setForm(false);
              setTitle("");
              setDescription("");
              setMedia("");
            }}
          >
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="What should never be forgotten?" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <select
              className="h-8 rounded-lg border px-2 text-sm"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
            >
              <option value="photo">Photograph</option>
              <option value="letter">Letter</option>
              <option value="document">Document</option>
              <option value="video">Video still</option>
            </select>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setMedia(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
            <Button type="submit" className="bg-maroon text-ivory">
              Keep this memory
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
