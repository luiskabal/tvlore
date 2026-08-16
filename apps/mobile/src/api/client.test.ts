import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchJson } from "./client";

vi.mock("expo-constants", () => ({
  default: { expoConfig: null },
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns guarded JSON responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson("/health", isOkResponse, "Unexpected response")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/health", undefined);
  });

  it("throws the caller error for non-JSON responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("<html>bad gateway</html>", { status: 502 }),
    ));

    await expect(fetchJson("/health", isOkResponse, "Readable failure")).rejects.toThrow("Readable failure");
  });

  it("throws the caller error for empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 204 }),
    ));

    await expect(fetchJson("/health", isOkResponse, "Empty failure")).rejects.toThrow("Empty failure");
  });
});

function isOkResponse(value: unknown): value is { ok: true } {
  return Boolean(value && typeof value === "object" && "ok" in value && value.ok === true);
}
