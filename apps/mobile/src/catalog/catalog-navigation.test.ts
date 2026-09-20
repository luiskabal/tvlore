import { afterEach, describe, expect, it, vi } from "vitest";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("expo-router", () => ({ router: routerMock }));

import { openCatalogDetail, settleCatalogDetailNavigation } from "./catalog-navigation";

describe("catalog detail navigation", () => {
  afterEach(() => {
    settleCatalogDetailNavigation("movie", "movie-1");
    settleCatalogDetailNavigation("show", "show-1");
    vi.clearAllMocks();
  });

  it("replaces a pending detail with the latest tapped title", () => {
    openCatalogDetail("movie", "movie-1");
    openCatalogDetail("show", "show-1");

    expect(routerMock.push).toHaveBeenCalledWith({ pathname: "/movies/[id]", params: { id: "movie-1" } });
    expect(routerMock.replace).toHaveBeenCalledWith({ pathname: "/shows/[id]", params: { id: "show-1" } });
  });

  it("allows a new push after the current detail has mounted", () => {
    openCatalogDetail("movie", "movie-1");
    settleCatalogDetailNavigation("movie", "movie-1");
    openCatalogDetail("show", "show-1");

    expect(routerMock.push).toHaveBeenCalledTimes(2);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
