import type { Gender, Person } from "./types";

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

const FEMALE = {
  bg: ["#F4D6DC", "#F8E4C8", "#F3D5E4"],
  hair: ["#2A120C", "#3D1A12", "#1A0E0A"],
  cloth: ["#9B1D3A", "#B43B5A", "#7A1840"],
  skin: ["#E8B896", "#D4A07A", "#F0C4A8"],
};

const MALE = {
  bg: ["#D5E2EC", "#D0D7C8", "#D9E0EA"],
  hair: ["#1A1A1A", "#2C241C", "#111111"],
  cloth: ["#24364A", "#2E3B32", "#1E2A38"],
  skin: ["#C9956A", "#B8835C", "#D4A574"],
};

const OTHER = {
  bg: ["#EDE4D3", "#E8DCC8", "#F0E6D6"],
  hair: ["#3D2A1C", "#2F2418", "#4A3424"],
  cloth: ["#6B3A2A", "#5C4030", "#7A4A32"],
  skin: ["#D4A574", "#C9956A", "#E0B48A"],
};

function pick<T>(list: T[], h: number, offset = 0) {
  return list[(h + offset) % list.length];
}

function face(cx: number, cy: number, rx: number, ry: number, skin: string, lashes = false) {
  const eyeY = cy - 4;
  const lash = lashes
    ? `<path d="M${cx - 22} ${eyeY - 8} Q${cx - 14} ${eyeY - 16} ${cx - 6} ${eyeY - 7}" fill="none" stroke="#1A0E0A" stroke-width="1.8"/>
       <path d="M${cx + 6} ${eyeY - 7} Q${cx + 14} ${eyeY - 16} ${cx + 22} ${eyeY - 8}" fill="none" stroke="#1A0E0A" stroke-width="1.8"/>`
    : "";
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}"/>
    ${lash}
    <ellipse cx="${cx - 14}" cy="${eyeY}" rx="7" ry="8" fill="#FFFDF8"/>
    <ellipse cx="${cx + 14}" cy="${eyeY}" rx="7" ry="8" fill="#FFFDF8"/>
    <circle cx="${cx - 13}" cy="${eyeY + 1}" r="3.4" fill="#2A1810"/>
    <circle cx="${cx + 13}" cy="${eyeY + 1}" r="3.4" fill="#2A1810"/>
    <circle cx="${cx - 12}" cy="${eyeY}" r="1.1" fill="#fff"/>
    <circle cx="${cx + 14}" cy="${eyeY}" r="1.1" fill="#fff"/>
    <path d="M${cx - 8} ${cy + 16} Q${cx} ${cy + 22} ${cx + 8} ${cy + 16}" fill="none" stroke="#A86B52" stroke-width="2" stroke-linecap="round"/>
    <path d="M${cx - 4} ${cy + 6} Q${cx} ${cy + 10} ${cx + 4} ${cy + 6}" fill="#E8A090" opacity="0.55"/>
  `;
}

function femalePortrait(bg: string, hair: string, cloth: string, skin: string, gold: string) {
  return `
    <rect width="240" height="200" fill="${bg}"/>
    <circle cx="120" cy="210" r="90" fill="${cloth}"/>
    <path d="M28 70 C40 8 88 -8 120 8 C152 -8 200 8 212 70 C220 130 198 168 176 150 C160 70 80 70 64 150 C42 168 20 130 28 70Z" fill="${hair}"/>
    ${face(120, 92, 46, 54, skin, true)}
    <path d="M48 118 C58 188 78 210 120 216 C162 210 182 188 192 118 C198 158 186 198 168 188 C148 118 92 118 72 188 C54 198 42 158 48 118Z" fill="${hair}"/>
    <path d="M74 70 C88 48 104 42 120 42 C136 42 152 48 166 70 C158 52 140 38 120 38 C100 38 82 52 74 70Z" fill="${hair}"/>
    <circle cx="74" cy="112" r="7" fill="${gold}"/>
    <circle cx="74" cy="124" r="3.2" fill="${gold}"/>
    <circle cx="166" cy="112" r="7" fill="${gold}"/>
    <circle cx="166" cy="124" r="3.2" fill="${gold}"/>
    <circle cx="120" cy="58" r="4" fill="#9B1D3A"/>
    <path d="M86 148 C98 138 110 134 120 134 C130 134 142 138 154 148 C168 170 176 200 176 200 L64 200 C64 200 72 170 86 148Z" fill="${cloth}"/>
    <path d="M86 150 C102 136 112 132 120 132 C128 132 138 136 154 150" fill="none" stroke="${gold}" stroke-width="3.5"/>
  `;
}

function malePortrait(bg: string, hair: string, cloth: string, skin: string, shirt: string) {
  return `
    <rect width="240" height="200" fill="${bg}"/>
    <path d="M44 200 L70 142 C82 122 98 112 120 112 C142 112 158 122 170 142 L196 200Z" fill="${cloth}"/>
    <path d="M96 128 L108 168 L120 152 L132 168 L144 128" fill="${shirt}"/>
    <path d="M108 168 L120 200 L132 168" fill="${shirt}" opacity="0.7"/>
    <path d="M62 78 C74 28 96 18 120 18 C144 18 166 28 178 78 C182 102 174 112 164 106 C146 70 94 70 76 106 C66 112 58 102 62 78Z" fill="${hair}"/>
    ${face(120, 90, 44, 52, skin, false)}
    <path d="M84 58 H156 V72 C148 64 136 60 120 60 C104 60 92 64 84 72Z" fill="${hair}"/>
    <path d="M80 128 C92 150 106 160 120 160 C134 160 148 150 160 128 C152 146 138 158 120 158 C102 158 88 146 80 128Z" fill="${hair}"/>
    <path d="M102 132 Q120 144 138 132" fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round"/>
    <path d="M70 142 C86 128 102 122 120 122 C138 122 154 128 170 142" fill="none" stroke="${cloth}" stroke-width="10" stroke-linecap="round"/>
  `;
}

function otherPortrait(bg: string, hair: string, cloth: string, skin: string, gold: string) {
  return `
    <rect width="240" height="200" fill="${bg}"/>
    <path d="M54 78 C68 22 96 12 120 12 C144 12 172 22 186 78 C192 118 178 138 164 130 C146 78 94 78 76 130 C62 138 48 118 54 78Z" fill="${hair}"/>
    ${face(120, 92, 45, 52, skin, false)}
    <path d="M78 200 L92 146 C100 128 110 120 120 120 C130 120 140 128 148 146 L162 200Z" fill="${cloth}"/>
    <path d="M78 148 C96 132 110 126 120 126 C130 126 144 132 162 148" fill="none" stroke="${gold}" stroke-width="3"/>
  `;
}

export function makePortrait(name: string, gender: Gender): string {
  const h = hash(`${name}:${gender}`);
  const gold = "#C9A227";
  let body = "";
  if (gender === "female") {
    body = femalePortrait(pick(FEMALE.bg, h), pick(FEMALE.hair, h, 1), pick(FEMALE.cloth, h, 2), pick(FEMALE.skin, h, 3), gold);
  } else if (gender === "male") {
    body = malePortrait(pick(MALE.bg, h), pick(MALE.hair, h, 1), pick(MALE.cloth, h, 2), pick(MALE.skin, h, 3), "#E8EEF2");
  } else {
    body = otherPortrait(pick(OTHER.bg, h), pick(OTHER.hair, h, 1), pick(OTHER.cloth, h, 2), pick(OTHER.skin, h, 3), gold);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="280" viewBox="0 0 240 200">${body}</svg>`;
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
