import type { WatchReaction, WatchReflection, WatchReflectionInput } from "../api/tvlore-api";

export type PostWatchCheckInDraft = WatchReflectionInput;

export const reactionOptions: Array<{ label: string; value: WatchReaction }> = [
  { label: "Loved", value: "loved" },
  { label: "Good", value: "liked" },
  { label: "Mixed", value: "mixed" },
  { label: "Not for me", value: "not_for_me" },
];

export function createCheckInDraft(rating: number | null, reflection: WatchReflection | null): PostWatchCheckInDraft {
  return {
    comment: reflection?.comment ?? null,
    favoriteCharacter: reflection?.favoriteCharacter ?? null,
    rating: rating ?? 5,
    reaction: reflection?.reaction ?? "liked",
  };
}

export function normalizeCheckInDraft(draft: PostWatchCheckInDraft): PostWatchCheckInDraft {
  return {
    comment: normalizeText(draft.comment),
    favoriteCharacter: normalizeText(draft.favoriteCharacter),
    rating: draft.rating,
    reaction: draft.reaction,
  };
}

function normalizeText(value: string | null) {
  const text = value?.trim() ?? "";

  return text ? text : null;
}
