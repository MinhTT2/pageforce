import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildImageUploadPath,
  IMAGE_UPLOAD_BUCKET,
  isMissingImageUploadBucketError,
  validateImageUploadFile,
} from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json({ error: "Body must be multipart/form-data" }, { status: 400 });
  }

  const pageId = formData.get("pageId");

  if (typeof pageId !== "string" || !pageId.trim()) {
    return NextResponse.json({ error: "Page id is required" }, { status: 400 });
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, userId: user.id },
    select: { id: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const fileValue = formData.get("file");
  const file = fileValue instanceof File ? fileValue : null;
  const validation = validateImageUploadFile(file);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  if (!file) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  const path = buildImageUploadPath({
    userId: user.id,
    pageId: page.id,
    extension: validation.extension,
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(IMAGE_UPLOAD_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: validation.contentType,
    upsert: false,
  });

  if (error) {
    console.error("Image upload failed", error);

    if (isMissingImageUploadBucketError(error)) {
      return NextResponse.json(
        {
          error: `Storage bucket "${IMAGE_UPLOAD_BUCKET}" is missing. Create it as a public bucket in Supabase Storage before uploading images.`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "Could not upload image" }, { status: 500 });
  }

  const { data } = supabase.storage.from(IMAGE_UPLOAD_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
}
