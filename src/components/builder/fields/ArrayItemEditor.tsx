import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ArrayItemEditor<T>({
  label,
  items,
  createItem,
  onChange,
  renderItem,
}: {
  label: string;
  items: T[];
  createItem: () => T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  function updateItem(index: number, patch: Partial<T>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-card-foreground">{label}s</p>
        <Button size="sm" variant="secondary" onClick={() => onChange([...items, createItem()])}>
          Add
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {label} {index + 1}
            </p>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              disabled={items.length <= 1}
            >
              <Trash2 size={15} />
            </Button>
          </div>
          {renderItem(item, (patch) => updateItem(index, patch))}
        </div>
      ))}
    </div>
  );
}
