import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { parseWatchInput } from "./tracking-input";

describe("parseWatchInput", () => {
  it("uses server time when body is empty", () => {
    expect(parseWatchInput({}).watchedAt).toBeInstanceOf(Date);
  });

  it("accepts an ISO watchedAt", () => {
    expect(parseWatchInput({ watchedAt: "2026-08-09T00:00:00.000Z" })).toEqual({
      watchedAt: new Date("2026-08-09T00:00:00.000Z"),
    });
  });

  it("rejects invalid watchedAt values", () => {
    expect(() => parseWatchInput({ watchedAt: "today" })).toThrow(BadRequestException);
    expect(() => parseWatchInput({ watchedAt: "2026-08-09" })).toThrow(BadRequestException);
    expect(() => parseWatchInput({ watchedAt: 123 })).toThrow(BadRequestException);
  });
});
