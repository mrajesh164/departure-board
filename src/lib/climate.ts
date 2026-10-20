/**
 * Climate normals, hardcoded.
 *
 * The assignment forbids external APIs, so there is no forecast fetch here and
 * no network call anywhere in this app. Instead we ship approximate monthly
 * normals — the kind of thing printed in the back of a guidebook — and reason
 * about what to pack from those.
 *
 * That is arguably the better fit anyway: you pack for a trip you repeat, and
 * those are often months out, well past any forecast horizon. "What is March
 * usually like in Lisbon" is the real question.
 *
 * Values are approximate averages in °C and mean rainy days per month. They are
 * directional, not authoritative — good enough to decide on a coat.
 */

export type Climate = {
  slug: string;
  city: string;
  region: string;
  /** Average daily high, °C, January → December. */
  highC: number[];
  /** Average daily low, °C, January → December. */
  lowC: number[];
  /** Mean days with measurable precipitation, January → December. */
  rainDays: number[];
};

export const CLIMATES: Climate[] = [
  {
    slug: "chicago",
    city: "Chicago",
    region: "Illinois",
    highC: [0, 2, 9, 16, 22, 27, 29, 28, 24, 17, 9, 2],
    lowC: [-8, -6, -1, 5, 11, 17, 20, 19, 15, 8, 2, -5],
    rainDays: [10, 9, 11, 12, 11, 10, 10, 9, 8, 9, 10, 10],
  },
  {
    slug: "new-york",
    city: "New York",
    region: "New York",
    highC: [4, 6, 11, 17, 22, 27, 29, 28, 25, 18, 12, 6],
    lowC: [-3, -2, 2, 7, 13, 18, 21, 20, 17, 11, 6, 0],
    rainDays: [10, 9, 11, 11, 11, 11, 10, 10, 8, 8, 9, 10],
  },
  {
    slug: "boston",
    city: "Boston",
    region: "Massachusetts",
    highC: [2, 4, 8, 14, 19, 24, 28, 27, 23, 17, 11, 5],
    lowC: [-6, -5, -1, 4, 10, 15, 19, 18, 14, 8, 3, -3],
    rainDays: [11, 10, 12, 11, 11, 11, 9, 9, 8, 9, 11, 11],
  },
  {
    slug: "washington-dc",
    city: "Washington",
    region: "D.C.",
    highC: [6, 8, 13, 19, 24, 29, 31, 30, 27, 20, 14, 8],
    lowC: [-3, -2, 2, 8, 14, 19, 22, 21, 17, 10, 5, 0],
    rainDays: [9, 9, 11, 11, 11, 10, 10, 9, 8, 8, 8, 9],
  },
  {
    slug: "detroit",
    city: "Detroit",
    region: "Michigan",
    highC: [0, 2, 8, 15, 21, 26, 28, 27, 23, 16, 9, 2],
    lowC: [-8, -7, -2, 3, 9, 15, 18, 17, 13, 7, 1, -5],
    rainDays: [12, 10, 11, 12, 11, 10, 10, 9, 9, 11, 11, 12],
  },
  {
    slug: "minneapolis",
    city: "Minneapolis",
    region: "Minnesota",
    highC: [-4, -1, 6, 14, 21, 26, 28, 27, 23, 15, 5, -2],
    lowC: [-13, -11, -4, 2, 9, 15, 18, 17, 12, 5, -2, -10],
    rainDays: [9, 7, 9, 10, 12, 12, 10, 10, 9, 8, 8, 9],
  },
  {
    slug: "atlanta",
    city: "Atlanta",
    region: "Georgia",
    highC: [11, 14, 18, 23, 27, 30, 32, 31, 28, 23, 17, 12],
    lowC: [1, 3, 7, 11, 16, 20, 22, 22, 19, 13, 7, 3],
    rainDays: [11, 10, 10, 9, 9, 10, 12, 10, 8, 7, 9, 11],
  },
  {
    slug: "new-orleans",
    city: "New Orleans",
    region: "Louisiana",
    highC: [17, 19, 23, 26, 30, 32, 33, 33, 31, 27, 22, 18],
    lowC: [7, 9, 13, 16, 21, 24, 25, 25, 23, 17, 12, 8],
    rainDays: [10, 9, 9, 7, 8, 12, 15, 14, 10, 7, 8, 10],
  },
  {
    slug: "miami",
    city: "Miami",
    region: "Florida",
    highC: [25, 26, 27, 29, 31, 32, 33, 33, 32, 30, 28, 26],
    lowC: [16, 17, 19, 21, 23, 25, 25, 25, 25, 23, 20, 17],
    rainDays: [6, 6, 6, 6, 10, 15, 15, 16, 16, 12, 7, 6],
  },
  {
    slug: "austin",
    city: "Austin",
    region: "Texas",
    highC: [16, 18, 22, 26, 30, 33, 35, 36, 32, 27, 21, 17],
    lowC: [4, 6, 10, 15, 19, 23, 24, 24, 21, 15, 9, 5],
    rainDays: [7, 7, 7, 6, 8, 6, 4, 4, 6, 6, 6, 6],
  },
  {
    slug: "denver",
    city: "Denver",
    region: "Colorado",
    highC: [7, 8, 12, 16, 22, 28, 32, 31, 26, 19, 12, 7],
    lowC: [-8, -7, -3, 1, 7, 12, 16, 15, 10, 3, -3, -7],
    rainDays: [4, 5, 6, 8, 10, 8, 9, 9, 6, 5, 4, 4],
  },
  {
    slug: "phoenix",
    city: "Phoenix",
    region: "Arizona",
    highC: [19, 22, 25, 30, 35, 40, 41, 40, 37, 31, 24, 19],
    lowC: [8, 9, 12, 16, 21, 26, 29, 29, 25, 18, 12, 8],
    rainDays: [4, 4, 3, 2, 1, 1, 4, 5, 3, 3, 3, 4],
  },
  {
    slug: "los-angeles",
    city: "Los Angeles",
    region: "California",
    highC: [20, 20, 21, 23, 24, 27, 29, 30, 29, 26, 23, 20],
    lowC: [9, 9, 11, 12, 14, 16, 18, 18, 17, 15, 11, 9],
    rainDays: [6, 6, 5, 3, 1, 1, 0, 0, 1, 2, 3, 5],
  },
  {
    slug: "san-francisco",
    city: "San Francisco",
    region: "California",
    highC: [14, 16, 17, 18, 19, 21, 21, 22, 23, 22, 18, 14],
    lowC: [8, 9, 10, 10, 11, 12, 13, 13, 13, 12, 10, 8],
    rainDays: [11, 10, 9, 5, 3, 1, 0, 1, 2, 4, 8, 11],
  },
  {
    slug: "seattle",
    city: "Seattle",
    region: "Washington",
    highC: [8, 10, 12, 15, 19, 22, 25, 25, 22, 16, 11, 8],
    lowC: [2, 3, 4, 6, 10, 12, 14, 14, 12, 8, 5, 2],
    rainDays: [19, 15, 17, 14, 10, 8, 5, 5, 8, 14, 19, 19],
  },
  {
    slug: "honolulu",
    city: "Honolulu",
    region: "Hawaii",
    highC: [27, 27, 28, 28, 29, 30, 31, 31, 31, 30, 29, 28],
    lowC: [20, 20, 21, 21, 22, 23, 24, 24, 24, 23, 22, 21],
    rainDays: [10, 8, 9, 9, 7, 6, 7, 7, 7, 9, 11, 11],
  },
  {
    slug: "toronto",
    city: "Toronto",
    region: "Canada",
    highC: [-1, 0, 5, 12, 19, 24, 27, 26, 22, 14, 7, 2],
    lowC: [-7, -7, -3, 3, 9, 14, 17, 16, 12, 6, 1, -4],
    rainDays: [13, 11, 11, 11, 11, 11, 10, 10, 10, 11, 12, 13],
  },
  {
    slug: "vancouver",
    city: "Vancouver",
    region: "Canada",
    highC: [7, 8, 10, 13, 17, 20, 22, 22, 19, 13, 9, 6],
    lowC: [1, 2, 3, 6, 9, 12, 14, 14, 11, 7, 4, 1],
    rainDays: [19, 16, 17, 14, 12, 10, 6, 6, 9, 16, 20, 19],
  },
  {
    slug: "mexico-city",
    city: "Mexico City",
    region: "Mexico",
    highC: [21, 23, 25, 26, 26, 24, 23, 23, 23, 22, 22, 21],
    lowC: [6, 7, 9, 11, 12, 13, 12, 12, 12, 10, 8, 7],
    rainDays: [2, 2, 4, 7, 13, 17, 19, 18, 15, 8, 3, 2],
  },
  {
    slug: "london",
    city: "London",
    region: "United Kingdom",
    highC: [8, 8, 11, 14, 18, 21, 23, 23, 20, 15, 11, 8],
    lowC: [2, 2, 3, 5, 8, 11, 13, 13, 11, 8, 5, 3],
    rainDays: [11, 9, 9, 9, 9, 8, 8, 8, 8, 10, 11, 11],
  },
  {
    slug: "paris",
    city: "Paris",
    region: "France",
    highC: [7, 8, 12, 16, 20, 23, 25, 25, 21, 16, 11, 8],
    lowC: [3, 3, 5, 7, 11, 14, 16, 16, 13, 10, 6, 3],
    rainDays: [10, 9, 10, 9, 10, 8, 8, 7, 8, 10, 11, 11],
  },
  {
    slug: "lisbon",
    city: "Lisbon",
    region: "Portugal",
    highC: [15, 16, 18, 19, 22, 26, 28, 28, 26, 22, 18, 15],
    lowC: [8, 9, 10, 11, 13, 16, 18, 18, 17, 14, 11, 9],
    rainDays: [11, 9, 8, 9, 6, 3, 1, 1, 4, 9, 11, 12],
  },
  {
    slug: "barcelona",
    city: "Barcelona",
    region: "Spain",
    highC: [14, 15, 17, 19, 22, 26, 29, 29, 26, 22, 17, 15],
    lowC: [5, 6, 8, 10, 14, 18, 21, 21, 18, 14, 9, 6],
    rainDays: [4, 4, 5, 5, 5, 4, 2, 4, 6, 6, 6, 5],
  },
  {
    slug: "rome",
    city: "Rome",
    region: "Italy",
    highC: [13, 14, 16, 19, 24, 28, 31, 31, 27, 22, 17, 13],
    lowC: [3, 4, 6, 8, 12, 16, 18, 18, 15, 12, 8, 4],
    rainDays: [8, 8, 8, 9, 6, 4, 2, 3, 5, 8, 10, 9],
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    region: "Netherlands",
    highC: [6, 7, 10, 14, 18, 20, 22, 22, 19, 14, 10, 7],
    lowC: [1, 1, 2, 5, 8, 11, 13, 13, 11, 8, 4, 2],
    rainDays: [12, 10, 11, 9, 9, 9, 9, 9, 10, 11, 13, 13],
  },
  {
    slug: "berlin",
    city: "Berlin",
    region: "Germany",
    highC: [3, 4, 9, 15, 20, 23, 25, 25, 20, 14, 8, 4],
    lowC: [-2, -2, 1, 4, 9, 12, 14, 14, 11, 7, 3, 0],
    rainDays: [10, 8, 9, 8, 9, 8, 9, 8, 8, 9, 10, 11],
  },
  {
    slug: "reykjavik",
    city: "Reykjavík",
    region: "Iceland",
    highC: [3, 3, 4, 6, 10, 12, 14, 13, 11, 7, 4, 3],
    lowC: [-2, -2, -1, 1, 4, 7, 9, 8, 6, 3, 0, -2],
    rainDays: [13, 13, 14, 12, 10, 11, 11, 13, 13, 14, 13, 13],
  },
  {
    slug: "tokyo",
    city: "Tokyo",
    region: "Japan",
    highC: [10, 11, 14, 19, 23, 26, 30, 31, 27, 22, 17, 12],
    lowC: [1, 2, 5, 10, 15, 19, 23, 24, 21, 15, 9, 4],
    rainDays: [5, 6, 10, 11, 11, 13, 11, 9, 12, 10, 7, 5],
  },
  {
    slug: "seoul",
    city: "Seoul",
    region: "South Korea",
    highC: [2, 4, 10, 17, 23, 27, 29, 30, 26, 20, 11, 4],
    lowC: [-6, -4, 1, 7, 13, 18, 22, 23, 17, 10, 3, -4],
    rainDays: [6, 6, 7, 8, 9, 10, 16, 14, 9, 7, 9, 8],
  },
  {
    slug: "delhi",
    city: "Delhi",
    region: "India",
    highC: [20, 23, 30, 36, 39, 39, 35, 34, 34, 33, 28, 22],
    lowC: [7, 10, 15, 21, 26, 28, 27, 27, 25, 19, 12, 8],
    rainDays: [1, 2, 1, 1, 2, 5, 11, 11, 6, 1, 0, 1],
  },
  {
    slug: "bangkok",
    city: "Bangkok",
    region: "Thailand",
    highC: [32, 33, 34, 35, 34, 33, 33, 33, 32, 32, 32, 31],
    lowC: [22, 24, 26, 27, 26, 26, 26, 26, 25, 25, 24, 21],
    rainDays: [2, 2, 4, 7, 15, 16, 16, 18, 19, 15, 6, 1],
  },
  {
    slug: "singapore",
    city: "Singapore",
    region: "Singapore",
    highC: [30, 31, 32, 32, 32, 32, 31, 31, 31, 31, 31, 30],
    lowC: [23, 24, 24, 25, 25, 25, 25, 25, 24, 24, 24, 23],
    rainDays: [13, 9, 11, 14, 14, 13, 13, 14, 13, 16, 19, 18],
  },
  {
    slug: "sydney",
    city: "Sydney",
    region: "Australia",
    highC: [26, 26, 25, 23, 20, 18, 17, 19, 21, 23, 24, 26],
    lowC: [19, 19, 18, 15, 12, 9, 8, 9, 11, 14, 16, 18],
    rainDays: [12, 12, 13, 12, 12, 12, 10, 9, 10, 11, 12, 12],
  },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function findClimate(slug: string | undefined): Climate | undefined {
  if (!slug) return undefined;
  return CLIMATES.find((c) => c.slug === slug);
}

/** Search for the type-ahead on the trip form. */
export function searchClimates(query: string): Climate[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CLIMATES.filter(
    (c) =>
      c.city.toLowerCase().includes(q) || c.region.toLowerCase().includes(q),
  ).slice(0, 6);
}

/* -------------------------------------------------------------------------
   Turning numbers into conditions we can pack against
------------------------------------------------------------------------- */

export type TempBand = "freezing" | "cold" | "cool" | "mild" | "warm" | "hot";
export type Wetness = "dry" | "some-rain" | "wet";

export type Conditions = {
  highC: number;
  lowC: number;
  rainDays: number;
  band: TempBand;
  wetness: Wetness;
  /** True when the low is at or below freezing — changes the outerwear call. */
  freezes: boolean;
};

export function bandFor(highC: number): TempBand {
  if (highC <= 2) return "freezing";
  if (highC <= 10) return "cold";
  if (highC <= 17) return "cool";
  if (highC <= 24) return "mild";
  if (highC <= 30) return "warm";
  return "hot";
}

export function wetnessFor(rainDays: number): Wetness {
  if (rainDays <= 5) return "dry";
  if (rainDays <= 11) return "some-rain";
  return "wet";
}

/**
 * Conditions for a destination across the months a trip actually spans.
 * A trip over a month boundary takes the colder high and the wetter month, so
 * we pack for the harder half of the trip rather than the average.
 */
export function conditionsFor(
  climate: Climate,
  monthIndexes: number[],
): Conditions {
  const months = monthIndexes.length ? monthIndexes : [0];
  const highC = Math.min(...months.map((m) => climate.highC[m]));
  const lowC = Math.min(...months.map((m) => climate.lowC[m]));
  const rainDays = Math.max(...months.map((m) => climate.rainDays[m]));
  return {
    highC,
    lowC,
    rainDays,
    band: bandFor(highC),
    wetness: wetnessFor(rainDays),
    freezes: lowC <= 0,
  };
}

/** Manual conditions, for a destination that isn't in the table. */
export function manualConditions(
  band: TempBand,
  wetness: Wetness,
): Conditions {
  const typical: Record<TempBand, [number, number]> = {
    freezing: [-2, -9],
    cold: [7, 0],
    cool: [15, 7],
    mild: [22, 13],
    warm: [28, 18],
    hot: [35, 24],
  };
  const rain: Record<Wetness, number> = { dry: 3, "some-rain": 9, wet: 15 };
  const [highC, lowC] = typical[band];
  return {
    highC,
    lowC,
    rainDays: rain[wetness],
    band,
    wetness,
    freezes: lowC <= 0,
  };
}

export const BAND_LABEL: Record<TempBand, string> = {
  freezing: "Freezing",
  cold: "Cold",
  cool: "Cool",
  mild: "Mild",
  warm: "Warm",
  hot: "Hot",
};

export const WETNESS_LABEL: Record<Wetness, string> = {
  dry: "Mostly dry",
  "some-rain": "Some rain",
  wet: "Wet",
};

export function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** One line of plain English for the trip header. */
export function describeConditions(c: Conditions): string {
  /* Sentence case: the band opens the phrase so it's capitalised, the rest
     follows a comma so it isn't. The rainy-day count used to be appended here
     ("some rain, about 9 days that month") — too much arithmetic for a line
     that only needs to answer "do I need a coat". */
  const temp = `${toF(c.lowC)}–${toF(c.highC)}°F`;
  return `${BAND_LABEL[c.band]}, ${temp}, ${WETNESS_LABEL[c.wetness].toLowerCase()}`;
}
