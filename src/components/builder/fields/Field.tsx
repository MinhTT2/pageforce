import type { ReactNode } from "react";

export function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span>
        <span className="block text-sm font-medium text-card-foreground">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-3">
      <div>
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
