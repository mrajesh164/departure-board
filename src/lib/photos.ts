/**
 * A photograph for each destination.
 *
 * These URLs were resolved once, by hand, from Wikipedia's page-summary
 * endpoint and each verified to return 200 — the running app never calls an
 * API. They're plain static image references on Wikimedia's CDN.
 *
 * All are 1280px wide. Wikipedia's summary endpoint hands back a ~330px
 * thumbnail by default, which looked soft stretched across a 150px-tall hero,
 * so each was probed upward to the largest width Wikimedia actually serves.
 * Rewriting the `NNNpx-` segment is what resizes them; if you change it, verify
 * the new width returns 200 rather than 400.
 *
 * Anything not in this table falls back to the generated climate poster in
 * DestinationArt, so an unknown destination still gets a picture.
 */

export const DESTINATION_PHOTOS: Record<string, string> = {
  // Chicago
  "chicago":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chicago_River_ferry_b.jpg/1280px-Chicago_River_ferry_b.jpg",
  // New York City
  "new-york":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/1280px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
  // Boston
  "boston":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ISH_WC_Boston4.jpg/1280px-ISH_WC_Boston4.jpg",
  // Washington, D.C.
  "washington-dc":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/12-07-13-washington-by-RalfR-08.jpg/1280px-12-07-13-washington-by-RalfR-08.jpg",
  // Detroit
  "detroit":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Detroit_Skyline_from_Windsor_2025-09-01.jpg/1280px-Detroit_Skyline_from_Windsor_2025-09-01.jpg",
  // Minneapolis
  "minneapolis":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Minneapolis_Skyline_looking_south.jpg/1280px-Minneapolis_Skyline_looking_south.jpg",
  // Atlanta
  "atlanta":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/A2ATL20250614-0721_%28cropped%29.jpg/1280px-A2ATL20250614-0721_%28cropped%29.jpg",
  // New Orleans
  "new-orleans":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/New_Orleans_from_the_Air_September_2019_-_Central_Business_District_Skyline_%28cropped%29.jpg/1280px-New_Orleans_from_the_Air_September_2019_-_Central_Business_District_Skyline_%28cropped%29.jpg",
  // Miami
  "miami":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Miami%2C_Florida%2C_Skyline_4.jpg/1280px-Miami%2C_Florida%2C_Skyline_4.jpg",
  // Austin, Texas
  "austin":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Skyline_of_Austin%2C_Texas_%28cropped%29.jpg/1280px-Skyline_of_Austin%2C_Texas_%28cropped%29.jpg",
  // Denver
  "denver":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Denver%2C_Colorado_skyline_%28cropped_3x5%29.jpg/1280px-Denver%2C_Colorado_skyline_%28cropped_3x5%29.jpg",
  // Phoenix, Arizona
  "phoenix":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Downtown_Phoenix_Aerial_Looking_Northeast.jpg/1280px-Downtown_Phoenix_Aerial_Looking_Northeast.jpg",
  // Los Angeles
  "los-angeles":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hollywood_sign_%288485145044%29.jpg/1280px-Hollywood_sign_%288485145044%29.jpg",
  // San Francisco
  "san-francisco":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zeppelin-ride-020100925-195_%285029394846%29.jpg/1280px-Zeppelin-ride-020100925-195_%285029394846%29.jpg",
  // Seattle
  "seattle":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Seattle_Center_as_night_falls.jpg/1280px-Seattle_Center_as_night_falls.jpg",
  // Honolulu
  "honolulu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2022_Views_from_Diamond_Head_02.jpg/1280px-2022_Views_from_Diamond_Head_02.jpg",
  // Toronto
  "toronto":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Toronto_Skyline_from_Snake_Island%2C_September_11_2026_%2801%29.jpg/1280px-Toronto_Skyline_from_Snake_Island%2C_September_11_2026_%2801%29.jpg",
  // Vancouver
  "vancouver":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Skyline_of_Vancouver%2C_Canada.jpg/1280px-Skyline_of_Vancouver%2C_Canada.jpg",
  // Mexico City
  "mexico-city":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sobrevuelos_CDMX_HJ2A4913_%2825514321687%29_%28cropped%29.jpg/1280px-Sobrevuelos_CDMX_HJ2A4913_%2825514321687%29_%28cropped%29.jpg",
  // London
  "london":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/1280px-London_Skyline_%28125508655%29.jpeg",
  // Paris
  "paris":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
  // Lisbon
  "lisbon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/1280px-Lisboa_-_Portugal_%2852597836992%29.jpg",
  // Barcelona
  "barcelona":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/1280px-Evening_light_over_Barcelona.jpg",
  // Rome
  "rome":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg/1280px-Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg",
  // Amsterdam
  "amsterdam":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png/1280px-Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png",
  // Berlin
  "berlin":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Museumsinsel_Berlin_Juli_2021_1_%28cropped%29_b.jpg/1280px-Museumsinsel_Berlin_Juli_2021_1_%28cropped%29_b.jpg",
  // Reykjavík
  "reykjavik":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg/1280px-Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg",
  // Tokyo
  "tokyo":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg",
  // Seoul
  "seoul":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg/1280px-%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg",
  // Delhi
  "delhi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Jama_Masjid_2011.jpg/1280px-Jama_Masjid_2011.jpg",
  // Bangkok
  "bangkok":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/4Y1A1159_Bangkok_%2833536795515%29.jpg/1280px-4Y1A1159_Bangkok_%2833536795515%29.jpg",
  // Singapore
  "singapore":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1280px-Flag_of_Singapore.svg.png",
  // Sydney
  "sydney":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/1280px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg",
};

export function photoFor(slug: string | undefined): string | undefined {
  return slug ? DESTINATION_PHOTOS[slug] : undefined;
}
