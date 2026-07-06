import { describe, expect, it } from "vitest";
import {
  buildImageUploadPath,
  IMAGE_UPLOAD_BUCKET,
  isImageUploadBucketUrl,
  isMissingImageUploadBucketError,
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageUploadFile,
} from "./uploads";

describe("validateImageUploadFile", () => {
  it("accepts supported image types with matching extensions", () => {
    const file = new File(["image"], "hero.webp", { type: "image/webp" });

    expect(validateImageUploadFile(file)).toEqual({
      ok: true,
      contentType: "image/webp",
      extension: "webp",
    });
  });

  it("rejects missing files", () => {
    expect(validateImageUploadFile(null)).toEqual({
      ok: false,
      status: 400,
      error: "Image file is required",
    });
  });

  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES + 1)], "hero.png", {
      type: "image/png",
    });

    expect(validateImageUploadFile(file)).toEqual({
      ok: false,
      status: 413,
      error: "Image must be 5MB or smaller",
    });
  });

  it("rejects unsupported mime types", () => {
    const file = new File(["pdf"], "hero.pdf", { type: "application/pdf" });

    expect(validateImageUploadFile(file)).toEqual({
      ok: false,
      status: 415,
      error: "Image must be JPEG, PNG, WebP, or GIF",
    });
  });

  it("rejects image files whose extension does not match the mime type", () => {
    const file = new File(["image"], "hero.png", { type: "image/jpeg" });

    expect(validateImageUploadFile(file)).toEqual({
      ok: false,
      status: 415,
      error: "Image extension must match its file type",
    });
  });
});

describe("buildImageUploadPath", () => {
  it("scopes uploaded images to the user and page", () => {
    expect(
      buildImageUploadPath({
        userId: "user-1",
        pageId: "page-1",
        extension: "jpg",
        id: "asset-1",
      }),
    ).toBe("users/user-1/pages/page-1/asset-1.jpg");
  });
});

describe("isImageUploadBucketUrl", () => {
  it("detects public URLs from the configured image upload bucket", () => {
    expect(
      isImageUploadBucketUrl(
        `https://project.supabase.co/storage/v1/object/public/${IMAGE_UPLOAD_BUCKET}/users/user-1/hero.png`,
      ),
    ).toBe(true);
    expect(isImageUploadBucketUrl("https://example.com/hero.png")).toBe(false);
  });
});

describe("isMissingImageUploadBucketError", () => {
  it("detects Supabase missing bucket errors", () => {
    expect(isMissingImageUploadBucketError({ message: "Bucket not found" })).toBe(true);
    expect(isMissingImageUploadBucketError({ statusCode: "404" })).toBe(true);
    expect(isMissingImageUploadBucketError({ message: "Duplicate" })).toBe(false);
  });
});
