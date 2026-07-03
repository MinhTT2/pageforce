import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
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

  function moveItem(index: number, delta: number) {
    const nextIndex = index + delta;

    if (nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
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
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Move ${label.toLowerCase()} ${index + 1} up`}
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
              >
                <ArrowUp size={14} />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Move ${label.toLowerCase()} ${index + 1} down`}
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
              >
                <ArrowDown size={14} />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                disabled={items.length <= 1}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          {renderItem(item, (patch) => updateItem(index, patch))}
        </div>
      ))}
    </div>
  );
}
