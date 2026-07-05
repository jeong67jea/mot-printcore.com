import { corsHeaders, json } from "../_shared/cors.ts";
import { requireUser, serviceClient } from "../_shared/auth.ts";
import { hasAccess } from "../_shared/entitlements.ts";
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const auth=await requireUser(req);if(auth.response)return auth.response;
 try{
  const {productSlug,lessonSlug,action}=await req.json();if(!productSlug)return json({error:"Missing product"},400);
  const db=serviceClient(); const {data:product,error}=await db.from("products").select("*").eq("slug",productSlug).eq("is_published",true).single();
  if(error||!product)return json({error:"Content unavailable"},404);
  if(!(await hasAccess(db,auth.user.id,product)))return json({error:"No access"},403);
  let path=product.storage_path;let lesson:any=null;
  if(action==="stream"){
    let q=db.from("lessons").select("*").eq("product_id",product.id).eq("is_published",true).order("sort_order").limit(1);
    if(lessonSlug)q=db.from("lessons").select("*").eq("product_id",product.id).eq("slug",lessonSlug).eq("is_published",true).limit(1);
    const result=await q.maybeSingle();lesson=result.data;if(result.error||!lesson)return json({error:"Lesson unavailable"},404);path=lesson.storage_path;
  }
  if(!path)return json({error:"Source file is not uploaded"},404);
  const options=action==="download"?{download:true}:{download:false}; const {data:urlData,error:urlError}=await db.storage.from("academy-content").createSignedUrl(path,600,options); if(urlError)throw urlError;
  await db.from("content_access_log").insert({user_id:auth.user.id,product_id:product.id,lesson_id:lesson?.id||null,action:action==="stream"?"stream":"download"});
  return json({url:urlData.signedUrl,product,lesson});
 }catch(error){console.error(error);return json({error:"Unable to issue access link"},500);}
});
