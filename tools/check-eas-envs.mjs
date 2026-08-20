import { execFileSync } from "node:child_process";
import { join } from "node:path";

const mobileRoot = join(process.cwd(), "apps", "mobile");
const environments = ["development", "preview", "production"];
const requiredVariables = [
  "EXPO_PUBLIC_TVLORE_API_BASE_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
let hasError = false;

for (const environment of environments) {
  console.log(`\neas ${environment}`);
  const variables = listEnvironmentVariables(environment);

  if (!variables) {
    continue;
  }

  for (const name of requiredVariables) {
    if (variables.has(name)) {
      ok(name);
    } else {
      fail(`${environment} missing ${name}`);
    }
  }
}

if (hasError) {
  process.exitCode = 1;
}

function listEnvironmentVariables(environment) {
  let output;

  try {
    output = runNpx(["--yes", "eas-cli@latest", "env:list", environment, "--format", "short", "--scope", "project"]);
  } catch (error) {
    fail(
      `${environment} env:list failed. Confirm Expo login with: cd apps/mobile; npx --yes eas-cli@latest whoami`,
    );

    return null;
  }

  return new Set(
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.includes("="))
      .map((line) => line.slice(0, line.indexOf("="))),
  );
}

function runNpx(args) {
  const options = {
    cwd: mobileRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  };

  if (process.platform === "win32") {
    return execFileSync("cmd.exe", ["/d", "/s", "/c", ["npx", ...args].join(" ")], options);
  }

  return execFileSync("npx", args, options);
}

function ok(message) {
  console.log(`ok ${message}`);
}

function fail(message) {
  hasError = true;
  console.error(`fail ${message}`);
}
