import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

// getClaims checks the signed token locally when possible, which saves a network round trip per page.
export async function requireUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) redirect("/login");
  return { sb, uid: uid as string };
}
