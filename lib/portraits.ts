import type { Gender, Person } from "./types";

const FEMALE_PALETTES = [
  ["#7A1F3D", "#E8B4B8", "#C4A35A", "#F7EFE4"],
  ["#8B2E4A", "#F0C4C8", "#D4AF37", "#FBF4EA"],
  ["#6B1D3A", "#E2A8B0", "#C9A227", "#F6EBD8"],
];

const MALE_PALETTES = [
  ["#2C3A4A", "#8FA4B8", "#C4A35A", "#E8EEF2"],
  ["#243447", "#6E8499", "#D4AF37", "#E6EDF3"],
  ["#1F3347", "#7B93A8", "#C9A227", "#EAF0F5"],
];

const OTHER_PALETTES = [
  ["#4A1C28", "#C4A35A", "#D4B483", "#F5EBDA"],
  ["#3D5C45", "#C4A35A", "#A67C52", "#EFE6D4"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function femaleFigure(skin: string, hair: string, cloth: string, gold: string) {
  return `
    <ellipse cx="120" cy="168" rx="78" ry="28" fill="${cloth}" opacity="0.25"/>
    <path d="M38 92 C48 28 92 18 120 22 C148 18 192 28 202 92 C208 150 186 168 168 158 C150 88 90 88 72 158 C54 168 32 150 38 92Z" fill="${hair}"/>
    <path d="M52 150 C70 210 90 232 120 236 C150 232 170 210 188 150" fill="${hair}"/>
    <ellipse cx="120" cy="118" rx="40" ry="48" fill="${skin}"/>
    <circle cx="78" cy="124" r="5.5" fill="${gold}"/>
    <circle cx="78" cy="124" r="2.2" fill="#fff6d8"/>
    <circle cx="162" cy="124" r="5.5" fill="${gold}"/>
    <circle cx="162" cy="124" r="2.2" fill="#fff6d8"/>
    <circle cx="120" cy="96" r="3.2" fill="${cloth}"/>
    <path d="M86 214 C96 176 108 168 120 168 C132 168 144 176 154 214 C170 232 176 258 176 258 L64 258 C64 258 70 232 86 214Z" fill="${cloth}"/>
    <path d="M86 214 C100 196 110 190 120 190 C130 190 140 196 154 214" fill="none" stroke="${gold}" stroke-width="3"/>
    <circle cx="120" cy="202" r="4" fill="${gold}"/>
    <path d="M104 202 Q120 216 136 202" fill="none" stroke="${gold}" stroke-width="2"/>
  `;
}

function maleFigure(skin: string, hair: string, cloth: string, accent: string) {
  return `
    <ellipse cx="120" cy="168" rx="70" ry="24" fill="${cloth}" opacity="0.2"/>
    <path d="M64 78 C78 36 102 32 120 32 C138 32 162 36 176 78 C180 102 174 108 166 104 C140 70 100 70 74 104 C66 108 60 102 64 78Z" fill="${hair}"/>
    <ellipse cx="120" cy="116" rx="38" ry="46" fill="${skin}"/>
    <rect x="86" y="78" width="68" height="14" rx="4" fill="${hair}"/>
    <path d="M86 148 C96 162 108 168 120 168 C132 168 144 162 154 148 C148 156 136 162 120 162 C104 162 92 156 86 148Z" fill="${hair}" opacity="0.92"/>
    <path d="M108 138 Q120 146 132 138" fill="none" stroke="${hair}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M78 200 C88 172 102 164 120 164 C138 164 152 172 162 200 C176 228 184 258 184 258 L56 258 C56 258 64 228 78 200Z" fill="${cloth}"/>
    <path d="M96 164 L104 214 L120 200 L136 214 L144 164" fill="${accent}" opacity="0.95"/>
    <path d="M104 214 L120 258 L136 214" fill="${accent}" opacity="0.55"/>
  `;
}

function otherFigure(skin: string, hair: string, cloth: string, gold: string) {
  return `
    <path d="M56 86 C70 36 100 28 120 28 C140 28 170 36 184 86 C188 124 176 140 164 134 C140 86 100 86 76 134 C64 140 52 124 56 86Z" fill="${hair}"/>
    <ellipse cx="120" cy="120" rx="40" ry="47" fill="${skin}"/>
    <path d="M82 208 C94 174 106 166 120 166 C134 166 146 174 158 208 C170 232 176 258 176 258 L64 258 C64 258 70 232 82 208Z" fill="${cloth}"/>
    <path d="M82 208 C96 192 108 186 120 186 C132 186 144 192 158 208" fill="none" stroke="${gold}" stroke-width="2.5"/>
  `;
}

export function makePortrait(name: string, gender: Gender): string {
  const h = hash(`${name}:${gender}`);
  const palettes = gender === "female" ? FEMALE_PALETTES : gender === "male" ? MALE_PALETTES : OTHER_PALETTES;
  const [primary, secondary, gold, ivory] = palettes[h % palettes.length];
  const skin = gender === "female" ? "#E6B48A" : gender === "male" ? "#C9956A" : "#D4A574";
  const ini = initials(name);
  const figure =
    gender === "female"
      ? femaleFigure(skin, primary, primary, gold)
      : gender === "male"
        ? maleFigure(skin, "#1C2833", primary, ivory)
        : otherFigure(skin, primary, primary, gold);
  const label = gender === "female" ? "♀" : gender === "male" ? "♂" : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="380" viewBox="0 0 240 280">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ivory}"/>
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="240" height="280" fill="url(#bg)"/>
  <rect x="8" y="8" width="224" height="264" fill="none" stroke="${gold}" stroke-width="3"/>
  <rect x="16" y="16" width="208" height="248" fill="none" stroke="${primary}" stroke-width="1" opacity="0.45"/>
  ${figure}
  <text x="28" y="44" font-size="22" fill="${primary}">${label}</text>
  <text x="120" y="268" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${primary}" letter-spacing="2">${ini}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function displayPortrait(person: Pick<Person, "name" | "gender" | "photo">): string {
  if (person.photo && !person.photo.startsWith("data:image/svg+xml")) return person.photo;
  return makePortrait(person.name, person.gender);
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
