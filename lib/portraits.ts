import type { Gender, Person } from "./types";

const COLORS: Record<Gender, { from: string; to: string }> = {
  male: { from: "#42A5F5", to: "#1565C0" },
  female: { from: "#F48FB1", to: "#EC407A" },
  other: { from: "#B0BEC5", to: "#78909C" },
};

const SILHOUETTE = "#2C3A47";

function silhouetteSvg(from: string, to: string, uid: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="${uid}-bg" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <clipPath id="${uid}-clip">
      <circle cx="64" cy="64" r="64"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${uid}-clip)">
    <rect width="128" height="128" fill="url(#${uid}-bg)"/>
    <circle cx="64" cy="46" r="24" fill="${SILHOUETTE}"/>
    <ellipse cx="64" cy="128" rx="46" ry="52" fill="${SILHOUETTE}"/>
  </g>
</svg>`;
}

export function makePortrait(_name: string, gender: Gender): string {
  const { from, to } = COLORS[gender] ?? COLORS.other;
  const uid = gender === "male" ? "m" : gender === "female" ? "f" : "o";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(silhouetteSvg(from, to, uid))}`;
}

export function isCustomPortrait(person: Pick<Person, "photo" | "customPhoto">): boolean {
  if (!person.customPhoto || !person.photo) return false;
  if (person.photo.startsWith("data:image/svg+xml")) return false;
  return true;
}

export function displayPortrait(person: Pick<Person, "name" | "gender" | "photo" | "customPhoto">): string {
  if (isCustomPortrait(person) && person.photo) return person.photo;
  return makePortrait(person.name, person.gender);
}

export function portraitFill(gender: Gender) {
  return COLORS[gender] ?? COLORS.other;
}

export function makeMemoryArt(title: string, year: string, motif: "home" | "wedding" | "gathering" | "letter" | "tree" | "market"): string {
  const scenes: Record<typeof motif, string> = {
    home: `<rect x="70" y="90" width="100" height="70" fill="#8B3A3A"/><polygon points="70,90 120,55 170,90" fill="#5C1A1A"/><rect x="110" y="120" width="20" height="40" fill="#C4A35A"/>`,
    wedding: `<circle cx="120" cy="110" r="36" fill="none" stroke="#C4A35A" stroke-width="3"/><circle cx="120" cy="110" r="8" fill="#6B1D2A"/><path d="M120 146 L90 190 H150Z" fill="#7A2E1F"/>`,
    gathering: `<circle cx="80" cy="140" r="16" fill="#6B1D2A"/><circle cx="120" cy="128" r="18" fill="#4A1C28"/><circle cx="160" cy="140" r="16" fill="#7A2E1F"/><rect x="50" y="170" width="140" height="10" fill="#C4A35A" opacity="0.5"/>`,
    letter: `<rect x="70" y="80" width="100" height="120" fill="#F4E4C1" stroke="#8B6914"/><path d="M70 80 L120 130 L170 80" fill="none" stroke="#6B1D2A"/>`,
    tree: `<path d="M120 200 V110" stroke="#5C2E0A" stroke-width="8"/><circle cx="120" cy="90" r="42" fill="#2F4A3A"/><circle cx="90" cy="105" r="22" fill="#3D5C45"/><circle cx="150" cy="108" r="24" fill="#35553E"/>`,
    market: `<rect x="50" y="130" width="40" height="50" fill="#C4A35A"/><rect x="100" y="110" width="44" height="70" fill="#6B1D2A"/><rect x="154" y="124" width="40" height="56" fill="#8B5A2B"/>`,
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 240 180">
  <rect width="240" height="180" fill="#E8D5B0"/>
  <rect x="10" y="10" width="220" height="160" fill="#F3E6C9" stroke="#C4A35A"/>
  ${scenes[motif]}
  <text x="120" y="168" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#5C2E0A">${title} · ${year}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
