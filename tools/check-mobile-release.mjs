import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mobileRoot = join(process.cwd(), "apps", "mobile");
const requiredMobileEnv = [
  "EXPO_PUBLIC_TVLORE_API_BASE_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
const placeholderPattern = /YOUR_|PROJECT_REF|CHANGE_ME|placeholder|your-/i;
let hasError = false;

const app = readJson("apps/mobile/app.json").expo;
const eas = readJson("apps/mobile/eas.json");
const mobileEnv = parseEnvFile("apps/mobile/.env");

console.log("\nmobile app config");
expectString(app.name, "expo.name");
expectString(app.slug, "expo.slug");
expectEqual(app.scheme, "tvlore", "expo.scheme");
expectEqual(app.owner, "luiskabal", "expo.owner");
expectSemver(app.version, "expo.version");
expectFile(app.icon, "expo.icon");
expectFile(app.splash?.image, "expo.splash.image");
expectArrayIncludes(app.plugins, "expo-apple-authentication", "expo.plugins");
expectUuid(app.extra?.eas?.projectId, "expo.extra.eas.projectId");
expectEqual(app.ios?.bundleIdentifier, "com.luiskabal.tvlore", "expo.ios.bundleIdentifier");
expectEqual(app.ios?.usesAppleSignIn, true, "expo.ios.usesAppleSignIn");
expectEqual(app.android?.package, "com.luiskabal.tvlore", "expo.android.package");
expectFile(app.android?.adaptiveIcon?.foregroundImage, "expo.android.adaptiveIcon.foregroundImage");

console.log("\neas profiles");
expectEqual(eas.cli?.appVersionSource, "remote", "eas.cli.appVersionSource");
expectEqual(eas.build?.development?.developmentClient, true, "eas.build.development.developmentClient");
expectEqual(eas.build?.development?.distribution, "internal", "eas.build.development.distribution");
expectEqual(eas.build?.development?.environment, "development", "eas.build.development.environment");
expectEqual(eas.build?.preview?.distribution, "internal", "eas.build.preview.distribution");
expectEqual(eas.build?.preview?.environment, "preview", "eas.build.preview.environment");
expectEqual(eas.build?.production?.autoIncrement, true, "eas.build.production.autoIncrement");
expectEqual(eas.build?.production?.environment, "production", "eas.build.production.environment");
expectEqual(eas.submit?.production?.android?.track, "internal", "eas.submit.production.android.track");
expectRecord(eas.submit?.production?.ios, "eas.submit.production.ios");

console.log("\nmobile env");
for (const key of requiredMobileEnv) {
  expectEnvValue(mobileEnv, key);
}
expectHttpsUrl(mobileEnv.get("EXPO_PUBLIC_TVLORE_API_BASE_URL"), "EXPO_PUBLIC_TVLORE_API_BASE_URL");
expectHttpsUrl(mobileEnv.get("EXPO_PUBLIC_SUPABASE_URL"), "EXPO_PUBLIC_SUPABASE_URL");

console.log("\nmanual release gates");
warn("Verify EAS remote envs with: cd apps/mobile; npx --yes eas-cli@latest env:list development|preview|production");
warn("Verify Supabase Auth allows tvlore://auth/callback");
warn("Verify Apple Developer App ID com.luiskabal.tvlore has Sign in with Apple enabled");
warn("Configure SUPABASE_SERVICE_ROLE_KEY in Vercel before release account-deletion QA");

if (hasError) {
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function parseEnvFile(file) {
  if (!existsSync(file)) {
    fail(`local file missing: ${file}`);
    return new Map();
  }

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

function expectString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
    return;
  }

  ok(label);
}

function expectRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be configured`);
    return;
  }

  ok(label);
}

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label} expected ${String(expected)}`);
    return;
  }

  ok(label);
}

function expectArrayIncludes(value, expected, label) {
  if (!Array.isArray(value) || !value.includes(expected)) {
    fail(`${label} must include ${expected}`);
    return;
  }

  ok(`${label}.${expected}`);
}

function expectSemver(value, label) {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+$/.test(value)) {
    fail(`${label} must use x.y.z release format`);
    return;
  }

  ok(label);
}

function expectUuid(value, label) {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    fail(`${label} must be a UUID`);
    return;
  }

  ok(label);
}

function expectFile(relativePath, label) {
  if (typeof relativePath !== "string" || !existsSync(join(mobileRoot, relativePath))) {
    fail(`${label} file missing`);
    return;
  }

  ok(label);
}

function expectEnvValue(env, key) {
  const value = env.get(key);

  if (!value || placeholderPattern.test(value)) {
    fail(`${key} must be set in apps/mobile/.env`);
    return;
  }

  ok(key);
}

function expectHttpsUrl(value, label) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      fail(`${label} must be https for release builds`);
      return;
    }

    ok(`${label}.https`);
  } catch {
    fail(`${label} must be a valid URL`);
  }
}

function ok(message) {
  console.log(`ok ${message}`);
}

function warn(message) {
  console.log(`warn ${message}`);
}

function fail(message) {
  hasError = true;
  console.error(`fail ${message}`);
}
