import { describe, expect, it } from "vitest";

import { getActiveTab, getTabStackScreenOptions, getVisibleTab } from "./app-tabs";
import { isBackPanStart, shouldCompleteBackPan } from "./navigation-gestures";

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

  it("keeps the previous tab visible on detail routes", () => {
    expect(getVisibleTab("/movies/123", "search")).toBe("search");
    expect(getVisibleTab("/shows/123/seasons/1", "library")).toBe("library");
    expect(getVisibleTab("/episodes/123", "paths")).toBe("paths");
    expect(getVisibleTab("/movies/123", null)).toBe("library");
  });

  it("hides tabs during auth callback routes", () => {
    expect(getVisibleTab("/auth/callback", "profile")).toBeNull();
  });
});

describe("navigation gestures", () => {
  it("starts back pan only from an edge with horizontal intent", () => {
    expect(isBackPanStart({ canGoBack: true, dx: 24, dy: 2, startX: 12, width: 390 })).toBe(true);
    expect(isBackPanStart({ canGoBack: true, dx: -24, dy: 2, startX: 382, width: 390 })).toBe(true);
    expect(isBackPanStart({ canGoBack: true, dx: 24, dy: 2, startX: 100, width: 390 })).toBe(false);
    expect(isBackPanStart({ canGoBack: false, dx: 24, dy: 2, startX: 12, width: 390 })).toBe(false);
  });

  it("completes back pan only after a deliberate swipe", () => {
    expect(shouldCompleteBackPan(90, 8, 0.1)).toBe(true);
    expect(shouldCompleteBackPan(40, 8, 0.6)).toBe(true);
    expect(shouldCompleteBackPan(90, 80, 0.6)).toBe(false);
    expect(shouldCompleteBackPan(28, 8, 0.6)).toBe(false);
    expect(shouldCompleteBackPan(40, 8, 0.1)).toBe(false);
  });
});
