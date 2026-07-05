import { corsHeaders, json } from "../_shared/cors.ts";
import { requireUser, serviceClient } from "../_shared/auth.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const auth=await requireUser(req);if(auth.response)return auth.response;
 try{
  const db=serviceClient();
  const {data:active,error}=await db.from("entitlements").select("*").eq("user_id",auth.user.id).eq("status","active");if(error)throw error;
  const now=Date.now(); const valid=(active||[]).filter((e:any)=>!e.expires_at||new Date(e.expires_at).getTime()>now);
  if(!valid.length)return json({items:[]});
  const ids=[...new Set(valid.map((e:any)=>e.product_id).filter(Boolean))]; const groups=[...new Set(valid.map((e:any)=>e.membership_group).filter(Boolean))];
  let productQuery=db.from("products").select("id,slug,content_kind,access_type,membership_group,title_ko,title_en,title_zh,description_ko,description_en,description_zh,is_published").eq("is_published",true);
  const {data:products,error:productError}=await productQuery;if(productError)throw productError;
  const items=(products||[]).filter((p:any)=>ids.includes(p.id)|| (p.membership_group&&groups.includes(p.membership_group))).map((p:any)=>{
    const entitlement=valid.find((e:any)=>e.product_id===p.id || (p.membership_group&&e.membership_group===p.membership_group));
    return {...p,expires_at:entitlement?.expires_at||null};
  });
  return json({items});
 }catch(error){console.error(error);return json({error:"Unable to load library"},500);}
});
