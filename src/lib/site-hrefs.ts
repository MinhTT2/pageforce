const APP_ROUTE_PREFIXES = new Set([
  "api",
  "builder",
  "dashboard",
  "design-system",
  "login",
  "register",
  "s",
]);

const URL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

export function resolveSiteHref(href: string, siteSlug?: string) {
  const value = href.trim();

  if (!value) {
    return "#";
  }

  if (value.startsWith("#") || value.startsWith("?")) {
    return value;
  }

  if (value.startsWith("//")) {
    return "#";
  }

  if (URL_SCHEME_PATTERN.test(value)) {
    return isSafeUrlScheme(value) ? value : "#";
  }

  if (!siteSlug) {
    return value.startsWith("/") ? value : "#";
  }

  if (!value.startsWith("/")) {
    return value;
  }

  const firstSegment = value.slice(1).split(/[/?#]/)[0];

  if (APP_ROUTE_PREFIXES.has(firstSegment)) {
    return value;
  }

  return value === "/" ? `/s/${siteSlug}` : `/s/${siteSlug}${value}`;
}

function isSafeUrlScheme(value: string) {
  try {
    return SAFE_URL_SCHEMES.has(new URL(value).protocol);
  } catch {
    return false;
  }
}
