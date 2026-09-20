import type { WatchPathDetailDto, WatchPathItemDto, WatchPathSummaryDto } from "./watch-paths.types";

export type WatchPathDefinition = {
  description: string;
  id: string;
  items: Array<Omit<WatchPathItemDto, "id" | "inWatchlist" | "position" | "tvloreId">>;
  source: "curated" | "user";
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
    source: "curated",
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
    source: "curated",
    title: "Star Wars Skywalker Saga",
  },
  {
    description: "The eight Harry Potter films in theatrical release order.",
    id: "harry-potter-release",
    items: [
      movie("Harry Potter and the Philosopher's Stone", 2001, "671", "Film 1"),
      movie("Harry Potter and the Chamber of Secrets", 2002, "672", "Film 2"),
      movie("Harry Potter and the Prisoner of Azkaban", 2004, "673", "Film 3"),
      movie("Harry Potter and the Goblet of Fire", 2005, "674", "Film 4"),
      movie("Harry Potter and the Order of the Phoenix", 2007, "675", "Film 5"),
      movie("Harry Potter and the Half-Blood Prince", 2009, "767", "Film 6"),
      movie("Harry Potter and the Deathly Hallows: Part 1", 2010, "12444", "Film 7"),
      movie("Harry Potter and the Deathly Hallows: Part 2", 2011, "12445", "Film 8"),
    ],
    source: "curated",
    title: "Harry Potter Saga",
  },
  {
    description: "The Lord of the Rings and Hobbit trilogies in theatrical release order.",
    id: "middle-earth-release",
    items: [
      movie("The Lord of the Rings: The Fellowship of the Ring", 2001, "120", "The Lord of the Rings 1"),
      movie("The Lord of the Rings: The Two Towers", 2002, "121", "The Lord of the Rings 2"),
      movie("The Lord of the Rings: The Return of the King", 2003, "122", "The Lord of the Rings 3"),
      movie("The Hobbit: An Unexpected Journey", 2012, "49051", "The Hobbit 1"),
      movie("The Hobbit: The Desolation of Smaug", 2013, "57158", "The Hobbit 2"),
      movie("The Hobbit: The Battle of the Five Armies", 2014, "122917", "The Hobbit 3"),
    ],
    source: "curated",
    title: "Middle-earth Saga",
  },
  {
    description: "The Hunger Games films in theatrical release order.",
    id: "hunger-games-release",
    items: [
      movie("The Hunger Games", 2012, "70160", "Film 1"),
      movie("The Hunger Games: Catching Fire", 2013, "101299", "Film 2"),
      movie("The Hunger Games: Mockingjay - Part 1", 2014, "131631", "Film 3"),
      movie("The Hunger Games: Mockingjay - Part 2", 2015, "131634", "Film 4"),
      movie("The Hunger Games: The Ballad of Songbirds & Snakes", 2023, "695721", "Prequel"),
    ],
    source: "curated",
    title: "The Hunger Games Saga",
  },
  {
    description: "The six Jurassic Park and Jurassic World films in theatrical release order.",
    id: "jurassic-park-release",
    items: [
      movie("Jurassic Park", 1993, "329", "Film 1"),
      movie("The Lost World: Jurassic Park", 1997, "330", "Film 2"),
      movie("Jurassic Park III", 2001, "331", "Film 3"),
      movie("Jurassic World", 2015, "135397", "Film 4"),
      movie("Jurassic World: Fallen Kingdom", 2018, "351286", "Film 5"),
      movie("Jurassic World Dominion", 2022, "507086", "Film 6"),
    ],
    source: "curated",
    title: "Jurassic Saga",
  },
  {
    description: "The X-Men films and connected spin-offs in theatrical release order.",
    id: "x-men-release",
    items: [
      movie("X-Men", 2000, "36657", "Film 1"),
      movie("X2", 2003, "36658", "Film 2"),
      movie("X-Men: The Last Stand", 2006, "36668", "Film 3"),
      movie("X-Men Origins: Wolverine", 2009, "2080", "Wolverine prequel"),
      movie("X-Men: First Class", 2011, "49538", "Prequel"),
      movie("The Wolverine", 2013, "76170", "Wolverine"),
      movie("X-Men: Days of Future Past", 2014, "127585", "Timeline reset"),
      movie("Deadpool", 2016, "293660", "Spin-off"),
      movie("X-Men: Apocalypse", 2016, "246655", "Prequel sequel"),
      movie("Logan", 2017, "263115", "Future epilogue"),
      movie("Deadpool 2", 2018, "383498", "Spin-off sequel"),
      movie("Dark Phoenix", 2019, "320288", "Prequel sequel"),
      movie("The New Mutants", 2020, "340102", "Spin-off"),
      movie("Deadpool & Wolverine", 2024, "533535", "Multiverse crossover"),
    ],
    source: "curated",
    title: "X-Men Saga",
  },
  {
    description: "The six Terminator films in theatrical release order; later entries explore alternate timelines.",
    id: "terminator-release",
    items: [
      movie("The Terminator", 1984, "218", "Film 1"),
      movie("Terminator 2: Judgment Day", 1991, "280", "Film 2"),
      movie("Terminator 3: Rise of the Machines", 2003, "296", "Film 3"),
      movie("Terminator Salvation", 2009, "534", "Film 4"),
      movie("Terminator Genisys", 2015, "87101", "Alternate timeline"),
      movie("Terminator: Dark Fate", 2019, "290859", "Alternate sequel"),
    ],
    source: "curated",
    title: "Terminator Saga",
  },
  {
    description: "The modern Planet of the Apes continuity in story order.",
    id: "planet-apes-reboot",
    items: [
      movie("Rise of the Planet of the Apes", 2011, "61791", "Story 1"),
      movie("Dawn of the Planet of the Apes", 2014, "119450", "Story 2"),
      movie("War for the Planet of the Apes", 2017, "281338", "Story 3"),
      movie("Kingdom of the Planet of the Apes", 2024, "653346", "Story 4"),
    ],
    source: "curated",
    title: "Planet of the Apes Reboot",
  },
  {
    description: "The core Alien universe in theatrical release order; the prequels stay in their release position.",
    id: "alien-release",
    items: [
      movie("Alien", 1979, "348", "Film 1"),
      movie("Aliens", 1986, "679", "Film 2"),
      movie("Alien 3", 1992, "8077", "Film 3"),
      movie("Alien: Resurrection", 1997, "8078", "Film 4"),
      movie("Prometheus", 2012, "70981", "Prequel"),
      movie("Alien: Covenant", 2017, "126889", "Prequel sequel"),
      movie("Alien: Romulus", 2024, "945961", "Standalone entry"),
    ],
    source: "curated",
    title: "Alien Universe",
  },
  {
    description: "The Fast & Furious films in story order, including the Hobbs & Shaw spin-off.",
    id: "fast-furious-story",
    items: [
      movie("The Fast and the Furious", 2001, "9799", "Story 1"),
      movie("2 Fast 2 Furious", 2003, "584", "Story 2"),
      movie("Fast & Furious", 2009, "13804", "Story 3"),
      movie("Fast Five", 2011, "51497", "Story 4"),
      movie("Fast & Furious 6", 2013, "82992", "Story 5"),
      movie("The Fast and the Furious: Tokyo Drift", 2006, "9615", "Story 6"),
      movie("Furious 7", 2015, "168259", "Story 7"),
      movie("The Fate of the Furious", 2017, "337339", "Story 8"),
      movie("Fast & Furious Presents: Hobbs & Shaw", 2019, "384018", "Spin-off"),
      movie("F9: The Fast Saga", 2021, "385128", "Story 9"),
      movie("Fast X", 2023, "385687", "Story 10"),
    ],
    source: "curated",
    title: "Fast & Furious Story Order",
  },
  {
    description: "The five Indiana Jones films in theatrical release order; Temple of Doom is a story prequel.",
    id: "indiana-jones-release",
    items: [
      movie("Raiders of the Lost Ark", 1981, "85", "Film 1"),
      movie("Indiana Jones and the Temple of Doom", 1984, "87", "Story prequel"),
      movie("Indiana Jones and the Last Crusade", 1989, "89", "Film 3"),
      movie("Indiana Jones and the Kingdom of the Crystal Skull", 2008, "217", "Film 4"),
      movie("Indiana Jones and the Dial of Destiny", 2023, "335977", "Film 5"),
    ],
    source: "curated",
    title: "Indiana Jones Saga",
  },
];

export function getWatchPathSummaries(): WatchPathSummaryDto[] {
  return watchPaths.map((path) => ({
    description: path.description,
    id: path.id,
    itemCount: path.items.length,
    source: path.source,
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
    source: path.source,
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
