/**
 * A printed travel poster for a destination, drawn rather than fetched.
 *
 * The assignment rules out external APIs, so there's no photo service here and
 * no network request. That constraint pushed this somewhere better than a stock
 * photo would have gone: the poster is generated *from the climate data*, so it
 * depicts the thing the list is actually built on. Lisbon in March reads mild
 * and damp; Minneapolis in January reads frozen. The sun sits lower in a cold
 * month, the rain streaks thicken with the rainy-day count, and the palette
 * shifts band by band.
 *
 * The skyline is deterministic per destination — the same city always draws the
 * same silhouette — so it works as recognisable identity without pretending to
 * be a photograph of anywhere.
 */

"use client";

import { useState } from "react";
import type { Conditions, TempBand } from "@/lib/climate";
import { photoFor } from "@/lib/photos";

/* Muted, earthy skies that sit on parchment without fighting it. */
const SKY: Record<TempBand, string> = {
  freezing: "#C4D0D8",
  cold: "#AFC0CA",
  cool: "#BFC9B4",
  mild: "#D7CBA2",
  warm: "#E0B87C",
  hot: "#D98E66",
};

const LAND: Record<TempBand, string> = {
  freezing: "#8E9BA4",
  cold: "#7D8D97",
  cool: "#6F7C63",
  mild: "#8A7B4E",
  warm: "#9A6F3C",
  hot: "#9A5733",
};

/** Deterministic per-destination pseudo-randomness. Same city, same skyline. */
function hashOf(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return Math.abs(h % 1000) / 1000;
  };
}

export function DestinationArt({
  seed,
  slug,
  city,
  conditions,
  className = "",
  height = 120,
}: {
  /** Usually the destination name — anything stable for this place. */
  seed: string;
  /** Climate-table slug, when the destination matched one. */
  slug?: string;
  /** Human name, for the photo's alt text. */
  city?: string;
  conditions: Conditions;
  className?: string;
  height?: number;
}) {
  const photo = photoFor(slug);
  const [photoFailed, setPhotoFailed] = useState(false);

  /* A real photograph when we have one for this destination, and the drawn
     poster when we don't — or when the image can't load, so the card never
     collapses to an empty box offline. */
  if (photo && !photoFailed) {
    return (
      <div
        className={`overflow-hidden border border-rule-strong bg-surface-raised ${className}`}
        style={{ height }}
      >
        {/* A plain <img>: next/image would route these through Vercel's
            optimizer, and there's nothing to optimise about a 330px thumbnail. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={city ? `${city}` : ""}
          loading="lazy"
          decoding="async"
          onError={() => setPhotoFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const rand = hashOf(seed.toLowerCase());
  const band = conditions.band;

  /* The sun climbs with the temperature: low and pale in a freezing month,
     high and large in a hot one. */
  const warmth = ["freezing", "cold", "cool", "mild", "warm", "hot"].indexOf(band);
  const sunY = 70 - warmth * 7;
  const sunR = 9 + warmth * 2;

  /* Two ranges of hills, back lighter than front, both seeded from the name. */
  const ridge = (baseY: number, steps: number) => {
    const pts: string[] = [`M0 ${baseY}`];
    for (let i = 0; i <= steps; i++) {
      const x = (320 / steps) * i;
      const y = baseY - rand() * 26 - 4;
      pts.push(`L${x.toFixed(0)} ${y.toFixed(0)}`);
    }
    pts.push("L320 120", "L0 120", "Z");
    return pts.join(" ");
  };

  const backRidge = ridge(88, 7);
  const frontRidge = ridge(103, 5);

  /* Rain: a handful of streaks for "some rain", a curtain of them for "wet". */
  const streaks =
    conditions.wetness === "wet" ? 22 : conditions.wetness === "some-rain" ? 9 : 0;

  /* Snow rather than rain once it freezes — same data, honest depiction. */
  const frozen = conditions.freezes && conditions.band === "freezing";

  return (
    <div
      className={`overflow-hidden border border-rule-strong ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 120"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        <rect width="320" height="120" fill={SKY[band]} />

        {/* Sun, or a pale winter disc */}
        <circle
          cx="248"
          cy={sunY}
          r={sunR}
          fill={frozen ? "#EDE4D4" : "#F2E2BC"}
          opacity={frozen ? 0.75 : 0.95}
        />

        <path d={backRidge} fill={LAND[band]} opacity="0.45" />
        <path d={frontRidge} fill={LAND[band]} opacity="0.85" />

        {/* Weather, drawn from the rainy-day count */}
        {Array.from({ length: streaks }, (_, i) => {
          const x = rand() * 320;
          const y = rand() * 80;
          return frozen ? (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#F6EFE3" opacity="0.8" />
          ) : (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x - 4}
              y2={y + 11}
              stroke="#F6EFE3"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* A hard horizon rule, in the spirit of a printed plate */}
        <line x1="0" y1="119" x2="320" y2="119" stroke="#2B1D16" strokeWidth="2" />
      </svg>
    </div>
  );
}
