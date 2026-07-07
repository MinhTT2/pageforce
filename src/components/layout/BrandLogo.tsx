import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  tagline?: string;
  size?: "sm" | "md";
  className?: string;
};

export function BrandLogo({
  href = "/",
  tagline,
  size = "md",
  className,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex shrink-0 items-center gap-3 text-foreground",
        className,
      )}
      aria-label="Pageforce home"
    >
      <BrandMark
        className={cn(
          "transition-transform group-hover:-translate-y-0.5",
          size === "sm" ? "size-8" : "size-10",
        )}
      />
      <span className="leading-none">
        <span
          className={cn(
            "block font-semibold tracking-normal text-foreground",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          Pageforce
        </span>
        {tagline ? (
          <span className="mt-1 block text-xs font-medium text-muted-foreground">
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function BrandMark({ className, ...props }: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Pageforce logo mark"
      className={className}
      {...props}
    >
      <rect width="40" height="40" rx="9" fill="#111111" />
      <path
        d="M11 10h15.2C31 10 34 12.8 34 17s-3 7-7.8 7H18v6h-7V10Z"
        fill="#FFFFFF"
      />
      <path d="M18 16h7.6c1 0 1.6.4 1.6 1.2s-.6 1.2-1.6 1.2H18V16Z" fill="#111111" />
      <path d="M11 32h18" stroke="#2DE38B" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}
