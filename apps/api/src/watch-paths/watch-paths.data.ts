import type { WatchPathDetailDto, WatchPathItemDto, WatchPathSummaryDto } from "./watch-paths.types";

type WatchPathDefinition = {
  description: string;
  id: string;
  items: Array<Omit<WatchPathItemDto, "id" | "position" | "tvloreId">>;
  title: string;
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
): WatchPathDetailDto {
  return {
    description: path.description,
    id: path.id,
    itemCount: path.items.length,
    items: path.items.map((item, index) => ({
      ...item,
      id: `${path.id}-${index + 1}`,
      position: index + 1,
      tvloreId: tvloreIdByRefKey.get(getWatchPathItemRefKey(item)) ?? null,
    })),
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
    title,
    year,
  } as const;
}
