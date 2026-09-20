import { describe, expect, it } from "vitest";

import { getAuthRedirectOptions } from "./auth-redirect";

describe("auth redirect", () => {
  it("lets Expo Linking generate the Expo Go exp callback", () => {
    expect(getAuthRedirectOptions("expo-go")).toEqual({});
  });

  it("keeps the stable native callback for builds", () => {
    expect(getAuthRedirectOptions("native")).toEqual({
      isTripleSlashed: true,
      scheme: "tvlore",
    });
  });
});
