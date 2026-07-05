import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json } from "./cors.ts";
export function serviceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
export async function requireUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return { response: json({ error: "Unauthorized" }, 401) };
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { response: json({ error: "Unauthorized" }, 401) };
  return { user: data.user };
}
