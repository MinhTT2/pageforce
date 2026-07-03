import { ImageOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Field } from "./Field";

export function ImageUrlField({
  label = "Image URL",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [failedSrc, setFailedSrc] = useState("");
  const showFallback = value && failedSrc === value;

  return (
    <Field label={label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
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
