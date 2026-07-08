import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// cache() dedupes the Supabase Auth network round-trip when multiple server
// components (e.g. sidebar + page) resolve the user within one request.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }

  return user;
}
