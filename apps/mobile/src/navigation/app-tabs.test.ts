import { describe, expect, it } from "vitest";

import { getActiveTab, getTabStackScreenOptions } from "./app-tabs";

describe("app tabs", () => {
  it("maps root tab routes to active tabs", () => {
    expect(getActiveTab("/library")).toBe("library");
    expect(getActiveTab("/search")).toBe("search");
    expect(getActiveTab("/recommendations")).toBe("search");
    expect(getActiveTab("/popular")).toBe("search");
    expect(getActiveTab("/picks")).toBe("search");
    expect(getActiveTab("/available")).toBe("search");
    expect(getActiveTab("/paths")).toBe("paths");
    expect(getActiveTab("/profile")).toBe("profile");
    expect(getActiveTab("/movies/123")).toBeNull();
  });

  it("slides forward when moving right in tab order", () => {
    expect(getTabStackScreenOptions("library", "search")).toEqual({
      animation: "slide_from_right",
      animationTypeForReplace: "push",
    });
    expect(getTabStackScreenOptions("search", "profile")).toEqual({
      animation: "slide_from_right",
      animationTypeForReplace: "push",
    });
  });

  it("slides backward when moving left in tab order", () => {
    expect(getTabStackScreenOptions("search", "library")).toEqual({
      animation: "slide_from_left",
      animationTypeForReplace: "pop",
    });
    expect(getTabStackScreenOptions("profile", "paths")).toEqual({
      animation: "slide_from_left",
      animationTypeForReplace: "pop",
    });
  });

  it("keeps default animation outside tab-to-tab moves", () => {
    expect(getTabStackScreenOptions("search", "search")).toEqual({});
    expect(getTabStackScreenOptions("search", null)).toEqual({});
    expect(getTabStackScreenOptions(null, "search")).toEqual({});
  });
});
