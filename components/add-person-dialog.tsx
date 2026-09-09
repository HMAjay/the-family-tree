"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Gender, RelationshipType } from "@/lib/types";
import { useFamilyStore } from "@/store/family-store";

export function AddPersonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const people = useFamilyStore((s) => s.people);
  const selectedId = useFamilyStore((s) => s.selectedId);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [relativeId, setRelativeId] = useState("");
  const [relType, setRelType] = useState<RelationshipType>("son");

  useEffect(() => {
    if (open) setRelativeId(selectedId ?? people[0]?.id ?? "");
  }, [open, selectedId, people]);

  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people]);

  const relationChoices = people.length
    ? (["son", "daughter", "father", "mother", "husband", "wife", "brother", "sister"] as RelationshipType[])
    : [];

  function reset() {
    setName("");
    setDob("");
    setLocation("");
    setOccupation("");
    setBiography("");
    setPhoto(undefined);
  }

  function save() {
    if (!name.trim()) return;
    addPerson(
      {
        name: name.trim(),
        gender,
        dateOfBirth: dob || undefined,
        location: location || undefined,
        occupation: occupation || undefined,
        biography: biography || undefined,
        photo,
      },
      relativeId && people.length ? { relativeId, type: relType } : undefined
    );
    reset();
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#2c1810]/40" aria-label="Close" onClick={() => onOpenChange(false)} />
      <div
        role="dialog"
        aria-labelledby="add-person-title"
        className="gold-border relative z-10 w-full max-w-md overflow-hidden rounded-3xl border bg-[#fbf6ec] shadow-2xl"
      >
        <div className="border-b border-gold/30 px-6 py-5">
          <h2 id="add-person-title" className="font-heading text-3xl text-maroon">
            {people.length ? "Add someone" : "The first ancestor"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {people.length ? "A name, a bond, and they take their place on the tree." : "Every tree begins with one person."}
          </p>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5">
          <label className="grid gap-1.5 text-sm">
            <Label>Name</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Their full name" className="h-10 rounded-xl" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <Label>Born</Label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-10 rounded-xl" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <Label>Gender</Label>
              <select
                className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          {people.length > 0 && (
            <div className="grid gap-3 rounded-2xl border border-gold/35 bg-ivory/80 p-4">
              <p className="text-xs tracking-wide text-gold uppercase">Family bond</p>
              <label className="grid gap-1.5 text-sm">
                <Label>Related to</Label>
                <select
                  className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
                  value={relativeId}
                  onChange={(e) => setRelativeId(e.target.value)}
                >
                  <option value="">Choose someone</option>
                  {sorted.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <Label>This person is their</Label>
                <select
                  className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as RelationshipType)}
                >
                  {relationChoices.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <label className="grid gap-1.5 text-sm">
            <Label>Place (optional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or village" className="h-10 rounded-xl" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <Label>Work (optional)</Label>
            <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="h-10 rounded-xl" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <Label>A few words (optional)</Label>
            <Textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={2} className="rounded-xl" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <Label>Photograph (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              className="h-10 rounded-xl"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-gold/30 px-6 py-4">
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-full bg-maroon text-ivory" disabled={!name.trim()} onClick={save}>
            Add to the tree
          </Button>
        </div>
      </div>
    </div>
  );
}
