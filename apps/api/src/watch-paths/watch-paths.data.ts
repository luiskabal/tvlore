import type { WatchPathDetailDto, WatchPathItemDto, WatchPathSummaryDto } from "./watch-paths.types";

type WatchPathDefinition = {
  description: string;
  id: string;
  items: Array<Omit<WatchPathItemDto, "id" | "inWatchlist" | "position" | "tvloreId">>;
  title: string;
};

const moviePosterPaths: Record<string, string> = {
  "11": "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
  "1724": "/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg",
  "1726": "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg",
  "1771": "/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg",
  "1891": "/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg",
  "1892": "/jQYlydvHm3kUix1f8prMucrplhm.jpg",
  "1893": "/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg",
  "1894": "/oZNPzxqM2s5DyVWab09NTQScDQt.jpg",
  "1895": "/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg",
  "10138": "/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
  "10195": "/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg",
  "24428": "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
  "68721": "/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg",
  "76338": "/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg",
  "99861": "/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg",
  "100402": "/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg",
  "102899": "/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg",
  "118340": "/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
  "140607": "/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg",
  "181808": "/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg",
  "181812": "/db32LaOibwEliAmSL2jjDF6oDdj.jpg",
  "271110": "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",
  "283995": "/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg",
  "284052": "/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg",
  "284053": "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg",
  "284054": "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
  "299534": "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
  "299536": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  "299537": "/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg",
  "315635": "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg",
  "363088": "/cFQEO687n1K6umXbInzocxcnAQz.jpg",
  "429617": "/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg",
};

const watchPaths: WatchPathDefinition[] = [
  {
    description: "MCU Phase 1-3 in theatrical release order.",
    id: "mcu-infinity-saga-release",
    items: [
      movie("Iron Man", 2008, "1726", "Phase 1"),
      movie("The Incredible Hulk", 2008, "1724", "Phase 1"),
      movie("Iron Man 2", 2010, "10138", "Phase 1"),
      movie("Thor", 2011, "10195", "Phase 1"),
      movie("Captain America: The First Avenger", 2011, "1771", "Phase 1"),
      movie("The Avengers", 2012, "24428", "Phase 1 finale"),
      movie("Iron Man 3", 2013, "68721", "Phase 2"),
      movie("Thor: The Dark World", 2013, "76338", "Phase 2"),
      movie("Captain America: The Winter Soldier", 2014, "100402", "Phase 2"),
      movie("Guardians of the Galaxy", 2014, "118340", "Phase 2"),
      movie("Avengers: Age of Ultron", 2015, "99861", "Phase 2"),
      movie("Ant-Man", 2015, "102899", "Phase 2"),
      movie("Captain America: Civil War", 2016, "271110", "Phase 3"),
      movie("Doctor Strange", 2016, "284052", "Phase 3"),
      movie("Guardians of the Galaxy Vol. 2", 2017, "283995", "Phase 3"),
      movie("Spider-Man: Homecoming", 2017, "315635", "Phase 3"),
      movie("Thor: Ragnarok", 2017, "284053", "Phase 3"),
      movie("Black Panther", 2018, "284054", "Phase 3"),
      movie("Avengers: Infinity War", 2018, "299536", "Phase 3"),
      movie("Ant-Man and the Wasp", 2018, "363088", "Phase 3"),
      movie("Captain Marvel", 2019, "299537", "Phase 3"),
      movie("Avengers: Endgame", 2019, "299534", "Phase 3 finale"),
      movie("Spider-Man: Far From Home", 2019, "429617", "Phase 3 epilogue"),
    ],
    title: "Marvel Infinity Saga",
  },
  {
    description: "The nine core Star Wars saga films in theatrical release order.",
    id: "star-wars-skywalker-release",
    items: [
      movie("Star Wars", 1977, "11", "Episode IV"),
      movie("The Empire Strikes Back", 1980, "1891", "Episode V"),
      movie("Return of the Jedi", 1983, "1892", "Episode VI"),
      movie("The Phantom Menace", 1999, "1893", "Episode I"),
      movie("Attack of the Clones", 2002, "1894", "Episode II"),
      movie("Revenge of the Sith", 2005, "1895", "Episode III"),
      movie("The Force Awakens", 2015, "140607", "Episode VII"),
      movie("The Last Jedi", 2017, "181808", "Episode VIII"),
      movie("The Rise of Skywalker", 2019, "181812", "Episode IX"),
    ],
    title: "Star Wars Skywalker Saga",
  },
];

export function getWatchPathSummaries(): WatchPathSummaryDto[] {
  return watchPaths.map((path) => ({
    description: path.description,
    id: path.id,
    itemCount: path.items.length,
    title: path.title,
  }));
}

export function getWatchPathDefinition(pathId: string) {
  return watchPaths.find((path) => path.id === pathId) ?? null;
}

export function toWatchPathDetail(
  path: WatchPathDefinition,
  tvloreIdByRefKey: Map<string, string> = new Map(),
  savedRefKeys: Set<string> = new Set(),
): WatchPathDetailDto {
  const items = path.items.map((item, index) => {
    const refKey = getWatchPathItemRefKey(item);

    return {
      ...item,
      id: `${path.id}-${index + 1}`,
      inWatchlist: savedRefKeys.has(refKey),
      position: index + 1,
      tvloreId: tvloreIdByRefKey.get(refKey) ?? null,
    };
  });

  return {
    description: path.description,
    id: path.id,
    itemCount: path.items.length,
    items,
    savedItemCount: items.filter((item) => item.inWatchlist).length,
    title: path.title,
  };
}

export function getWatchPathItemRefKey(item: Pick<WatchPathItemDto, "externalRef" | "mediaType">) {
  return `${item.mediaType}:${item.externalRef.provider}:${item.externalRef.providerId}`;
}

function movie(title: string, year: number, providerId: string, note: string) {
  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType: "movie",
    note,
    posterPath: moviePosterPaths[providerId] ?? null,
    title,
    year,
  } as const;
}
