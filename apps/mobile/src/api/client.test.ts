import { afterEach, describe, expect, it, vi } from "vitest";

import { clearApiReadCache, fetchCachedJson, fetchJson, fetchMutationJson } from "./client";

vi.mock("expo-constants", () => ({
  default: { expoConfig: null },
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("fetchJson", () => {
  afterEach(() => {
    clearApiReadCache();
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

  it("throws the caller error with status for non-JSON error responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("<html>bad gateway</html>", { status: 502 }),
    ));

    await expect(fetchJson("/health", isOkResponse, "Readable failure")).rejects.toThrow("Readable failure (502)");
  });

  it("throws backend error messages for API error responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        code: "ACCOUNT_DELETION_NOT_CONFIGURED",
        message: "Account deletion is not configured",
      }), { status: 503 }),
    ));

    await expect(fetchJson("/users/me", isOkResponse, "Unexpected deletion failure"))
      .rejects.toThrow("Account deletion is not configured");
  });

  it("throws the caller error for empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(null, { status: 204 }),
    ));

    await expect(fetchJson("/health", isOkResponse, "Empty failure")).rejects.toThrow("Empty failure");
  });

  it("clears cached reads after mutations", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ version: 1 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ version: 2 }), { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCachedJson("/shows/show-1", isVersionResponse, "Unexpected show"))
      .resolves.toEqual({ version: 1 });
    await expect(fetchCachedJson("/shows/show-1", isVersionResponse, "Unexpected show"))
      .resolves.toEqual({ version: 1 });
    await expect(fetchMutationJson("/catalog/resolve", isOkResponse, "Unexpected resolve"))
      .resolves.toEqual({ ok: true });
    await expect(fetchCachedJson("/shows/show-1", isVersionResponse, "Unexpected show"))
      .resolves.toEqual({ version: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

function isOkResponse(value: unknown): value is { ok: true } {
  return Boolean(value && typeof value === "object" && "ok" in value && value.ok === true);
}

function isVersionResponse(value: unknown): value is { version: number } {
  return Boolean(value && typeof value === "object" && "version" in value && typeof value.version === "number");
}
