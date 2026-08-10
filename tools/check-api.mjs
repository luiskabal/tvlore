const baseUrl = process.env.TVLORE_API_BASE_URL ?? "https://tvlore-api.vercel.app";
const paths = ["/", "/health", "/users/me", "/health/db"];

for (const path of paths) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);
  const body = await response.text();

  console.log(`${response.status} ${url}`);
  console.log(body);

  if (!response.ok) {
    process.exitCode = 1;
  }
}
