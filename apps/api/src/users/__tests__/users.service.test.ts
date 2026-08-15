import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { SupabaseAuthService } from "../../auth/supabase-auth.service";
import type { UsersRepository } from "../users.repository";
import { UsersService } from "../users.service";

const authenticatedUser = {
  email: "luis@example.com",
  id: "supabase-user-id",
  metadata: { full_name: "Luis KabaL" },
};

const currentUser = {
  availabilityCountry: "CL",
  createdAt: "2026-08-15T00:00:00.000Z",
  displayName: "Luis KabaL",
  id: "00000000-0000-4000-8000-000000000001",
};

describe("UsersService", () => {
  it("updates the signed-in user's availability country", async () => {
    const supabaseAuthService = {
      getUserFromAuthorizationHeader: vi.fn().mockResolvedValue(authenticatedUser),
    };
    const usersRepository = {
      upsertAuthenticatedUser: vi.fn().mockResolvedValue(currentUser),
      updateUser: vi.fn().mockResolvedValue({ ...currentUser, availabilityCountry: "US" }),
    };
    const service = new UsersService(
      supabaseAuthService as unknown as SupabaseAuthService,
      usersRepository as unknown as UsersRepository,
    );

    await expect(service.updateMe("Bearer token", { availabilityCountry: "us" }))
      .resolves.toMatchObject({ availabilityCountry: "US" });

    expect(supabaseAuthService.getUserFromAuthorizationHeader).toHaveBeenCalledWith("Bearer token");
    expect(usersRepository.upsertAuthenticatedUser).toHaveBeenCalledWith(authenticatedUser);
    expect(usersRepository.updateUser).toHaveBeenCalledWith(currentUser.id, { availabilityCountry: "US" });
  });

  it("rejects invalid availability countries before auth or persistence", async () => {
    const supabaseAuthService = {
      getUserFromAuthorizationHeader: vi.fn(),
    };
    const usersRepository = {
      upsertAuthenticatedUser: vi.fn(),
      updateUser: vi.fn(),
    };
    const service = new UsersService(
      supabaseAuthService as unknown as SupabaseAuthService,
      usersRepository as unknown as UsersRepository,
    );

    await expect(service.updateMe("Bearer token", { availabilityCountry: "Chile" }))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(supabaseAuthService.getUserFromAuthorizationHeader).not.toHaveBeenCalled();
    expect(usersRepository.upsertAuthenticatedUser).not.toHaveBeenCalled();
    expect(usersRepository.updateUser).not.toHaveBeenCalled();
  });
});
