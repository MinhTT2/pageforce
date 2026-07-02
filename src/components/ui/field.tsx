import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = React.ComponentProps<"div"> & {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
};

function Field({
  label,
  description,
  error,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div data-slot="field" className={cn("grid gap-2", className)} {...props}>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {children}
      </label>
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
