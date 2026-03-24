const DEV_DEFAULT_API_URL = "http://localhost:3001";

function getConfiguredApiUrl(
  rawApiUrl: string | undefined,
  nodeEnv: string | undefined,
): string | undefined {
  const trimmed = rawApiUrl?.trim();
  if (trimmed) {
    return trimmed;
  }

  if (nodeEnv !== "production") {
    return DEV_DEFAULT_API_URL;
  }

  return undefined;
}

export function resolveApiOriginForCsp(
  rawApiUrl: string | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string | null {
  const configured = getConfiguredApiUrl(rawApiUrl, nodeEnv);
  if (!configured) {
    return null;
  }

  // Relative API paths are same-origin and already covered by 'self'.
  if (configured.startsWith("/")) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_URL: "${configured}". Use an absolute http(s) URL (e.g. "http://localhost:3001") or a relative path (e.g. "/api").`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid NEXT_PUBLIC_API_URL protocol: "${parsed.protocol}". Only http:// or https:// are supported.`,
    );
  }

  return parsed.origin;
}

export function buildConnectSrcDirective(
  rawApiUrl: string | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  const sources = new Set<string>(["'self'"]);
  const apiOrigin = resolveApiOriginForCsp(rawApiUrl, nodeEnv);
  if (apiOrigin) {
    sources.add(apiOrigin);
  }

  return `connect-src ${Array.from(sources).join(" ")}`;
}

