import { spawnSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node tools/run-eas-mobile.mjs <eas args...>");
  process.exit(1);
}

const command = process.platform === "win32" ? "cmd.exe" : "npx";
const commandArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", ["npx", "--yes", "eas-cli@latest", ...args].join(" ")]
    : ["--yes", "eas-cli@latest", ...args];

const result = spawnSync(command, commandArgs, {
  cwd: join(process.cwd(), "apps", "mobile"),
  env: process.env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
