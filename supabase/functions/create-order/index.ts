import { corsHeaders, json } from "../_shared/cors.ts";
import { requireUser, serviceClient } from "../_shared/auth.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error:"Method not allowed" },405);
  const auth = await requireUser(req); if (auth.response) return auth.response;
  try {
    const { productSlug } = await req.json();
    if (!productSlug) return json({error:"productSlug required"},400);
    const db=serviceClient();
    const {data:product,error}=await db.from("products").select("*").eq("slug",productSlug).eq("is_published",true).single();
    if(error||!product) return json({error:"Product unavailable"},404);
    if(!Number.isInteger(product.price_krw)||product.price_krw<1) return json({error:"Invalid product price"},400);
    const paymentId=`mot-${crypto.randomUUID()}`;
    const {data:order,error:orderError}=await db.from("orders").insert({payment_id:paymentId,user_id:auth.user.id,product_id:product.id,amount_krw:product.price_krw,currency:"KRW",provider:"PORTONE_V2",status:"pending"}).select("id").single();
    if(orderError) throw orderError;
    return json({orderId:order.id,paymentId,orderName:product.title_ko,amount:product.price_krw,currency:"KRW"});
  } catch(error){ console.error(error); return json({error:"Unable to create order"},500); }
});
