import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const productLinks = [
  { href: "/login", label: "Start building" },
];

const websiteInfo = ["Multipage website builder", "Live page saving", "Public site sharing"];

const socialLinks = [
  { href: "#", label: "Facebook", icon: FacebookIcon },
  { href: "#", label: "Instagram", icon: InstagramIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.4fr_0.8fr_1fr_0.8fr]">
        <div>
          <BrandLogo size="sm" />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Multipage website builder for fast launches.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pageforce. All rights reserved.
          </p>
        </div>

        <FooterGroup title="Product">
          {productLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </FooterGroup>

        <FooterGroup title="Website">
          {websiteInfo.map((item) => (
            <span key={item} className="text-sm text-muted-foreground">
              {item}
            </span>
          ))}
        </FooterGroup>

        <FooterGroup title="Social">
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              >
                <link.icon className="size-4" />
              </a>
            ))}
          </div>
        </FooterGroup>
      </div>
    </footer>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.2 8.4V6.8c0-.78.52-.96.88-.96h2.24V2.1L14.24 2c-3.42 0-4.2 2.56-4.2 4.2v2.2H7.35v3.92h2.69V22h4.16v-9.68h3.09l.41-3.92h-3.5Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}
