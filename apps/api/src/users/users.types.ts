export type UserDto = {
  availabilityCountry: string;
  createdAt: string;
  displayName: string;
  id: string;
};

export type UpdateUserInput = {
  availabilityCountry: string;
};

export type DeleteUserResponseDto = {
  deleted: true;
};

export type AccountDeletionStatusDto = {
  configured: boolean;
};
