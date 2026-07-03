import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorField({
  label,
  value,
  fallback,
  onChange,
  allowClear = false,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string | undefined) => void;
  allowClear?: boolean;
}) {
  const shown = value ?? fallback;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-card-foreground">
        {label}
        {allowClear && !value ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">Default</span>
        ) : null}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={shown}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color picker`}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
        />
        <Input
          value={value ?? ""}
          placeholder={fallback}
          onChange={(event) => {
            const next = event.target.value.trim();

            if (!next) {
              onChange(undefined);
              return;
            }

            if (HEX_PATTERN.test(next)) {
              onChange(next);
            }
          }}
          aria-label={`${label} hex value`}
          className="h-9 font-mono text-xs"
        />
        {allowClear && value ? (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Reset ${label.toLowerCase()} color`}
            onClick={() => onChange(undefined)}
          >
            <X size={14} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
