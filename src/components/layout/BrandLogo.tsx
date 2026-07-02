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
            "block font-semibold tracking-normal",
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
      <rect width="40" height="40" rx="10" fill="var(--primary)" />
      <path
        d="M12 10.5C12 9.67 12.67 9 13.5 9h11.1L31 15.4v14.1c0 .83-.67 1.5-1.5 1.5h-16c-.83 0-1.5-.67-1.5-1.5v-19Z"
        fill="var(--primary-foreground)"
        opacity="0.95"
      />
      <path
        d="M24.5 9v5.25c0 .69.56 1.25 1.25 1.25H31"
        fill="var(--accent)"
      />
      <path
        d="M21.1 15.2 16 22h4.05l-1.15 5.8 5.25-7.2h-4.02l.97-5.4Z"
        fill="var(--primary)"
      />
      <path
        d="M15.5 13h5.75M15.5 28h7"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeWidth="1.8"
        opacity="0.35"
      />
    </svg>
  );
}
