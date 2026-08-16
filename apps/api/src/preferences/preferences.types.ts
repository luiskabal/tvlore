export type PreferenceMediaType = "episode" | "movie" | "show";

export type PreferenceMutationResponseDto = {
  id: string;
  mediaType: PreferenceMediaType;
  rating: number | null;
  updatedAt: string | null;
};
