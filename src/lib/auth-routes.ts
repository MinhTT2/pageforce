const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export function getSafeNextPath(
  next: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(next, "http://pageforce.local");

    if (url.origin !== "http://pageforce.local") {
      return fallback;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function getAuthIntentPath(currentPath: string | null | undefined) {
  const safeCurrentPath = getSafeNextPath(currentPath, "/");
  const url = new URL(safeCurrentPath, "http://pageforce.local");

  if (url.pathname === "/login" || url.pathname === "/register") {
    return getSafeNextPath(url.searchParams.get("next"));
  }

  return safeCurrentPath;
}
