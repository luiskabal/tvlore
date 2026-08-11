const baseUrl = process.env.TVLORE_API_BASE_URL ?? "https://tvlore-api.vercel.app";
const supabaseAccessToken = process.env.TVLORE_SUPABASE_ACCESS_TOKEN;

for (const path of ["/", "/health", "/health/db"]) {
  await check(path, { expectedStatus: 200 });
}

await check("/users/me", { expectedStatus: 401 });
await check("/search?query=dark", { expectedStatus: 401 });

if (supabaseAccessToken) {
  await check("/users/me", {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
  await check("/search?query=dark", {
    expectedStatus: 200,
    headers: { Authorization: `Bearer ${supabaseAccessToken}` },
  });
} else {
  console.log("Skipping authenticated /users/me and /search checks: set TVLORE_SUPABASE_ACCESS_TOKEN.");
}

async function check(path, options) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { headers: options.headers });
  const body = await response.text();

  console.log(`${response.status} ${url}`);
  console.log(body);

  if (response.status !== options.expectedStatus) {
    process.exitCode = 1;
  }
}
