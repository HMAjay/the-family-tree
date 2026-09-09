"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Gender } from "@/lib/types";
import { useFamilyStore } from "@/store/family-store";

export function EditPersonDialog() {
  const people = useFamilyStore((s) => s.people);
  const editingId = useFamilyStore((s) => s.editingId);
  const openEdit = useFamilyStore((s) => s.openEdit);
  const updatePerson = useFamilyStore((s) => s.updatePerson);
  const person = people.find((p) => p.id === editingId);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [biography, setBiography] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [customPhoto, setCustomPhoto] = useState(false);

  useEffect(() => {
    if (!person) return;
    setName(person.name);
    setGender(person.gender);
    setYear(person.year ? String(person.year) : "");
    setLocation(person.location ?? "");
    setOccupation(person.occupation ?? "");
    setBiography(person.biography ?? "");
    setPhoto(person.customPhoto ? person.photo : undefined);
    setCustomPhoto(Boolean(person.customPhoto && person.photo));
  }, [person]);

  if (!person || typeof document === "undefined") return null;

  function close() {
    openEdit(null);
  }

  function save() {
    if (!name.trim() || !person) return;
    updatePerson(person.id, {
      name: name.trim(),
      gender,
      year: parseYear(year),
      location: location || undefined,
      occupation: occupation || undefined,
      biography: biography || undefined,
      photo: customPhoto ? photo : undefined,
      customPhoto,
    });
    close();
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#2c1810]/40" aria-label="Close" onClick={close} />
      <div
        role="dialog"
        aria-labelledby="edit-person-title"
        className="gold-border relative z-10 w-full max-w-md overflow-hidden rounded-3xl border bg-[#fbf6ec] shadow-2xl"
      >
        <div className="border-b border-gold/30 px-6 py-5">
          <h2 id="edit-person-title" className="font-heading text-3xl text-maroon">
            Edit details
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Update {person.name} on the family tree.</p>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5">
          <label className="grid gap-1.5 text-sm">
            <Label>Name</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <Label>Year</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={1000}
                max={2100}
                step={1}
                placeholder="1950"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-10 rounded-xl"
              />
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
          <label className="grid gap-1.5 text-sm">
            <Label>Place (optional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 rounded-xl" />
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
                reader.onload = () => {
                  setPhoto(String(reader.result));
                  setCustomPhoto(true);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-gold/30 px-6 py-4">
          <Button type="button" variant="ghost" className="rounded-full" onClick={close}>
            Cancel
          </Button>
          <Button type="button" className="rounded-full bg-maroon text-ivory" disabled={!name.trim()} onClick={save}>
            Save details
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function parseYear(value: string): number | undefined {
  const y = Number(value);
  if (!value.trim() || !Number.isFinite(y) || y < 1000 || y > 2100) return undefined;
  return Math.trunc(y);
}
