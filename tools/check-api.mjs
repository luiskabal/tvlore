const baseUrl = process.env.TVLORE_API_BASE_URL ?? "https://tvlore-api.vercel.app";
const supabaseAccessToken = process.env.TVLORE_SUPABASE_ACCESS_TOKEN;
const missingUuid = "00000000-0000-4000-8000-000000000002";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

await checkPublicHealth();
await checkUnauthorizedRoutes();

if (supabaseAccessToken) {
  await checkAuthenticatedProductFlow(supabaseAccessToken);
} else {
  console.log("Skipping authenticated product checks: set TVLORE_SUPABASE_ACCESS_TOKEN.");
}

async function checkPublicHealth() {
  await check("/", {
    assert: (body) => {
      expectRecord(body, "root response");
      expectEqual(body.status, "ok", "root.status");
      expectEqual(body.service, "tvlore-api", "root.service");
    },
    expectedStatus: 200,
  });
  await check("/health", {
    assert: (body) => {
      expectRecord(body, "health response");
      expectEqual(body.status, "ok", "health.status");
      expectEqual(body.service, "tvlore-api", "health.service");
      expectIsoString(body.time, "health.time");
    },
    expectedStatus: 200,
  });
  await check("/health/db", {
    assert: (body) => {
      expectRecord(body, "db health response");
      expectEqual(body.status, "ok", "db health.status");
      expectEqual(body.service, "tvlore-api", "db health.service");
      expectEqual(body.database, "ok", "db health.database");
      expectIsoString(body.time, "db health.time");
    },
    expectedStatus: 200,
  });
}

async function checkUnauthorizedRoutes() {
  await checkUnauthorized("/users/me");
  await checkUnauthorized("/users/me", {
    body: JSON.stringify({ availabilityCountry: "CL" }),
    headers: { "content-type": "application/json" },
    method: "PATCH",
  });
  await checkUnauthorized("/search?query=dark");
  await checkUnauthorized("/catalog/resolve", {
    body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "70523" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  await checkUnauthorized(`/shows/${missingUuid}`);
  await checkUnauthorized(`/shows/${missingUuid}/watch-providers?country=CL`);
  await checkUnauthorized(`/shows/${missingUuid}/seasons`);
  await checkUnauthorized(`/shows/${missingUuid}/seasons/1`);
  await checkUnauthorized(`/shows/${missingUuid}/progress`);
  await checkUnauthorized(`/shows/${missingUuid}/watches`, { method: "POST" });
  await checkUnauthorized(`/shows/${missingUuid}/watches`, { method: "DELETE" });
  await checkUnauthorized(`/shows/${missingUuid}/watchlist`, { method: "POST" });
  await checkUnauthorized(`/shows/${missingUuid}/watchlist`, { method: "DELETE" });
  await checkUnauthorized(`/shows/${missingUuid}/preference`, {
    body: JSON.stringify({ rating: 5 }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });
  await checkUnauthorized(`/shows/${missingUuid}/preference`, { method: "DELETE" });
  await checkUnauthorized(`/movies/${missingUuid}`);
  await checkUnauthorized(`/movies/${missingUuid}/watch-providers?country=CL`);
  await checkUnauthorized(`/movies/${missingUuid}/watchlist`, { method: "POST" });
  await checkUnauthorized(`/movies/${missingUuid}/watchlist`, { method: "DELETE" });
  await checkUnauthorized(`/movies/${missingUuid}/preference`, {
    body: JSON.stringify({ rating: 4 }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });
  await checkUnauthorized(`/movies/${missingUuid}/preference`, { method: "DELETE" });
  await checkUnauthorized("/library");
  await checkUnauthorized("/library/chronology");
  await checkUnauthorized("/recommendations");
  await checkUnauthorized("/watch-paths");
  await checkUnauthorized("/watch-paths/mcu-infinity-saga-release");
  await checkUnauthorized("/watch-paths/mcu-infinity-saga-release/watchlist", { method: "POST" });
  await checkUnauthorized(`/episodes/${missingUuid}`);
  await checkUnauthorized(`/episodes/${missingUuid}/preference`, {
    body: JSON.stringify({ rating: 4 }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });
  await checkUnauthorized(`/episodes/${missingUuid}/preference`, { method: "DELETE" });
  await checkUnauthorized(`/episodes/${missingUuid}/watches`, { method: "POST" });
  await checkUnauthorized(`/episodes/${missingUuid}/watches`, { method: "DELETE" });
  await checkUnauthorized(`/movies/${missingUuid}/watches`, { method: "POST" });
  await checkUnauthorized(`/movies/${missingUuid}/watches`, { method: "DELETE" });
}

async function checkAuthenticatedProductFlow(token) {
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonAuthHeaders = {
    ...authHeaders,
    "content-type": "application/json",
  };
  const episodeWatchedAt = new Date().toISOString();
  const showWatchedAt = new Date(Date.now() + 500).toISOString();
  const movieWatchedAt = new Date(Date.now() + 1000).toISOString();

  const currentUser = await check("/users/me", {
    assert: assertUser,
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/users/me", {
    assert: assertValidationError,
    body: JSON.stringify({ availabilityCountry: "Chile" }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "PATCH",
  });
  await check("/users/me", {
    assert: (body) => {
      assertUser(body);
      expectEqual(body.availabilityCountry, currentUser.availabilityCountry, "user.availabilityCountry after update");
    },
    body: JSON.stringify({ availabilityCountry: currentUser.availabilityCountry }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "PATCH",
  });
  await check("/search?query=dark&types=show,movie&page=1", {
    assert: assertSearchResponse,
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/watch-paths", {
    assert: assertWatchPaths,
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/watch-paths/not-a-path", {
    assert: (body) => assertError(body, "WATCH_PATH_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check("/watch-paths/mcu-infinity-saga-release", {
    assert: assertWatchPathDetail,
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/search?query=&types=show", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check("/search?query=dark&types=book", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check("/catalog/resolve", {
    assert: assertValidationError,
    body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "0" }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check("/shows/not-a-uuid", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check("/shows/not-a-uuid/watch-providers?country=CL", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check(`/shows/${missingUuid}/watch-providers?country=CL`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check(`/movies/${missingUuid}/watch-providers?country=CL`, {
    assert: (body) => assertError(body, "MOVIE_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check("/shows/not-a-uuid/watchlist", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
    method: "POST",
  });
  await check("/shows/not-a-uuid/watches", {
    assert: assertValidationError,
    body: JSON.stringify({ watchedAt: showWatchedAt }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check("/shows/not-a-uuid/preference", {
    assert: assertValidationError,
    body: JSON.stringify({ rating: 5 }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/shows/${missingUuid}/progress`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check(`/shows/${missingUuid}/watchlist`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/shows/${missingUuid}/watches`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    body: JSON.stringify({ watchedAt: showWatchedAt }),
    expectedStatus: 404,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/shows/${missingUuid}/watches`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/shows/${missingUuid}/preference`, {
    assert: (body) => assertError(body, "SHOW_NOT_FOUND"),
    body: JSON.stringify({ rating: 5 }),
    expectedStatus: 404,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check("/episodes/not-a-uuid", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check("/episodes/not-a-uuid/preference", {
    assert: assertValidationError,
    body: JSON.stringify({ rating: 4 }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/episodes/${missingUuid}`, {
    assert: (body) => assertError(body, "EPISODE_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check(`/movies/${missingUuid}`, {
    assert: (body) => assertError(body, "MOVIE_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
  });
  await check(`/movies/${missingUuid}/watchlist`, {
    assert: (body) => assertError(body, "MOVIE_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/movies/${missingUuid}/preference`, {
    assert: (body) => assertError(body, "MOVIE_NOT_FOUND"),
    body: JSON.stringify({ rating: 4 }),
    expectedStatus: 404,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/episodes/${missingUuid}/watches`, {
    assert: (body) => assertError(body, "EPISODE_NOT_FOUND"),
    body: JSON.stringify({ watchedAt: episodeWatchedAt }),
    expectedStatus: 404,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/episodes/${missingUuid}/watches`, {
    assert: assertValidationError,
    body: JSON.stringify({ watchedAt: "today" }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/episodes/${missingUuid}/preference`, {
    assert: (body) => assertError(body, "EPISODE_NOT_FOUND"),
    body: JSON.stringify({ rating: 4 }),
    expectedStatus: 404,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/episodes/${missingUuid}/preference`, {
    assert: (body) => assertError(body, "EPISODE_NOT_FOUND"),
    expectedStatus: 404,
    headers: authHeaders,
    method: "DELETE",
  });

  const resolvedShow = await check("/catalog/resolve", {
    assert: (body) => assertResolveResponse(body, "show"),
    body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "70523" }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  const resolvedShowAgain = await check("/catalog/resolve", {
    assert: (body) => assertResolveResponse(body, "show"),
    body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "70523" }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });

  expectEqual(resolvedShowAgain.id, resolvedShow.id, "show resolve idempotency");

  await check("/search?query=dark&types=show,movie&page=1", {
    assert: (body) => {
      assertSearchResponse(body);
      const dark = body.results.find((result) => result.externalRef.providerId === "70523" && result.mediaType === "show");
      expect(Boolean(dark), "search should include Dark after resolve");
      expectEqual(dark.tvloreId, resolvedShow.id, "resolved search tvloreId");
    },
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedShow.id, "show", false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/shows/${resolvedShow.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedShow.id, "show", true),
    expectedStatus: 200,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/shows/${resolvedShow.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedShow.id, "show", true),
    expectedStatus: 200,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/shows/${resolvedShow.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedShow.id, "show", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/shows/${resolvedShow.id}/preference`, {
    assert: assertValidationError,
    body: JSON.stringify({ rating: 6 }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/shows/${resolvedShow.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedShow.id, "show", 5),
    body: JSON.stringify({ rating: 5 }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/shows/${resolvedShow.id}`, {
    assert: (body) => assertShowDetail(body, resolvedShow.id, true, 5),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/watch-providers?country=CL`, {
    assert: (body) => assertWatchProviders(body, "CL"),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/watch-providers?country=Chile`, {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/seasons`, {
    assert: (body) => assertShowSeasons(body, resolvedShow.id),
    expectedStatus: 200,
    headers: authHeaders,
  });
  const seasonDetail = await check(`/shows/${resolvedShow.id}/seasons/1`, {
    assert: (body) => assertSeasonDetail(body, resolvedShow.id, 1),
    expectedStatus: 200,
    headers: authHeaders,
  });
  const firstEpisodeId = seasonDetail.episodes[0]?.id;

  expectUuid(firstEpisodeId, "first episode id");

  await check(`/episodes/${firstEpisodeId}/preference`, {
    assert: (body) => assertPreferenceResponse(body, firstEpisodeId, "episode", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/episodes/${firstEpisodeId}`, {
    assert: (body) => assertEpisodeDetail(body, firstEpisodeId, resolvedShow.id, false, null),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/episodes/${firstEpisodeId}/preference`, {
    assert: assertValidationError,
    body: JSON.stringify({ rating: 6 }),
    expectedStatus: 400,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/episodes/${firstEpisodeId}/preference`, {
    assert: (body) => assertPreferenceResponse(body, firstEpisodeId, "episode", 4),
    body: JSON.stringify({ rating: 4 }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/episodes/${firstEpisodeId}`, {
    assert: (body) => assertEpisodeDetail(body, firstEpisodeId, resolvedShow.id, false, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/episodes/${firstEpisodeId}/watches`, {
    assert: (body) => assertEpisodeWatchResponse(body, firstEpisodeId, false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/episodes/${firstEpisodeId}/watches`, {
    assert: (body) => assertEpisodeWatchResponse(body, firstEpisodeId, true),
    body: JSON.stringify({ watchedAt: episodeWatchedAt }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/episodes/${firstEpisodeId}/watches`, {
    assert: (body) => assertEpisodeWatchResponse(body, firstEpisodeId, true),
    body: JSON.stringify({ watchedAt: episodeWatchedAt }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/episodes/${firstEpisodeId}`, {
    assert: (body) => assertEpisodeDetail(body, firstEpisodeId, resolvedShow.id, true, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/seasons/1`, {
    assert: (body) => {
      assertSeasonDetail(body, resolvedShow.id, 1);
      const episode = body.episodes.find((item) => item.id === firstEpisodeId);
      expect(Boolean(episode), "season detail should include watched episode");
      expectEqual(episode.watched, true, "season detail episode.watched after mark");
      expectEqual(episode.watchCount, 1, "season detail episode.watchCount after mark");
    },
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/progress`, {
    assert: (body) => {
      assertShowProgress(body, resolvedShow.id);
      expect(body.watchedEpisodeCount >= 1, "show progress should include watched episode");
      expect(body.totalEpisodeCount >= body.watchedEpisodeCount, "show progress counts should be coherent");
    },
    expectedStatus: 200,
    headers: authHeaders,
  });

  const resolvedMovie = await check("/catalog/resolve", {
    assert: (body) => assertResolveResponse(body, "movie"),
    body: JSON.stringify({ mediaType: "movie", provider: "tmdb", providerId: "155" }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  const resolvedMovieAgain = await check("/catalog/resolve", {
    assert: (body) => assertResolveResponse(body, "movie"),
    body: JSON.stringify({ mediaType: "movie", provider: "tmdb", providerId: "155" }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });

  expectEqual(resolvedMovieAgain.id, resolvedMovie.id, "movie resolve idempotency");

  await check(`/movies/${resolvedMovie.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedMovie.id, "movie", false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedMovie.id, "movie", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    assert: (body) => assertMovieDetail(body, resolvedMovie.id, false, false, null),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/movies/${resolvedMovie.id}/watch-providers?country=CL`, {
    assert: (body) => assertWatchProviders(body, "CL"),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/movies/${resolvedMovie.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedMovie.id, "movie", 4),
    body: JSON.stringify({ rating: 4 }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "PUT",
  });
  await check(`/movies/${resolvedMovie.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedMovie.id, "movie", true),
    expectedStatus: 200,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/movies/${resolvedMovie.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedMovie.id, "movie", true),
    expectedStatus: 200,
    headers: authHeaders,
    method: "POST",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    assert: (body) => assertMovieDetail(body, resolvedMovie.id, false, true, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    assert: (body) => assertMovieWatchResponse(body, resolvedMovie.id, false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    assert: (body) => assertMovieDetail(body, resolvedMovie.id, false, true, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    assert: (body) => assertMovieWatchResponse(body, resolvedMovie.id, true),
    body: JSON.stringify({ watchedAt: movieWatchedAt }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    assert: (body) => assertMovieWatchResponse(body, resolvedMovie.id, true),
    body: JSON.stringify({ watchedAt: movieWatchedAt }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    assert: (body) => assertMovieDetail(body, resolvedMovie.id, true, true, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/library", {
    assert: (body) => {
      assertLibrary(body);
      expect(body.summary.watchlistItemCount >= 2, "library should count watchlist items");
      expect(body.summary.watchedEpisodeCount >= 1, "library should count watched episode");
      expect(body.summary.watchedMovieCount >= 1, "library should count watched movie");
      expect(body.summary.watchedShowCount >= 1, "library should count watched show");
      expect(body.summary.ratedTitleCount >= 2, "library should count rated titles");
      expect(
        body.summary.averageRating === null || (body.summary.averageRating >= 1 && body.summary.averageRating <= 5),
        "library average rating should be null or within rating range",
      );
      expect(
        body.recentlyWatched.some((item) => item.id === firstEpisodeId),
        "library should include recently watched episode",
      );
      expect(
        body.watchedEpisodes.some((item) => item.id === firstEpisodeId),
        "library should include watched episode",
      );
      expect(
        body.recentlyWatched.some((item) => item.id === resolvedMovie.id),
        "library should include recently watched movie",
      );
      expect(
        body.watchlist.some((item) => item.id === resolvedShow.id && item.mediaType === "show"),
        "library should include watchlisted show",
      );
      expect(
        body.watchlist.some((item) => item.id === resolvedMovie.id && item.mediaType === "movie"),
        "library should include watchlisted movie",
      );
      expect(
        body.ratedTitles.some((item) => item.id === resolvedShow.id && item.mediaType === "show" && item.rating === 5),
        "library should include rated show",
      );
      expect(
        body.ratedTitles.some((item) => item.id === resolvedMovie.id && item.mediaType === "movie" && item.rating === 4),
        "library should include rated movie",
      );
    },
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/library/chronology?limit=0", {
    assert: assertValidationError,
    expectedStatus: 400,
    headers: authHeaders,
  });
  await check("/library/chronology?limit=1", {
    assert: (body) => {
      assertChronology(body);
      expect(body.items.length <= 1, "chronology should honor limit");
      expect(
        body.items.some((item) => item.id === firstEpisodeId || item.id === resolvedMovie.id),
        "chronology should include watched activity",
      );
    },
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check("/recommendations", {
    assert: assertRecommendations,
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/watches`, {
    assert: (body) => {
      assertShowProgress(body, resolvedShow.id);
      expectEqual(body.isComplete, true, "show bulk watch complete");
      expectEqual(body.nextEpisode, null, "show bulk watch nextEpisode");
      expectEqual(body.status, "completed", "show bulk watch status");
      expectEqual(body.watchedEpisodeCount, body.totalEpisodeCount, "show bulk watch counts");
      expect(body.totalEpisodeCount > 0, "show bulk watch should hydrate persisted episodes");
    },
    body: JSON.stringify({ watchedAt: showWatchedAt }),
    expectedStatus: 200,
    headers: jsonAuthHeaders,
    method: "POST",
  });
  await check(`/shows/${resolvedShow.id}/watches`, {
    assert: (body) => {
      assertShowProgress(body, resolvedShow.id);
      expectEqual(body.watchedEpisodeCount, 0, "show bulk unwatch count");
      expectEqual(body.status, "not_started", "show bulk unwatch status");
    },
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });

  await check(`/episodes/${firstEpisodeId}/watches`, {
    assert: (body) => assertEpisodeWatchResponse(body, firstEpisodeId, false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/episodes/${firstEpisodeId}/preference`, {
    assert: (body) => assertPreferenceResponse(body, firstEpisodeId, "episode", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    assert: (body) => assertMovieWatchResponse(body, resolvedMovie.id, false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    assert: (body) => assertMovieDetail(body, resolvedMovie.id, false, true, 4),
    expectedStatus: 200,
    headers: authHeaders,
  });
  await check(`/shows/${resolvedShow.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedShow.id, "show", false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}/watchlist`, {
    assert: (body) => assertWatchlistResponse(body, resolvedMovie.id, "movie", false),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/shows/${resolvedShow.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedShow.id, "show", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}/preference`, {
    assert: (body) => assertPreferenceResponse(body, resolvedMovie.id, "movie", null),
    expectedStatus: 200,
    headers: authHeaders,
    method: "DELETE",
  });
}

async function checkUnauthorized(path, options = {}) {
  await check(path, {
    ...options,
    assert: assertUnauthorizedError,
    expectedStatus: 401,
  });
}

async function check(path, options) {
  const method = options.method ?? "GET";
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    body: options.body,
    headers: options.headers,
    method,
  });
  const text = await response.text();
  const body = response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : text;

  console.log(`${response.status} ${method} ${url}`);

  if (response.status !== options.expectedStatus) {
    throw new Error(`Expected ${options.expectedStatus} but got ${response.status} for ${method} ${url}: ${text}`);
  }

  options.assert?.(body, response);

  return body;
}

function assertUser(body) {
  expectRecord(body, "user");
  expectCountryCode(body.availabilityCountry, "user.availabilityCountry");
  expectUuid(body.id, "user.id");
  expectString(body.displayName, "user.displayName");
  expectIsoString(body.createdAt, "user.createdAt");
}

function assertSearchResponse(body) {
  expectRecord(body, "search response");
  expectEqual(body.query, "dark", "search.query");
  expectEqual(body.page, 1, "search.page");
  expectArray(body.results, "search.results");

  for (const result of body.results) {
    expectRecord(result, "search result");
    expectMediaType(result.mediaType, "search result.mediaType");
    expectString(result.title, "search result.title");
    expectString(result.overview, "search result.overview");
    expectNullableString(result.posterPath, "search result.posterPath");
    expectNullableNumber(result.year, "search result.year");
    expect(result.tvloreId === null || uuidPattern.test(result.tvloreId), "search result.tvloreId should be null or UUID");
    expectRecord(result.externalRef, "search result.externalRef");
    expectEqual(result.externalRef.provider, "tmdb", "search result.externalRef.provider");
    expectString(result.externalRef.providerId, "search result.externalRef.providerId");
  }
}

function assertResolveResponse(body, mediaType) {
  expectRecord(body, "resolve response");
  expectUuid(body.id, "resolve.id");
  expectEqual(body.mediaType, mediaType, "resolve.mediaType");
}

function assertWatchPaths(body) {
  expectRecord(body, "watch paths");
  expectArray(body.paths, "watch paths.paths");
  expect(body.paths.length >= 2, "watch paths should include curated paths");

  for (const path of body.paths) {
    expectWatchPathSummary(path, "watch path");
  }
}

function assertWatchPathDetail(body) {
  expectWatchPathSummary(body, "watch path detail");
  expectInteger(body.savedItemCount, "watch path detail.savedItemCount");
  expect(body.savedItemCount >= 0, "watch path detail.savedItemCount should be non-negative");
  expect(body.savedItemCount <= body.itemCount, "watch path detail.savedItemCount should not exceed itemCount");
  expectArray(body.items, "watch path detail.items");
  expectEqual(body.items.length, body.itemCount, "watch path detail.itemCount");
  expect(body.items.length > 0, "watch path detail should include items");

  for (const item of body.items) {
    expectRecord(item, "watch path detail item");
    expectString(item.id, "watch path detail item.id");
    expectBoolean(item.inWatchlist, "watch path detail item.inWatchlist");
    expectMediaType(item.mediaType, "watch path detail item.mediaType");
    expectPositiveInteger(item.position, "watch path detail item.position");
    expectString(item.title, "watch path detail item.title");
    expectNullableNumber(item.year, "watch path detail item.year");
    expectNullableString(item.note, "watch path detail item.note");
    expectNullableString(item.posterPath, "watch path detail item.posterPath");
    expect(item.tvloreId === null || uuidPattern.test(item.tvloreId), "watch path detail item.tvloreId should be null or UUID");
    expectRecord(item.externalRef, "watch path detail item.externalRef");
    expectEqual(item.externalRef.provider, "tmdb", "watch path detail item.externalRef.provider");
    expectString(item.externalRef.providerId, "watch path detail item.externalRef.providerId");
  }
}

function expectWatchPathSummary(value, label) {
  expectRecord(value, label);
  expectString(value.id, `${label}.id`);
  expectString(value.title, `${label}.title`);
  expectString(value.description, `${label}.description`);
  expectPositiveInteger(value.itemCount, `${label}.itemCount`);
}

function assertShowDetail(body, showId, inWatchlist, rating) {
  expectRecord(body, "show detail");
  expectEqual(body.id, showId, "show.id");
  expectEqual(body.inWatchlist, inWatchlist, "show.inWatchlist");
  expectEqual(body.rating, rating, "show.rating");
  expectPublicRating(body.publicRating, "show.publicRating");
  expectString(body.title, "show.title");
  expectString(body.overview, "show.overview");
  expectArray(body.seasons, "show.seasons");
  assertShowProgress(body.progress, showId);
}

function assertShowSeasons(body, showId) {
  expectRecord(body, "show seasons");
  expectEqual(body.showId, showId, "show seasons.showId");
  expectArray(body.seasons, "show seasons.seasons");

  for (const season of body.seasons) {
    expectSeasonSummary(season, "show seasons season");
  }
}

function assertSeasonDetail(body, showId, seasonNumber) {
  expectSeasonSummary(body, "season detail");
  expectEqual(body.showId, showId, "season detail.showId");
  expectEqual(body.seasonNumber, seasonNumber, "season detail.seasonNumber");
  expectArray(body.episodes, "season detail.episodes");
  expect(body.episodes.length > 0, "season detail should include episodes");

  for (const episode of body.episodes) {
    expectRecord(episode, "episode");
    expectUuid(episode.id, "episode.id");
    expectPositiveInteger(episode.episodeNumber, "episode.episodeNumber");
    expectPositiveInteger(episode.seasonNumber, "episode.seasonNumber");
    expectString(episode.title, "episode.title");
    expectString(episode.overview, "episode.overview");
    expectBoolean(episode.watched, "episode.watched");
    expectInteger(episode.watchCount, "episode.watchCount");
    expect(episode.lastWatchedAt === null || isIsoString(episode.lastWatchedAt), "episode.lastWatchedAt should be null or ISO string");
  }
}

function assertEpisodeDetail(body, episodeId, showId, watched, rating) {
  expectRecord(body, "episode detail");
  expectEqual(body.id, episodeId, "episode detail.id");
  expectEqual(body.showId, showId, "episode detail.showId");
  expectUuid(body.seasonId, "episode detail.seasonId");
  expectString(body.showTitle, "episode detail.showTitle");
  expectString(body.seasonTitle, "episode detail.seasonTitle");
  expectPositiveInteger(body.episodeNumber, "episode detail.episodeNumber");
  expectPositiveInteger(body.seasonNumber, "episode detail.seasonNumber");
  expectString(body.title, "episode detail.title");
  expectString(body.overview, "episode detail.overview");
  expectNullableString(body.showPosterPath, "episode detail.showPosterPath");
  expectNullableString(body.stillPath, "episode detail.stillPath");
  expectNullableNumber(body.runtimeMinutes, "episode detail.runtimeMinutes");
  expectEqual(body.rating, rating, "episode detail.rating");
  expectEqual(body.watched, watched, "episode detail.watched");
  expectEqual(body.watchCount, watched ? 1 : 0, "episode detail.watchCount");
  expect(body.lastWatchedAt === null || isIsoString(body.lastWatchedAt), "episode detail.lastWatchedAt should be null or ISO string");
}

function assertEpisodeWatchResponse(body, episodeId, watched) {
  expectRecord(body, "episode watch response");
  expectEqual(body.episodeId, episodeId, "episode watch.episodeId");
  expectEqual(body.watched, watched, "episode watch.watched");
  expectEqual(body.watchCount, watched ? 1 : 0, "episode watch.watchCount");
  expect(body.lastWatchedAt === null || isIsoString(body.lastWatchedAt), "episode watch.lastWatchedAt should be null or ISO string");
  assertShowProgress(body.showProgress, body.showProgress?.showId);
}

function assertShowProgress(body, showId) {
  expectRecord(body, "show progress");
  expectEqual(body.showId, showId, "show progress.showId");
  expectInteger(body.watchedEpisodeCount, "show progress.watchedEpisodeCount");
  expectInteger(body.totalEpisodeCount, "show progress.totalEpisodeCount");
  expectInteger(body.percentComplete, "show progress.percentComplete");
  expect(body.percentComplete >= 0 && body.percentComplete <= 100, "show progress.percentComplete range");
  expect(["completed", "not_started", "watching"].includes(body.status), "show progress.status");
  expectBoolean(body.isComplete, "show progress.isComplete");
  expect(body.nextEpisode === null || isRecord(body.nextEpisode), "show progress.nextEpisode should be null or object");
  expectArray(body.seasons, "show progress.seasons");

  if (body.nextEpisode) {
    expectUuid(body.nextEpisode.id, "show progress.nextEpisode.id");
    expectPositiveInteger(body.nextEpisode.seasonNumber, "show progress.nextEpisode.seasonNumber");
    expectPositiveInteger(body.nextEpisode.episodeNumber, "show progress.nextEpisode.episodeNumber");
    expectString(body.nextEpisode.title, "show progress.nextEpisode.title");
  }

  for (const season of body.seasons) {
    expectInteger(season.seasonNumber, "show progress season.seasonNumber");
    expectInteger(season.percentComplete, "show progress season.percentComplete");
    expectInteger(season.totalEpisodeCount, "show progress season.totalEpisodeCount");
    expectInteger(season.watchedEpisodeCount, "show progress season.watchedEpisodeCount");
  }
}

function assertMovieDetail(body, movieId, watched, inWatchlist, rating) {
  expectRecord(body, "movie detail");
  expectEqual(body.id, movieId, "movie.id");
  expectEqual(body.inWatchlist, inWatchlist, "movie.inWatchlist");
  expectEqual(body.rating, rating, "movie.rating");
  expectPublicRating(body.publicRating, "movie.publicRating");
  expectString(body.title, "movie.title");
  expectString(body.overview, "movie.overview");
  expectEqual(body.watched, watched, "movie.watched");
  expectEqual(body.watchCount, watched ? 1 : 0, "movie.watchCount");
  expect(body.lastWatchedAt === null || isIsoString(body.lastWatchedAt), "movie.lastWatchedAt should be null or ISO string");
}

function assertWatchProviders(body, country) {
  expectRecord(body, "watch providers");
  expectEqual(body.country, country, "watch providers.country");
  expectNullableString(body.link, "watch providers.link");
  expectRecord(body.providers, "watch providers.providers");

  for (const bucket of ["stream", "rent", "buy", "free"]) {
    expectArray(body.providers[bucket], `watch providers.${bucket}`);

    for (const provider of body.providers[bucket]) {
      expectRecord(provider, `watch providers.${bucket} provider`);
      expectPositiveInteger(provider.id, `watch providers.${bucket}.id`);
      expectString(provider.name, `watch providers.${bucket}.name`);
      expectNullableString(provider.logoPath, `watch providers.${bucket}.logoPath`);
    }
  }
}

function assertMovieWatchResponse(body, movieId, watched) {
  expectRecord(body, "movie watch response");
  expectEqual(body.movieId, movieId, "movie watch.movieId");
  expectEqual(body.watched, watched, "movie watch.watched");
  expectEqual(body.watchCount, watched ? 1 : 0, "movie watch.watchCount");
  expect(body.lastWatchedAt === null || isIsoString(body.lastWatchedAt), "movie watch.lastWatchedAt should be null or ISO string");
}

function assertWatchlistResponse(body, id, mediaType, inWatchlist) {
  expectRecord(body, "watchlist response");
  expectEqual(body.id, id, "watchlist.id");
  expectEqual(body.mediaType, mediaType, "watchlist.mediaType");
  expectEqual(body.inWatchlist, inWatchlist, "watchlist.inWatchlist");
}

function assertPreferenceResponse(body, id, mediaType, rating) {
  expectRecord(body, "preference response");
  expectEqual(body.id, id, "preference.id");
  expectEqual(body.mediaType, mediaType, "preference.mediaType");
  expectEqual(body.rating, rating, "preference.rating");
  expect(body.updatedAt === null || isIsoString(body.updatedAt), "preference.updatedAt should be null or ISO string");
}

function assertLibrary(body) {
  expectRecord(body, "library");
  expectRecord(body.summary, "library.summary");
  expectInteger(body.summary.watchlistItemCount, "library.summary.watchlistItemCount");
  expectInteger(body.summary.watchedEpisodeCount, "library.summary.watchedEpisodeCount");
  expectInteger(body.summary.watchedMovieCount, "library.summary.watchedMovieCount");
  expectInteger(body.summary.watchedShowCount, "library.summary.watchedShowCount");
  expectInteger(body.summary.ratedTitleCount, "library.summary.ratedTitleCount");
  expectNullableNumber(body.summary.averageRating, "library.summary.averageRating");
  expectArray(body.continueWatching, "library.continueWatching");
  expectArray(body.ratedTitles, "library.ratedTitles");
  expectArray(body.recentlyWatched, "library.recentlyWatched");
  expectArray(body.watchlist, "library.watchlist");
  expectArray(body.watchedEpisodes, "library.watchedEpisodes");

  for (const item of body.ratedTitles) {
    expectRecord(item, "library.ratedTitles item");
    expect(["movie", "show"].includes(item.mediaType), "library ratedTitles mediaType");
    expectUuid(item.id, "library ratedTitles.id");
    expectString(item.title, "library ratedTitles.title");
    expectNullableString(item.posterPath, "library ratedTitles.posterPath");
    expectInteger(item.rating, "library ratedTitles.rating");
    expect(item.rating >= 1 && item.rating <= 5, "library ratedTitles.rating range");
    expectIsoString(item.updatedAt, "library ratedTitles.updatedAt");
  }

  for (const item of body.recentlyWatched) {
    expectRecord(item, "library.recentlyWatched item");
    expect(["movie", "episode"].includes(item.mediaType), "library recentlyWatched mediaType");
    expectUuid(item.id, "library recentlyWatched.id");
    expectIsoString(item.watchedAt, "library recentlyWatched.watchedAt");
  }

  for (const item of body.watchedEpisodes) {
    expectRecord(item, "library.watchedEpisodes item");
    expectEqual(item.mediaType, "episode", "library watchedEpisodes mediaType");
    expectUuid(item.id, "library watchedEpisodes.id");
    expectUuid(item.showId, "library watchedEpisodes.showId");
    expectString(item.showTitle, "library watchedEpisodes.showTitle");
    expectString(item.title, "library watchedEpisodes.title");
    expectPositiveInteger(item.seasonNumber, "library watchedEpisodes.seasonNumber");
    expectPositiveInteger(item.episodeNumber, "library watchedEpisodes.episodeNumber");
    expectIsoString(item.watchedAt, "library watchedEpisodes.watchedAt");
  }

  for (const item of body.watchlist) {
    expectRecord(item, "library.watchlist item");
    expect(["movie", "show"].includes(item.mediaType), "library watchlist mediaType");
    expectUuid(item.id, "library watchlist.id");
    expectString(item.title, "library watchlist.title");
    expectIsoString(item.createdAt, "library watchlist.createdAt");
  }
}

function assertChronology(body) {
  expectRecord(body, "chronology");
  expectArray(body.items, "chronology.items");
  expectNullableString(body.nextCursor, "chronology.nextCursor");

  for (const item of body.items) {
    expectRecord(item, "chronology item");
    expect(["movie", "episode"].includes(item.mediaType), "chronology item.mediaType");
    expectUuid(item.id, "chronology item.id");
    expectIsoString(item.watchedAt, "chronology item.watchedAt");
  }
}

function assertRecommendations(body) {
  expectRecord(body, "recommendations");
  expectRecord(body.basis, "recommendations.basis");
  expectNullableNumber(body.basis.averageMovieRating, "recommendations.basis.averageMovieRating");
  expectNullableNumber(body.basis.averageShowRating, "recommendations.basis.averageShowRating");
  expectCountryCode(body.basis.availabilityCountry, "recommendations.basis.availabilityCountry");
  expectArray(body.basis.preferredGenreNames, "recommendations.basis.preferredGenreNames");
  body.basis.preferredGenreNames.forEach((genreName) => expectString(genreName, "recommendations.basis.preferredGenreNames item"));
  expectInteger(body.basis.ratedTitleCount, "recommendations.basis.ratedTitleCount");
  expectArray(body.items, "recommendations.items");

  for (const item of body.items) {
    expectRecord(item, "recommendations item");
    expectArray(item.genreNames, "recommendations item.genreNames");
    item.genreNames.forEach((genreName) => expectString(genreName, "recommendations item.genreNames item"));
    expectUuid(item.id, "recommendations item.id");
    expectMediaType(item.mediaType, "recommendations item.mediaType");
    expectString(item.title, "recommendations item.title");
    expectString(item.overview, "recommendations item.overview");
    expectNullableString(item.posterPath, "recommendations item.posterPath");
    expect(
      ["based_on_movie_ratings", "based_on_show_ratings", "from_catalog"].includes(item.reason),
      "recommendations item.reason",
    );
  }
}

function expectSeasonSummary(value, label) {
  expectRecord(value, label);
  expectUuid(value.id, `${label}.id`);
  expectInteger(value.seasonNumber, `${label}.seasonNumber`);
  expectString(value.title, `${label}.title`);
  expectString(value.overview, `${label}.overview`);
  expectNullableString(value.posterPath, `${label}.posterPath`);
  expectInteger(value.episodeCount, `${label}.episodeCount`);
}

function assertUnauthorizedError(body) {
  assertError(body, "UNAUTHORIZED");
  expectEqual(body.message, "Valid bearer token required", "unauthorized.message");
}

function assertValidationError(body) {
  assertError(body, "VALIDATION_FAILED");
}

function assertError(body, code) {
  expectRecord(body, "error response");
  expectEqual(body.code, code, "error.code");
  expectString(body.message, "error.message");
  expect("details" in body, "error.details should exist");
  expectString(body.correlationId, "error.correlationId");
}

function expectRecord(value, label) {
  expect(isRecord(value), `${label} should be an object`);
}

function expectString(value, label) {
  expect(typeof value === "string", `${label} should be a string`);
}

function expectNullableString(value, label) {
  expect(value === null || typeof value === "string", `${label} should be null or string`);
}

function expectNumber(value, label) {
  expect(typeof value === "number", `${label} should be a number`);
}

function expectNullableNumber(value, label) {
  expect(value === null || typeof value === "number", `${label} should be null or number`);
}

function expectPublicRating(value, label) {
  expectNullableNumber(value, label);
  expect(value === null || (value >= 0 && value <= 10), `${label} should be null or within 0-10`);
}

function expectInteger(value, label) {
  expectNumber(value, label);
  expect(Number.isInteger(value), `${label} should be an integer`);
}

function expectPositiveInteger(value, label) {
  expectInteger(value, label);
  expect(value > 0, `${label} should be positive`);
}

function expectBoolean(value, label) {
  expect(typeof value === "boolean", `${label} should be a boolean`);
}

function expectArray(value, label) {
  expect(Array.isArray(value), `${label} should be an array`);
}

function expectUuid(value, label) {
  expect(typeof value === "string" && uuidPattern.test(value), `${label} should be a UUID`);
}

function expectIsoString(value, label) {
  expect(typeof value === "string" && isIsoString(value), `${label} should be an ISO datetime`);
}

function expectMediaType(value, label) {
  expect(value === "show" || value === "movie", `${label} should be show or movie`);
}

function expectCountryCode(value, label) {
  expect(typeof value === "string" && /^[A-Z]{2}$/.test(value), `${label} should be an ISO 3166-1 alpha-2 country code`);
}

function expectEqual(actual, expected, label) {
  expect(actual === expected, `${label} expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoString(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
