"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [relativeId, setRelativeId] = useState(defaultRelativeId ?? "");
  const [relType, setRelType] = useState<RelationshipType>("daughter");

  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people]);

  const reset = () => {
    setName("");
    setNickname("");
    setDob("");
    setDod("");
    setLocation("");
    setOccupation("");
    setBiography("");
    setNotes("");
    setPhoto(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-maroon">Add a family member</DialogTitle>
          <DialogDescription>
            Names become roots. Fill what you know — the rest can wait.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const id = addPerson(
              {
                name: name.trim(),
                nickname: nickname || undefined,
                gender,
                dateOfBirth: dob || undefined,
                dateOfDeath: dod || undefined,
                location: location || undefined,
                occupation: occupation || undefined,
                biography: biography || undefined,
                notes: notes || undefined,
                photo,
              },
              relativeId ? { relativeId, type: relType } : undefined
            );
            reset();
            onOpenChange(false);
            router.push(`/person/${id}`);
          }}
        >
          <Field label="Full name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Raghav Sharma" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nickname">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Thatha" />
            </Field>
            <Field label="Gender">
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of birth">
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </Field>
            <Field label="Date of death (optional)">
              <Input type="date" value={dod} onChange={(e) => setDod(e.target.value)} />
            </Field>
          </div>
          <Field label="Photograph">
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
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mysuru" />
            </Field>
            <Field label="Occupation">
              <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Farmer" />
            </Field>
          </div>
          <Field label="Biography">
            <Textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} placeholder="A short remembrance..." />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
          {people.length > 0 && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gold/40 bg-secondary/40 p-3">
              <Field label="Related to">
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
              </Field>
              <Field label="This person is their">
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
              </Field>
              <p className="col-span-2 text-xs text-muted-foreground">
                Example: new person is the <em>son</em> of the selected relative. Additional kin are inferred automatically.
              </p>
            </div>
          )}
          <Button type="submit" className="mt-2 bg-maroon text-ivory hover:bg-maroon/90">
            Place them on the tree
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
