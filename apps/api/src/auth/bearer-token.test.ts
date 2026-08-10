import { describe, expect, it } from "vitest";

import { getBearerToken } from "./bearer-token";

describe("getBearerToken", () => {
  it("returns the token from a bearer authorization header", () => {
    expect(getBearerToken("Bearer abc123")).toBe("abc123");
    expect(getBearerToken("bearer abc123")).toBe("abc123");
  });

  it("rejects missing or malformed authorization headers", () => {
    expect(getBearerToken(undefined)).toBeNull();
    expect(getBearerToken("")).toBeNull();
    expect(getBearerToken("Basic abc123")).toBeNull();
    expect(getBearerToken("Bearer")).toBeNull();
    expect(getBearerToken("Bearer abc123 extra")).toBeNull();
  });
});
