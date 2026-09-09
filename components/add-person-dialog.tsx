"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RELATIONSHIP_TYPES, type Gender, type RelationshipType } from "@/lib/types";
import { useFamilyStore } from "@/store/family-store";

export function AddPersonDialog({
  open,
  onOpenChange,
  defaultRelativeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRelativeId?: string;
}) {
  const people = useFamilyStore((s) => s.people);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [relativeId, setRelativeId] = useState(defaultRelativeId ?? "");
  const [relType, setRelType] = useState<RelationshipType>("daughter");

  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people]);

  function reset() {
    setName("");
    setDob("");
    setDod("");
    setLocation("");
    setOccupation("");
    setBiography("");
    setPhoto(undefined);
    setRelativeId(defaultRelativeId ?? "");
  }

  function save() {
    if (!name.trim()) return;
    addPerson(
      {
        name: name.trim(),
        gender,
        dateOfBirth: dob || undefined,
        dateOfDeath: dod || undefined,
        location: location || undefined,
        occupation: occupation || undefined,
        biography: biography || undefined,
        photo,
      },
      relativeId ? { relativeId, type: relType } : undefined
    );
    reset();
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#2c1810]/45"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-labelledby="add-person-title"
        className="gold-border relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl"
      >
        <h2 id="add-person-title" className="font-heading text-2xl text-maroon">
          {people.length ? "Add a family member" : "Add the first ancestor"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {people.length ? "Connect them to someone already on the tree." : "Begin with one name. The rest of the family can grow from here."}
        </p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <Label>Full name</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <Label>Gender</Label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <Label>Date of birth</Label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <Label>Date of death (optional)</Label>
            <Input type="date" value={dod} onChange={(e) => setDod(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <Label>Photograph (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <Label>Occupation</Label>
              <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <Label>A few words about them</Label>
            <Textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} />
          </label>
          {people.length > 0 && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gold/40 bg-secondary/40 p-3">
              <label className="grid gap-1 text-sm">
                <Label>Related to</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={relativeId}
                  onChange={(e) => setRelativeId(e.target.value)}
                >
                  <option value="">No link yet</option>
                  {sorted.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <Label>This person is their</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as RelationshipType)}
                >
                  {RELATIONSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-maroon text-ivory" disabled={!name.trim()} onClick={save}>
              Place them on the tree
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
