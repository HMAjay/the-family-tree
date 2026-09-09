"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

const leaves = Array.from({ length: 28 }, (_, i) => ({
  x: 90 + Math.sin(i * 1.7) * 70 + (i % 5) * 8,
  y: 48 + (i % 7) * 10 + Math.cos(i) * 16,
  r: 5 + (i % 4),
  d: i * 0.12,
}));

const particles = Array.from({ length: 18 }, (_, i) => ({
  left: `${8 + (i * 5.1) % 84}%`,
  delay: `${(i * 0.4) % 6}s`,
  duration: `${10 + (i % 5)}s`,
  size: 2 + (i % 3),
}));

export function BanyanTree({ reveal = 1 }: { reveal?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -40]);
  const shownLeaves = useMemo(() => Math.max(4, Math.round(leaves.length * reveal)), [reveal]);

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-xl">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/80"
          style={{
            left: p.left,
            bottom: "8%",
            width: p.size,
            height: p.size,
            animation: `float-particle ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <motion.svg viewBox="0 0 200 240" className="relative z-10 h-full w-full" style={{ y }} aria-hidden>
        <defs>
          <linearGradient id="bark" x1="0" x2="1">
            <stop offset="0%" stopColor="#4a2a18" />
            <stop offset="100%" stopColor="#7a4a28" />
          </linearGradient>
          <linearGradient id="goldline" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#c4a35a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f4e4b0" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M100 228 C88 200 70 188 42 196 C55 176 78 170 92 150"
          fill="none"
          stroke="#5c3a24"
          strokeWidth="3"
          className="origin-bottom"
          style={{ strokeDasharray: 400, animation: "draw-branch 3.4s ease forwards" }}
        />
        <path
          d="M100 228 C112 204 140 190 168 198 C150 176 128 168 110 150"
          fill="none"
          stroke="#5c3a24"
          strokeWidth="3"
          style={{ strokeDasharray: 400, animation: "draw-branch 3.6s ease forwards" }}
        />
        <path
          d="M100 228 C96 170 96 120 100 78"
          fill="none"
          stroke="url(#bark)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ strokeDasharray: 400, animation: "draw-branch 2.8s ease forwards" }}
        />
        <path
          d="M100 120 C60 110 40 80 28 58"
          fill="none"
          stroke="url(#goldline)"
          strokeWidth="2.4"
          filter="url(#glow)"
          style={{ strokeDasharray: 400, animation: "draw-branch 4s ease forwards" }}
        />
        <path
          d="M100 118 C140 104 158 78 176 52"
          fill="none"
          stroke="url(#goldline)"
          strokeWidth="2.4"
          filter="url(#glow)"
          style={{ strokeDasharray: 400, animation: "draw-branch 4.2s ease forwards" }}
        />
        <path
          d="M100 100 C78 88 70 60 62 36"
          fill="none"
          stroke="#6b1d2a"
          strokeWidth="1.6"
          opacity="0.55"
          style={{ strokeDasharray: 300, animation: "draw-branch 4.6s ease forwards" }}
        />
        <path
          d="M100 96 C124 82 138 58 148 34"
          fill="none"
          stroke="#6b1d2a"
          strokeWidth="1.6"
          opacity="0.55"
          style={{ strokeDasharray: 300, animation: "draw-branch 4.8s ease forwards" }}
        />
        <ellipse cx="100" cy="70" rx="72" ry="48" fill="#2f4a3a" opacity="0.22" />
        {leaves.slice(0, shownLeaves).map((leaf, i) => (
          <motion.ellipse
            key={i}
            cx={leaf.x}
            cy={leaf.y}
            rx={leaf.r}
            ry={leaf.r * 0.7}
            fill={i % 3 === 0 ? "#3d5c45" : i % 3 === 1 ? "#6b1d2a" : "#c4a35a"}
            opacity={0.75}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.8 + leaf.d, duration: 0.8 }}
          />
        ))}
        <circle cx="100" cy="78" r="5" fill="#c4a35a" style={{ animation: "gold-pulse 3s ease-in-out infinite" }} />
      </motion.svg>
    </div>
  );
}
