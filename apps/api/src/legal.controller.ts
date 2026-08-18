import { Controller, Get, Header } from "@nestjs/common";

const appUrl = "https://tvlore-api.vercel.app";
const supportUrl = "https://github.com/luiskabal/tvlore/issues";
const lastUpdated = "2026-08-17";

@Controller()
export class LegalController {
  @Get("privacy")
  @Header("Content-Type", "text/html; charset=utf-8")
  getPrivacyPolicy() {
    return renderPage("Privacy Policy", `
      <p><strong>Last updated:</strong> ${lastUpdated}</p>
      <p>TVLore is a developer-preview entertainment tracker for searching, saving, rating, and reflecting on shows, movies, seasons, and episodes.</p>
      <h2>Data TVLore collects</h2>
      <ul>
        <li>Account identity from Supabase Auth, including your email, display name, avatar URL, and provider user ID.</li>
        <li>Profile settings such as your preferred streaming availability country.</li>
        <li>Your TVLore activity: watch history, watchlist, ratings, private reflections, favorite-character selections, comments, and personal watch paths.</li>
        <li>Operational data needed to run the service, such as request timing, status codes, and correlation IDs.</li>
      </ul>
      <h2>How TVLore uses data</h2>
      <p>TVLore uses this data to authenticate you, sync your library, calculate progress, show country-aware availability, and recommend titles from your own activity.</p>
      <h2>Third-party services</h2>
      <p>TVLore uses Supabase for authentication/database services, Vercel for hosting, and TMDB for catalog metadata and watch-provider information. TVLore does not sell personal data.</p>
      <h2>Deletion</h2>
      <p>You can delete your account in the app under Profile. You can also read the deletion instructions at <a href="/account-deletion">Account Deletion</a>.</p>
      <p>This draft is maintained for development and must be reviewed before store submission.</p>
    `);
  }

  @Get("terms")
  @Header("Content-Type", "text/html; charset=utf-8")
  getTerms() {
    return renderPage("Terms", `
      <p><strong>Last updated:</strong> ${lastUpdated}</p>
      <p>TVLore is provided as a developer-preview personal tracking app. Use it to maintain your own entertainment library, watchlist, ratings, and watch paths.</p>
      <h2>Catalog data</h2>
      <p>TVLore displays third-party catalog and availability metadata from TMDB. Streaming availability can change and should be confirmed with the provider before watching or purchasing.</p>
      <h2>User content</h2>
      <p>Your ratings, reflections, favorite-character selections, comments, and personal watch paths are private product data in the current app.</p>
      <h2>Availability</h2>
      <p>The service is provided without a commercial uptime guarantee during development. Features may change before a 1.0 store release.</p>
      <p>This draft is maintained for development and must be reviewed before store submission.</p>
    `);
  }

  @Get("support")
  @Header("Content-Type", "text/html; charset=utf-8")
  getSupport() {
    return renderPage("Support", `
      <p>For development support, open an issue in the TVLore repository:</p>
      <p><a href="${supportUrl}" rel="noopener noreferrer">${supportUrl}</a></p>
      <p>Do not include passwords, access tokens, refresh tokens, or private account data in public issues.</p>
      <p>For account deletion, use Profile in the app first, or follow the public instructions at <a href="/account-deletion">Account Deletion</a>.</p>
    `);
  }

  @Get("account-deletion")
  @Header("Content-Type", "text/html; charset=utf-8")
  getAccountDeletion() {
    return renderPage("Account Deletion", `
      <p>TVLore supports account deletion from inside the app.</p>
      <ol>
        <li>Open TVLore.</li>
        <li>Go to Profile.</li>
        <li>Tap Delete account.</li>
        <li>Confirm Delete forever.</li>
      </ol>
      <p>Deletion removes your TVLore library, watch history, watchlist, ratings, reflections, favorite-character selections, comments, personal watch paths, and linked Supabase Auth account where configured.</p>
      <p>Shared catalog rows from TMDB may remain because they are not user-owned data.</p>
      <p>If you cannot access the app, open a support request at <a href="${supportUrl}" rel="noopener noreferrer">${supportUrl}</a>. Do not post passwords or tokens.</p>
    `);
  }
}

function renderPage(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TVLore ${title}</title>
    <style>
      body {
        background: #f7f4ee;
        color: #171412;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.55;
        margin: 0;
      }
      main {
        margin: 0 auto;
        max-width: 760px;
        padding: 48px 20px;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 32px;
      }
      h1 {
        font-size: 44px;
        line-height: 1;
        margin: 0 0 20px;
      }
      h2 {
        font-size: 22px;
        margin-top: 28px;
      }
      a {
        color: #1f7a5c;
        font-weight: 800;
      }
      .panel {
        background: #fffdfa;
        border: 1px solid #d8d0c5;
        border-radius: 8px;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <main>
      <nav>
        <a href="${appUrl}/privacy">Privacy</a>
        <a href="${appUrl}/terms">Terms</a>
        <a href="${appUrl}/support">Support</a>
        <a href="${appUrl}/account-deletion">Account deletion</a>
      </nav>
      <h1>${title}</h1>
      <section class="panel">
        ${body}
      </section>
    </main>
  </body>
</html>`;
}
