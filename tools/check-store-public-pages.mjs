import { readFileSync } from "node:fs";

const metadataFile = "docs/store-metadata.md";
const requiredPaths = ["/privacy", "/terms", "/support", "/account-deletion"];
const metadata = readFileSync(metadataFile, "utf8");
const urls = requiredPaths.map((path) => `https://tvlore-api.vercel.app${path}`);
let hasError = false;

for (const url of urls) {
  if (!metadata.includes(url)) {
    fail(`${metadataFile} missing ${url}`);
    continue;
  }

  await expectPublicPage(url);
}

if (hasError) {
  process.exitCode = 1;
}

async function expectPublicPage(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status !== 200) {
      fail(`${url} expected 200, got ${response.status}`);
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      fail(`${url} expected text/html, got ${contentType || "no content-type"}`);
      return;
    }

    ok(url);
  } catch (error) {
    fail(`${url} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function ok(message) {
  console.log(`ok ${message}`);
}

function fail(message) {
  hasError = true;
  console.error(`fail ${message}`);
}
