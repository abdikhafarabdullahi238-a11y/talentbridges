import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("TalentBridge is temporarily unavailable.");
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}` && key.startsWith("sb_"))
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const [mentors, opportunities] = await Promise.all([
    db.from("mentors").select("*").order("name"),
    db.from("opportunities").select("*").eq("status", "open").order("created_at"),
  ]);
  if (mentors.error || opportunities.error)
    throw new Error(mentors.error?.message || opportunities.error?.message);
  return { mentors: mentors.data ?? [], opportunities: opportunities.data ?? [] };
});
export const getWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const uid = context.userId;
    const [
      profile,
      role,
      requests,
      applications,
      notifications,
      messages,
      opportunities,
      candidates,
      documents,
    ] = await Promise.all([
      db.from("profiles").select("*").eq("id", uid).maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", uid).maybeSingle(),
      db.from("mentor_requests").select("*").order("created_at", { ascending: false }),
      db.from("applications").select("*").order("created_at", { ascending: false }),
      db.from("notifications").select("*").order("created_at", { ascending: false }),
      db.from("messages").select("*").order("created_at"),
      db.from("opportunities").select("*").eq("employer_id", uid),
      db.from("profiles").select("*").neq("id", uid),
      db.from("profile_documents").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    for (const result of [
      profile,
      role,
      requests,
      applications,
      notifications,
      messages,
      opportunities,
      candidates,
      documents,
    ])
      if (result.error) throw new Error(result.error.message);
    const demos = await db.from("demo_candidates").select("*");
    return {
      userId: uid,
      profile: profile.data,
      role: role.data?.role ?? "professional",
      requests: requests.data ?? [],
      applications: applications.data ?? [],
      notifications: notifications.data ?? [],
      messages: messages.data ?? [],
      opportunities: opportunities.data ?? [],
      candidates: candidates.data ?? [],
      demoCandidates: demos.data ?? [],
      documents: documents.data,
    };
  });
