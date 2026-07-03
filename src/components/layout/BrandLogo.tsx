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
      <defs>
        <linearGradient
          id="pf-mark-bg"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4E56D3" />
          <stop offset="0.55" stopColor="#6D4FE0" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient
          id="pf-mark-shine"
          x1="20"
          y1="0"
          x2="20"
          y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#pf-mark-bg)" />
      <rect width="40" height="40" rx="10" fill="url(#pf-mark-shine)" />
      <path
        d="M21.95 6 7.45 23.4h13.05L19.05 35l14.5-17.4H20.5L21.95 6Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
