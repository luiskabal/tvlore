import { describe, expect, it, vi } from "vitest";

import { LibraryRepository } from "../library/library.repository";
import { LibraryService } from "../library/library.service";
import type { UsersService } from "../users/users.service";

const userId = "00000000-0000-4000-8000-000000000001";

describe("LibraryService", () => {
  it("parses chronology query values before loading history", async () => {
    const cursor = "2026-08-14T10:01:00.000Z";
    const repository = {
      getChronology: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    };
    const usersService = {
      getMe: vi.fn().mockResolvedValue({ id: userId }),
    };
    const service = new LibraryService(
      repository as unknown as LibraryRepository,
      usersService as unknown as UsersService,
    );

    await expect(service.getChronology("Bearer token", { cursor, limit: "3" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });

    expect(repository.getChronology).toHaveBeenCalledWith(userId, {
      cursor: new Date(cursor),
      limit: 3,
    });
  });

  it("rejects invalid chronology query values", async () => {
    const repository = {
      getChronology: vi.fn(),
    };
    const usersService = {
      getMe: vi.fn().mockResolvedValue({ id: userId }),
    };
    const service = new LibraryService(
      repository as unknown as LibraryRepository,
      usersService as unknown as UsersService,
    );

    await expect(service.getChronology("Bearer token", { limit: "0" })).rejects.toMatchObject({
      response: { code: "VALIDATION_FAILED" },
    });
    await expect(service.getChronology("Bearer token", { cursor: "yesterday" })).rejects.toMatchObject({
      response: { code: "VALIDATION_FAILED" },
    });
    expect(repository.getChronology).not.toHaveBeenCalled();
  });
});
