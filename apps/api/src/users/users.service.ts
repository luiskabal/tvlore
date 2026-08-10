import { Injectable } from "@nestjs/common";

export type UserDto = {
  id: string;
  displayName: string;
  createdAt: string;
};

@Injectable()
export class UsersService {
  getMe(): UserDto {
    return {
      id: "00000000-0000-4000-8000-000000000001",
      displayName: "Demo User",
      createdAt: "2026-08-10T00:00:00.000Z",
    };
  }
}
