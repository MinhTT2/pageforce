import { ImageOff, Link2, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { isImageUploadBucketUrl } from "@/lib/uploads";
import { Field } from "./Field";

export function ImageUrlField({
  label = "Image URL",
  pageId,
  value,
  onChange,
}: {
  label?: string;
  pageId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [failedSrc, setFailedSrc] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const showFallback = value && failedSrc === value;
  const hasUploadedAsset = value ? isImageUploadBucketUrl(value) : false;
  const showUrlInput = editingUrl || !hasUploadedAsset;

  async function uploadImage(file: File) {
    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageId", pageId);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { url?: unknown; error?: string }
        | null;

      if (!response.ok || typeof payload?.url !== "string") {
        setUploadError(payload?.error ?? "Could not upload image");
        return;
      }

      setFailedSrc("");
      setEditingUrl(false);
      onChange(payload.url);
    } catch {
      setUploadError("Could not upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field
      label={label}
      description="Paste a direct image URL or upload an image."
      error={uploadError}
    >
      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(event) => {
              setEditingUrl(true);
              setUploadError("");
              onChange(event.target.value);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={uploading ? "Uploading image" : "Upload image"}
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2">
          <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-surface-foreground">
            <Upload className="size-4 shrink-0 text-primary" />
            <span className="truncate font-medium">Uploaded image</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {uploading ? "Uploading..." : "Replace"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit image URL"
            onClick={() => setEditingUrl(true)}
          >
            <Link2 className="size-4" />
          </Button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void uploadImage(file);
          }

          event.target.value = "";
        }}
      />
      {value ? (
        <div className="mt-2 aspect-video overflow-hidden rounded-md border border-border bg-surface">
          {showFallback ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <ImageOff className="mx-auto size-6" />
                <p className="mt-2 text-xs font-medium">Couldn&apos;t load image</p>
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setFailedSrc(value)}
            />
          )}
        </div>
      ) : null}
    </Field>
  );
}
