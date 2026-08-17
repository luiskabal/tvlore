import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [
  {
    name: "api",
    exampleFile: "apps/api/.env.example",
    localFile: "apps/api/.env",
    vercel: {
      project: "tvlore-api",
      scope: "tvlore",
      environments: ["Production", "Preview"],
      excludeKeys: ["PORT"],
    },
  },
  {
    name: "mobile",
    exampleFile: "apps/mobile/.env.example",
    localFile: "apps/mobile/.env",
  },
];

const placeholderPattern = /YOUR_|PROJECT_REF|CHANGE_ME|placeholder|your-/i;
const optionalKeys = new Set([
  "API_RATE_LIMIT_MAX_REQUESTS",
  "API_RATE_LIMIT_WINDOW_SECONDS",
  "PROVIDER_RATE_LIMIT_MAX_REQUESTS",
  "PROVIDER_RATE_LIMIT_WINDOW_SECONDS",
]);
let hasError = false;

for (const check of checks) {
  const expected = parseEnvFile(check.exampleFile);
  const expectedKeys = [...expected.keys()];

  console.log(`\n${check.name}`);
  checkLocalEnv(check.localFile, expected);

  if (check.vercel) {
    const vercelKeys = expectedKeys.filter((key) => !check.vercel.excludeKeys.includes(key));
    checkVercelEnv(check.vercel, vercelKeys);
  }
}

if (hasError) {
  process.exitCode = 1;
}

function checkLocalEnv(localFile, expected) {
  let localHasError = false;

  if (!existsSync(localFile)) {
    fail(`local file missing: ${localFile}`);
    return;
  }

  const actual = parseEnvFile(localFile);
  const expectedKeys = [...expected.keys()];
  const actualKeys = [...actual.keys()];

  for (const key of expectedKeys) {
    if (!actual.has(key)) {
      if (optionalKeys.has(key)) {
        continue;
      }

      fail(`local key missing in ${localFile}: ${key}`);
      localHasError = true;
      continue;
    }

    const value = actual.get(key);

    if (!value || placeholderPattern.test(value)) {
      fail(`local key needs a real value in ${localFile}: ${key}`);
      localHasError = true;
    }
  }

  for (const key of actualKeys) {
    if (!expected.has(key)) {
      fail(`local key is not tracked in example: ${localFile} ${key}`);
      localHasError = true;
    }
  }

  if (!localHasError) {
    console.log(`ok local ${localFile}`);
  }
}

function checkVercelEnv(vercel, keys) {
  let vercelHasError = false;
  const vercelArgs = ["vercel@latest", "env", "ls", "--project", vercel.project, "--scope", vercel.scope];
  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npx", ...vercelArgs] : vercelArgs;
  const result = spawnSync(
    command,
    args,
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    fail(`vercel env ls failed for ${vercel.scope}/${vercel.project}`);
    if (result.stderr.trim()) {
      console.error(result.stderr.trim());
    }
    return;
  }

  const lines = result.stdout.split(/\r?\n/);

  for (const key of keys) {
    const matchingLines = lines.filter((candidate) => candidate.trim().startsWith(`${key} `));

    if (matchingLines.length === 0) {
      if (optionalKeys.has(key)) {
        continue;
      }

      fail(`vercel key missing in ${vercel.project}: ${key}`);
      vercelHasError = true;
      continue;
    }

    for (const environment of vercel.environments) {
      if (!matchingLines.some((line) => line.includes(environment))) {
        fail(`vercel key ${key} missing ${environment} environment`);
        vercelHasError = true;
      }
    }
  }

  if (!vercelHasError) {
    console.log(`ok vercel ${vercel.scope}/${vercel.project}`);
  }
}

function parseEnvFile(file) {
  const env = new Map();

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const assignment = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separatorIndex = assignment.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = assignment.slice(0, separatorIndex).trim();
    const value = assignment.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    env.set(key, value);
  }

  return env;
}

function fail(message) {
  hasError = true;
  console.error(`fail ${message}`);
}
