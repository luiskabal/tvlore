const baseUrl = process.env.TVLORE_API_BASE_URL ?? "https://tvlore-api.vercel.app";
const supabaseAccessToken = process.env.TVLORE_SUPABASE_ACCESS_TOKEN;

for (const path of ["/", "/health", "/health/db"]) {
  await check(path, { expectedStatus: 200 });
}

await check("/users/me", { expectedStatus: 401 });
await check("/search?query=dark", { expectedStatus: 401 });
await check("/catalog/resolve", {
  body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "70523" }),
  expectedStatus: 401,
  headers: { "content-type": "application/json" },
  method: "POST",
});
await check("/shows/00000000-0000-4000-8000-000000000001", { expectedStatus: 401 });
await check("/shows/00000000-0000-4000-8000-000000000001/seasons", { expectedStatus: 401 });
await check("/shows/00000000-0000-4000-8000-000000000001/seasons/1", { expectedStatus: 401 });
await check("/shows/00000000-0000-4000-8000-000000000001/progress", { expectedStatus: 401 });
await check("/movies/00000000-0000-4000-8000-000000000001", { expectedStatus: 401 });
await check("/library", { expectedStatus: 401 });
await check("/episodes/00000000-0000-4000-8000-000000000001/watches", {
  expectedStatus: 401,
  method: "POST",
});
await check("/episodes/00000000-0000-4000-8000-000000000001/watches", {
  expectedStatus: 401,
  method: "DELETE",
});
await check("/movies/00000000-0000-4000-8000-000000000001/watches", {
  expectedStatus: 401,
  method: "POST",
});
await check("/movies/00000000-0000-4000-8000-000000000001/watches", {
  expectedStatus: 401,
  method: "DELETE",
});

if (supabaseAccessToken) {
  await check("/users/me", {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  await check("/search?query=dark", {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  const resolvedShow = await check("/catalog/resolve", {
    body: JSON.stringify({ mediaType: "show", provider: "tmdb", providerId: "70523" }),
    expectedStatus: 200,
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });
  await check(`/shows/${resolvedShow.id}`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  await check(`/shows/${resolvedShow.id}/seasons`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  const seasonDetail = await check(`/shows/${resolvedShow.id}/seasons/1`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  const firstEpisodeId = seasonDetail.episodes?.[0]?.id;

  if (!firstEpisodeId) {
    throw new Error("Authenticated check expected at least one episode in season 1.");
  }

  await check(`/episodes/${firstEpisodeId}/watches`, {
    body: JSON.stringify({ watchedAt: "2026-08-09T00:00:00.000Z" }),
    expectedStatus: 200,
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });
  await check(`/shows/${resolvedShow.id}/progress`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  const resolvedMovie = await check("/catalog/resolve", {
    body: JSON.stringify({ mediaType: "movie", provider: "tmdb", providerId: "155" }),
    expectedStatus: 200,
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });
  await check(`/movies/${resolvedMovie.id}`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    body: JSON.stringify({ watchedAt: "2026-08-09T00:00:00.000Z" }),
    expectedStatus: 200,
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });
  await check("/library", {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  await check(`/episodes/${firstEpisodeId}/watches`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
    method: "DELETE",
  });
  await check(`/movies/${resolvedMovie.id}/watches`, {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
    method: "DELETE",
  });
} else {
  console.log("Skipping authenticated product checks: set TVLORE_SUPABASE_ACCESS_TOKEN.");
}

async function check(path, options) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    body: options.body,
    headers: options.headers,
    method: options.method,
  });
  const body = await response.text();

  console.log(`${response.status} ${url}`);
  console.log(body);

  if (response.status !== options.expectedStatus) {
    process.exitCode = 1;
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return JSON.parse(body);
  }

  return body;
}
