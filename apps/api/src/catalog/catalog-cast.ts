import type { CatalogCastMemberDto, CatalogCastResponseDto } from "./catalog.types";

const maxCastItems = 30;

export function toMovieCastResponse(value: unknown): CatalogCastResponseDto {
  return {
    items: toCastItems(getArrayField(value, "cast")),
  };
}

export function toShowCastResponse(value: unknown): CatalogCastResponseDto {
  return {
    items: toCastItems(getArrayField(value, "cast")),
  };
}

export function toEpisodeCastResponse(value: unknown): CatalogCastResponseDto {
  const credits = isRecord(value) && isRecord(value.credits) ? value.credits : null;
  const cast = [
    ...getArrayField(credits, "cast"),
    ...getArrayField(credits, "guest_stars"),
    ...getArrayField(value, "guest_stars"),
  ];

  return {
    items: toCastItems(cast),
  };
}

function toCastItems(values: unknown[]): CatalogCastMemberDto[] {
  const seen = new Set<string>();

  return values
    .map(toCastItem)
    .filter((item): item is CatalogCastMemberDto => {
      if (!item) {
        return false;
      }

      const key = `${item.id}:${item.characterName}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((left, right) => left.order - right.order || left.actorName.localeCompare(right.actorName))
    .slice(0, maxCastItems);
}

function toCastItem(value: unknown): CatalogCastMemberDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getPositiveInteger(value.id);
  const actorName = getString(value.name);
  const characterName = getCharacterName(value);

  if (id === null || !actorName || !characterName) {
    return null;
  }

  return {
    actorName,
    characterName,
    id: String(id),
    order: getNonNegativeInteger(value.order) ?? getNonNegativeInteger(value.total_episode_count) ?? maxCastItems,
    profilePath: getString(value.profile_path),
  };
}

function getCharacterName(value: Record<string, unknown>) {
  const directCharacter = getString(value.character);

  if (directCharacter) {
    return directCharacter;
  }

  const roles = Array.isArray(value.roles) ? value.roles : [];
  const names = roles
    .map((role) => isRecord(role) ? getString(role.character) : null)
    .filter((name): name is string => Boolean(name));

  return names[0] ?? null;
}

function getArrayField(value: unknown, field: string) {
  if (!isRecord(value)) {
    return [];
  }

  const fieldValue = value[field];

  return Array.isArray(fieldValue) ? fieldValue : [];
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function getNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
