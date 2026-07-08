export const IMAGE_UPLOAD_BUCKET = "page-assets";
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = {
  "image/gif": ["gif"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
} as const;

type AllowedImageMimeType = keyof typeof ALLOWED_IMAGE_EXTENSIONS;

export type ImageUploadValidationResult =
  | {
      ok: true;
      contentType: AllowedImageMimeType;
      extension: string;
    }
  | {
      ok: false;
      status: 400 | 413 | 415;
      error: string;
    };

export function validateImageUploadFile(file: File | null | undefined): ImageUploadValidationResult {
  if (!file) {
    return { ok: false, status: 400, error: "Image file is required" };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: "Image must be 5MB or smaller" };
  }

  if (!isAllowedImageMimeType(file.type)) {
    return { ok: false, status: 415, error: "Image must be JPEG, PNG, WebP, or GIF" };
  }

  const extension = extensionFromName(file.name);
  const allowedExtensions: readonly string[] = ALLOWED_IMAGE_EXTENSIONS[file.type];

  if (!extension || !allowedExtensions.includes(extension)) {
    return { ok: false, status: 415, error: "Image extension must match its file type" };
  }

  return { ok: true, contentType: file.type, extension };
}

export function buildImageUploadPath({
  userId,
  pageId,
  extension,
  id = crypto.randomUUID(),
}: {
  userId: string;
  pageId: string;
  extension: string;
  id?: string;
}) {
  return `users/${userId}/pages/${pageId}/${id}.${extension}`;
}

const SUPABASE_PUBLIC_STORAGE_PATH = "/storage/v1/object/public/";
// NEXT_PUBLIC_* env is inlined at build time in client bundles, so the
// hostname is constant for the process lifetime — parse it once.
const supabasePublicHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

export function isImageUploadBucketUrl(value: string) {
  return value.includes(`${SUPABASE_PUBLIC_STORAGE_PATH}${IMAGE_UPLOAD_BUCKET}/`);
}

export function isSupabasePublicAssetUrl(value: string) {
  if (!supabasePublicHostname) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === supabasePublicHostname &&
      url.pathname.startsWith(SUPABASE_PUBLIC_STORAGE_PATH)
    );
  } catch {
    return false;
  }
}

// Mirrors images.remotePatterns in next.config.ts: our Supabase project's
// public storage plus the Unsplash imagery used by templates and defaults.
// Every other URL must render with `unoptimized` or next/image rejects it at
// request time.
export function isOptimizedImageUrl(value: string) {
  if (isSupabasePublicAssetUrl(value)) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function isMissingImageUploadBucketError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { message?: unknown; statusCode?: unknown; status?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";

  return (
    message.includes("bucket not found") ||
    message.includes("bucket not_found") ||
    candidate.statusCode === "404" ||
    candidate.statusCode === 404 ||
    candidate.status === 404
  );
}

function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return value in ALLOWED_IMAGE_EXTENSIONS;
}

function extensionFromName(name: string) {
  const extension = name.toLowerCase().split(".").pop();

  return extension && extension !== name.toLowerCase() ? extension : "";
}
