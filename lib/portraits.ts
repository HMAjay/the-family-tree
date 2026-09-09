import type { Gender } from "./types";

const PALETTES = [
  ["#6B1D2A", "#C4A35A", "#F3E6C9"],
  ["#4A1C28", "#D4AF37", "#EDE4D3"],
  ["#5C2E0A", "#B8860B", "#F6EBD8"],
  ["#3D1F14", "#A67C52", "#F0E4CC"],
  ["#7A2E1F", "#C9A227", "#F7F0E2"],
  ["#2F4A3A", "#C4A35A", "#EFE6D4"],
  ["#4E342E", "#D4B483", "#F5EBDA"],
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

export function makePortrait(name: string, gender: Gender): string {
  const h = hash(name);
  const [maroon, gold, ivory] = PALETTES[h % PALETTES.length];
  const ini = initials(name);
  const hair =
    gender === "female"
      ? `<path d="M48 92 Q120 28 192 92 Q186 150 168 128 Q120 70 72 128 Q54 150 48 92Z" fill="${maroon}" opacity="0.88"/>`
      : `<path d="M62 86 Q120 40 178 86 Q176 118 168 112 Q120 62 72 112 Q64 118 62 86Z" fill="${maroon}" opacity="0.9"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="380" viewBox="0 0 240 280">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ivory}"/>
      <stop offset="100%" stop-color="${gold}" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#fff8e7" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${maroon}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="240" height="280" fill="url(#bg)"/>
  <rect x="8" y="8" width="224" height="264" fill="none" stroke="${gold}" stroke-width="2.2"/>
  <rect x="14" y="14" width="212" height="252" fill="none" stroke="${maroon}" stroke-width="0.6" opacity="0.45"/>
  <circle cx="120" cy="118" r="70" fill="url(#glow)"/>
  ${hair}
  <ellipse cx="120" cy="128" rx="42" ry="48" fill="#E8C4A8"/>
  <ellipse cx="120" cy="210" rx="58" ry="46" fill="${maroon}"/>
  <text x="120" y="256" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="${gold}" letter-spacing="3">${ini}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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
