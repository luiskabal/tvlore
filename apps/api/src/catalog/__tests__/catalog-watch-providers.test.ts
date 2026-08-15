import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseWatchCountry, toWatchProvidersResponse } from "../catalog-watch-providers";

describe("parseWatchCountry", () => {
  it("defaults to Chile and normalizes country codes", () => {
    expect(parseWatchCountry(undefined)).toBe("CL");
    expect(parseWatchCountry(" us ")).toBe("US");
  });

  it("rejects malformed country codes", () => {
    expect(() => parseWatchCountry("usa")).toThrow(BadRequestException);
    expect(() => parseWatchCountry("1A")).toThrow(BadRequestException);
  });
});

describe("toWatchProvidersResponse", () => {
  it("maps TMDB country availability buckets", () => {
    expect(toWatchProvidersResponse({
      results: {
        CL: {
          buy: [
            { logo_path: "/apple.jpg", provider_id: 2, provider_name: "Apple TV" },
          ],
          flatrate: [
            { logo_path: "/netflix.jpg", provider_id: 8, provider_name: "Netflix" },
          ],
          free: [
            { logo_path: "/pluto.jpg", provider_id: 300, provider_name: "Pluto TV" },
          ],
          link: "https://www.themoviedb.org/movie/155/watch?locale=CL",
          rent: [
            { logo_path: "/google.jpg", provider_id: 3, provider_name: "Google Play Movies" },
          ],
        },
      },
    }, "CL")).toEqual({
      country: "CL",
      link: "https://www.themoviedb.org/movie/155/watch?locale=CL",
      providers: {
        buy: [{ id: 2, logoPath: "/apple.jpg", name: "Apple TV" }],
        free: [{ id: 300, logoPath: "/pluto.jpg", name: "Pluto TV" }],
        rent: [{ id: 3, logoPath: "/google.jpg", name: "Google Play Movies" }],
        stream: [{ id: 8, logoPath: "/netflix.jpg", name: "Netflix" }],
      },
    });
  });

  it("returns empty buckets when a country is unavailable", () => {
    expect(toWatchProvidersResponse({ results: {} }, "CL")).toEqual({
      country: "CL",
      link: null,
      providers: {
        buy: [],
        free: [],
        rent: [],
        stream: [],
      },
    });
  });
});
