import { describe, expect, it } from "vitest";

import { toAuthenticatedUser } from "../supabase-user";

describe("toAuthenticatedUser", () => {
  it("maps a Supabase Auth user response", () => {
    expect(toAuthenticatedUser({
      email: "luis@example.com",
      id: "supabase-user-id",
      user_metadata: { name: "Luis" },
    })).toEqual({
      email: "luis@example.com",
      id: "supabase-user-id",
      metadata: { name: "Luis" },
    });
  });

  it("rejects invalid responses", () => {
    expect(toAuthenticatedUser(null)).toBeNull();
    expect(toAuthenticatedUser({ email: "luis@example.com" })).toBeNull();
  });
});
