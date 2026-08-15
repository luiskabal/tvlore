import { describe, expect, it } from "vitest";

import { formatWatchCountry, getCountryFlagEmoji, getWatchCountryFromLocale } from "./watch-country";

describe("watch country", () => {
  it("extracts two-letter region subtags from locales", () => {
    expect(getWatchCountryFromLocale("es-CL")).toBe("CL");
    expect(getWatchCountryFromLocale("en_US")).toBe("US");
  });

  it("returns null when a locale does not contain a country", () => {
    expect(getWatchCountryFromLocale("es-419")).toBeNull();
    expect(getWatchCountryFromLocale("en")).toBeNull();
  });

  it("formats country codes with flag emoji labels", () => {
    expect(formatWatchCountry("cl")).toBe(`${getCountryFlagEmoji("CL")} CL`);
    expect(formatWatchCountry("US")).toBe(`${getCountryFlagEmoji("US")} US`);
  });

  it("does not render a flag for invalid country codes", () => {
    expect(getCountryFlagEmoji("Chile")).toBe("");
  });
});
