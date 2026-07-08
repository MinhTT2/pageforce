import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Public /s pages skip middleware entirely; nothing under /s reads the
  // session or the x-pageforce-current-path header.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|s$|s/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
