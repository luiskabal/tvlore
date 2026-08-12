import { describe, expect, it } from "vitest";

import { getDisplayName } from "../user-profile";

describe("getDisplayName", () => {
  it("prefers provider metadata names", () => {
    expect(getDisplayName({ email: "luis@example.com", id: "1", metadata: { name: " Luis " } })).toBe("Luis");
    expect(getDisplayName({ email: "luis@example.com", id: "1", metadata: { full_name: "Luis KabaL" } })).toBe("Luis KabaL");
  });

  it("falls back to email and then a generic label", () => {
    expect(getDisplayName({ email: "luis@example.com", id: "1", metadata: {} })).toBe("luis@example.com");
    expect(getDisplayName({ email: null, id: "1", metadata: {} })).toBe("TVLore User");
  });
});
