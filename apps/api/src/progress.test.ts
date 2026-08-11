import { describe, expect, it } from "vitest";

import { calculatePercentComplete } from "./progress";

describe("calculatePercentComplete", () => {
  it("returns zero when there is no persisted denominator", () => {
    expect(calculatePercentComplete(0, 0)).toBe(0);
  });

  it("rounds watched progress", () => {
    expect(calculatePercentComplete(2, 3)).toBe(67);
  });
});
