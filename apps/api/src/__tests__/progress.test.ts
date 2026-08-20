import { describe, expect, it } from "vitest";

import { calculatePercentComplete, getShowProgressStatus, toShowProgress } from "../progress";

describe("calculatePercentComplete", () => {
  it("returns zero when there is no persisted denominator", () => {
    expect(calculatePercentComplete(0, 0)).toBe(0);
  });

  it("rounds watched progress", () => {
    expect(calculatePercentComplete(2, 3)).toBe(67);
  });
});

describe("getShowProgressStatus", () => {
  it("keeps shows without watched episodes as not started", () => {
    expect(getShowProgressStatus(0, 0)).toBe("not_started");
    expect(getShowProgressStatus(0, 10)).toBe("not_started");
  });

  it("marks partial progress as watching", () => {
    expect(getShowProgressStatus(3, 10)).toBe("watching");
  });

  it("marks fully watched persisted episodes as completed", () => {
    expect(getShowProgressStatus(10, 10)).toBe("completed");
  });
});

describe("toShowProgress", () => {
  it("excludes specials from show-level progress", () => {
    const progress = toShowProgress({
      id: "show-1",
      seasons: [
        {
          episodes: [
            {
              episodeNumber: 1,
              id: "special-1",
              seasonNumber: 0,
              title: "Special",
              watches: [],
            },
          ],
          seasonNumber: 0,
        },
        {
          episodes: [
            {
              episodeNumber: 1,
              id: "episode-1",
              seasonNumber: 1,
              title: "Pilot",
              watches: [{ watchedAt: new Date("2026-08-14T00:00:00.000Z") }],
            },
            {
              episodeNumber: 2,
              id: "episode-2",
              seasonNumber: 1,
              title: "Second",
              watches: [],
            },
          ],
          seasonNumber: 1,
        },
      ],
    });

    expect(progress).toMatchObject({
      nextEpisode: {
        episodeNumber: 2,
        id: "episode-2",
        seasonNumber: 1,
        title: "Second",
      },
      percentComplete: 50,
      seasons: [
        {
          percentComplete: 50,
          seasonNumber: 1,
          totalEpisodeCount: 2,
          watchedEpisodeCount: 1,
        },
      ],
      totalEpisodeCount: 2,
      watchedEpisodeCount: 1,
    });
  });
});
