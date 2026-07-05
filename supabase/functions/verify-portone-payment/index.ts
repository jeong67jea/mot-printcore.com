import { corsHeaders, json } from "../_shared/cors.ts";
import { requireUser, serviceClient } from "../_shared/auth.ts";
import { grantAccess } from "../_shared/entitlements.ts";
Deno.serve(async (req) => {
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return json({error:"Method not allowed"},405);
  const auth=await requireUser(req); if(auth.response) return auth.response;
  try{
    const {orderId,paymentId}=await req.json(); if(!orderId||!paymentId)return json({error:"Missing order"},400);
    const db=serviceClient();
    const {data:order,error:orderError}=await db.from("orders").select("*,products(*)").eq("id",orderId).eq("user_id",auth.user.id).single();
    if(orderError||!order) return json({error:"Order not found"},404);
    if(order.payment_id!==paymentId) return json({error:"Payment ID mismatch"},400);
    if(order.status==="paid") return json({message:"Access already granted"});
    const secret=Deno.env.get("PORTONE_API_SECRET"); if(!secret) return json({error:"Payment server is not configured"},500);
    const response=await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`PortOne ${secret}`}});
    const payment=await response.json();
    if(!response.ok) return json({error:"Could not verify payment"},400);
    const paidAmount=Number(payment?.amount?.total ?? payment?.amount ?? 0);
    if(payment?.status!=="PAID"||paidAmount!==Number(order.amount_krw)) {
      await db.from("orders").update({status:"failed",provider_payload:payment}).eq("id",order.id);
      return json({error:"Payment is not confirmed"},400);
    }
    const {error:updateError}=await db.from("orders").update({status:"paid",paid_at:new Date().toISOString(),provider_payload:payment}).eq("id",order.id);
    if(updateError) throw updateError;
    await grantAccess(db,auth.user.id,order.products,order.id);
    return json({message:"Payment confirmed. Access has been granted."});
  }catch(error){console.error(error);return json({error:"Payment verification failed"},500);}
});
