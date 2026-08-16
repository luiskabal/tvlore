import { getCatalogDetail, getShowSeasonDetail } from "../api/tvlore-api";
import { getSupabaseAccessToken } from "../auth/supabase-auth";
import {
  getUniqueCatalogDetailRefs,
  getUniqueShowSeasonRefs,
  type CatalogDetailLookaheadRef,
  type ShowSeasonLookaheadRef,
} from "./prefetch-model";

type PrefetchOptions = {
  accessToken?: string | null;
  limit?: number;
};

export async function prefetchCatalogDetails(
  refs: readonly CatalogDetailLookaheadRef[],
  options: PrefetchOptions = {},
) {
  const items = getUniqueCatalogDetailRefs(refs, options.limit);

  if (items.length === 0) {
    return;
  }

  try {
    const token = await getAccessToken(options.accessToken);

    if (!token) {
      return;
    }

    await Promise.allSettled(items.map((item) => getCatalogDetail(token, item.mediaType, item.id)));
  } catch {
    return;
  }
}

export async function prefetchShowSeasonDetails(
  refs: readonly ShowSeasonLookaheadRef[],
  options: PrefetchOptions = {},
) {
  const items = getUniqueShowSeasonRefs(refs, options.limit);

  if (items.length === 0) {
    return;
  }

  try {
    const token = await getAccessToken(options.accessToken);

    if (!token) {
      return;
    }

    await Promise.allSettled(items.map((item) => getShowSeasonDetail(token, item.showId, item.seasonNumber)));
  } catch {
    return;
  }
}

async function getAccessToken(accessToken: string | null | undefined) {
  if (accessToken !== undefined) {
    return accessToken;
  }

  return getSupabaseAccessToken();
}
