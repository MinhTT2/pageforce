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

export function resolveSiteHref(href: string, siteSlug?: string) {
  const value = href.trim();

  if (!value) {
    return "#";
  }

  if (!siteSlug || value.startsWith("#") || value.startsWith("?")) {
    return value;
  }

  if (URL_SCHEME_PATTERN.test(value) || value.startsWith("//")) {
    return value;
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
