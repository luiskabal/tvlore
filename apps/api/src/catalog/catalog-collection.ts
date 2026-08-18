import type { CatalogMovieCollectionDto, CatalogSearchResultDto } from "./catalog.types";

export function toMovieCollection(value: unknown): CatalogMovieCollectionDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = getString(value.name);

  if (!title) {
    return null;
  }

  return {
    description: getString(value.overview) ?? "Imported from TMDB collection.",
    items: getCollectionItems(value.parts),
    title,
  };
}

function getCollectionItems(value: unknown): CatalogSearchResultDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((part, index) => {
      const item = toCollectionItem(part);

      return item ? { index, item, sortDate: getSortDate(part) } : null;
    })
    .filter((part): part is { index: number; item: CatalogSearchResultDto; sortDate: string | null } => Boolean(part))
    .sort((left, right) => compareNullableDate(left.sortDate, right.sortDate) || left.index - right.index)
    .map(({ item }) => item);
}

function toCollectionItem(value: unknown): CatalogSearchResultDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const providerId = getProviderId(value.id);
  const title = getString(value.title);

  if (!providerId || !title) {
    return null;
  }

  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType: "movie",
    overview: getString(value.overview) ?? "",
    posterPath: getString(value.poster_path),
    title,
    tvloreId: null,
    year: getYear(getString(value.release_date)),
  };
}

function compareNullableDate(left: string | null, right: string | null) {
  if (left && right) {
    return left.localeCompare(right);
  }

  if (left) {
    return -1;
  }

  if (right) {
    return 1;
  }

  return 0;
}

function getSortDate(value: unknown) {
  return isRecord(value) ? getString(value.release_date) : null;
}

function getProviderId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return String(value);
  }

  return null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getYear(value: string | null) {
  if (!value) {
    return null;
  }

  const year = Number(value.slice(0, 4));

  return Number.isInteger(year) ? year : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
