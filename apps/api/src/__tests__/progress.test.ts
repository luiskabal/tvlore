import { describe, expect, it } from "vitest";

import { calculatePercentComplete, getShowProgressStatus } from "../progress";

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
