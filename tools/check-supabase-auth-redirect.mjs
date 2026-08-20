import { existsSync, readFileSync } from "node:fs";

const envFile = "apps/mobile/.env";
const redirectUrl = "tvlore:///auth/callback";
const env = parseEnvFile(envFile);
const supabaseUrl = env.get("EXPO_PUBLIC_SUPABASE_URL");
let hasError = false;

if (!supabaseUrl) {
  fail(`${envFile} missing EXPO_PUBLIC_SUPABASE_URL`);
} else {
  await expectGoogleRedirect(supabaseUrl);
}

if (hasError) {
  process.exitCode = 1;
}

async function expectGoogleRedirect(baseUrl) {
  const url = new URL(`${baseUrl}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectUrl);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = response.headers.get("location") ?? "";

    if (response.status !== 302) {
      fail(`Supabase Google OAuth expected 302, got ${response.status}`);
      return;
    }

    if (!location.startsWith("https://accounts.google.com/")) {
      fail("Supabase Google OAuth did not redirect to Google");
      return;
    }

    ok(`Supabase allows ${redirectUrl}`);
  } catch (error) {
    fail(`Supabase Google OAuth failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseEnvFile(file) {
  if (!existsSync(file)) {
    fail(`local file missing: ${file}`);
    return new Map();
  }

  const values = new Map();

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    values.set(line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, ""));
  }

  return values;
}

function ok(message) {
  console.log(`ok ${message}`);
}

function fail(message) {
  hasError = true;
  console.error(`fail ${message}`);
}
