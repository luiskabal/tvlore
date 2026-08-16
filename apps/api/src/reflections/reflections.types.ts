export type ReflectionMediaType = "episode" | "movie" | "show";

export type WatchReaction = "loved" | "liked" | "mixed" | "not_for_me";

export type WatchReflectionInput = {
  comment: string | null;
  favoriteCharacter: string | null;
  rating: number;
  reaction: WatchReaction;
};

export type WatchReflectionDto = {
  comment: string | null;
  favoriteCharacter: string | null;
  reaction: WatchReaction;
  updatedAt: string;
};

export type WatchReflectionResponseDto = WatchReflectionDto & {
  id: string;
  mediaType: ReflectionMediaType;
  rating: number;
};
