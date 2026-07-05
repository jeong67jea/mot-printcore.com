import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
export function scopeFor(product: any) { return product.membership_group ? `group:${product.membership_group}` : `product:${product.id}`; }
export async function hasAccess(client: SupabaseClient, userId: string, product: any) {
  const scopes = [`product:${product.id}`];
  if (product.membership_group) scopes.push(`group:${product.membership_group}`);
  const { data, error } = await client.from("entitlements").select("*").eq("user_id", userId).eq("status", "active").in("scope_key", scopes);
  if (error) throw error;
  const now = Date.now();
  return (data || []).some((e: any) => !e.expires_at || new Date(e.expires_at).getTime() > now);
}
export async function grantAccess(client: SupabaseClient, userId: string, product: any, orderId: string) {
  const scope_key = scopeFor(product);
  const { data: old } = await client.from("entitlements").select("*").eq("user_id", userId).eq("scope_key", scope_key).maybeSingle();
  let expires_at: string | null = null;
  if (product.access_type === "monthly_manual") {
    const oldExpiry = old?.expires_at ? new Date(old.expires_at).getTime() : 0;
    const start = Math.max(Date.now(), oldExpiry);
    expires_at = new Date(start + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  const row = { user_id:userId, product_id:product.membership_group ? null : product.id, membership_group:product.membership_group || null, scope_key, source_order_id:orderId, status:"active", starts_at:new Date().toISOString(), expires_at };
  const { error } = await client.from("entitlements").upsert(row,{onConflict:"user_id,scope_key"});
  if (error) throw error;
}
