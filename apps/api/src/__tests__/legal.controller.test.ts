import { describe, expect, it } from "vitest";

import { LegalController } from "../legal.controller";

describe("LegalController", () => {
  const controller = new LegalController();

  it("serves public privacy copy", () => {
    const html = controller.getPrivacyPolicy();

    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Data TVLore collects");
    expect(html).toContain("/account-deletion");
  });

  it("serves public account deletion instructions", () => {
    const html = controller.getAccountDeletion();

    expect(html).toContain("Account Deletion");
    expect(html).toContain("Delete forever");
    expect(html).toContain("watchlist, ratings, reflections");
  });
});
