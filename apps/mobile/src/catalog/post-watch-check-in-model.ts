import type { CatalogCastMember, FavoriteCharacterRole, WatchReaction, WatchReflection, WatchReflectionInput } from "../api/tvlore-api";

export type PostWatchCheckInDraft = WatchReflectionInput;

export type PostWatchCastState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { items: CatalogCastMember[]; kind: "ready" }
  | { kind: "error"; message: string };

export const reactionOptions: Array<{ label: string; value: WatchReaction }> = [
  { label: "Loved", value: "loved" },
  { label: "Good", value: "liked" },
  { label: "Surprised", value: "surprised" },
  { label: "Moved", value: "moved" },
  { label: "Tense", value: "tense" },
  { label: "Scared", value: "scared" },
  { label: "Amused", value: "amused" },
  { label: "Confused", value: "confused" },
  { label: "Disappointed", value: "disappointed" },
  { label: "Mixed", value: "mixed" },
  { label: "Not for me", value: "not_for_me" },
];

export const characterRoleOptions: Array<{ label: string; value: FavoriteCharacterRole }> = [
  { label: "Lead", value: "lead" },
  { label: "Supporting", value: "supporting" },
  { label: "Ensemble", value: "ensemble" },
  { label: "Other", value: "other" },
];

export function createCheckInDraft(rating: number | null, reflection: WatchReflection | null): PostWatchCheckInDraft {
  return {
    comment: reflection?.comment ?? null,
    favoriteCharacter: reflection?.favoriteCharacter ?? null,
    favoriteCharacterRole: reflection?.favoriteCharacterRole ?? null,
    rating: rating ?? 5,
    reaction: reflection?.reaction ?? "liked",
  };
}

export function normalizeCheckInDraft(draft: PostWatchCheckInDraft): PostWatchCheckInDraft {
  const favoriteCharacter = normalizeText(draft.favoriteCharacter);

  return {
    comment: normalizeText(draft.comment),
    favoriteCharacter,
    favoriteCharacterRole: favoriteCharacter ? draft.favoriteCharacterRole : null,
    rating: draft.rating,
    reaction: draft.reaction,
  };
}

function normalizeText(value: string | null) {
  const text = value?.trim() ?? "";

  return text ? text : null;
}
