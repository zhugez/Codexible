import { describe, expect, it } from "vitest";

import { buildConnectSrcDirective, resolveApiOriginForCsp } from "../csp";

describe("CSP connect-src builder", () => {
  it("adds configured cross-origin API origin alongside self", () => {
    const directive = buildConnectSrcDirective("http://localhost:3001", "development");
    expect(directive).toBe("connect-src 'self' http://localhost:3001");
  });

  it("uses self only for relative API path", () => {
    const directive = buildConnectSrcDirective("/api", "production");
    expect(directive).toBe("connect-src 'self'");
  });

  it("uses localhost fallback in non-production when API URL is unset", () => {
    const origin = resolveApiOriginForCsp(undefined, "development");
    expect(origin).toBe("http://localhost:3001");
  });

  it("does not add extra origin in production when API URL is unset", () => {
    const directive = buildConnectSrcDirective(undefined, "production");
    expect(directive).toBe("connect-src 'self'");
  });

  it("throws actionable error for invalid API URL", () => {
    expect(() => resolveApiOriginForCsp("localhost:3001", "development")).toThrow(
      /Invalid NEXT_PUBLIC_API_URL/i,
    );
  });

  it("never emits wildcard connect-src", () => {
    const directive = buildConnectSrcDirective("https://api.example.com", "production");
    expect(directive.includes("*")).toBe(false);
  });
});

