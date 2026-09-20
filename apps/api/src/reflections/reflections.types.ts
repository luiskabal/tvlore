export type ReflectionMediaType = "episode" | "movie" | "show";

export type WatchReaction =
  | "loved"
  | "liked"
  | "surprised"
  | "moved"
  | "tense"
  | "scared"
  | "amused"
  | "confused"
  | "disappointed"
  | "mixed"
  | "not_for_me";

export type FavoriteCharacterRole = "lead" | "supporting" | "ensemble" | "other";

export type WatchReflectionInput = {
  comment: string | null;
  favoriteCharacter: string | null;
  favoriteCharacterRole: FavoriteCharacterRole | null;
  rating: number;
  reaction: WatchReaction;
};

export type WatchReflectionDto = {
  comment: string | null;
  favoriteCharacter: string | null;
  favoriteCharacterRole: FavoriteCharacterRole | null;
  reaction: WatchReaction;
  updatedAt: string;
};

export type WatchReflectionResponseDto = WatchReflectionDto & {
  id: string;
  mediaType: ReflectionMediaType;
  rating: number;
};
