import type { getCurrentUser } from "@/lib/auth";

type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function getUserLabel(user: SessionUser) {
  const fullName = getMetadataString(user.user_metadata.full_name);
  const name = getMetadataString(user.user_metadata.name);

  return fullName || name || user.email || "Account";
}

export function getUserInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "U";
}

function getMetadataString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
