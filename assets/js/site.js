
(function(){
 const cfg=window.MOT_CONFIG||{};
 document.querySelectorAll("[data-config]").forEach(el=>{
   const path=el.dataset.config.split(".");
   let value=cfg; path.forEach(k=>value=value&&value[k]);
   if(value && !String(value).includes("입력하세요") && !String(value).includes("YOUR_")) el.textContent=value;
 });
 const menu=document.querySelector(".menu-btn"), nav=document.querySelector(".navlinks");
 if(menu) menu.addEventListener("click",()=>nav.classList.toggle("open"));
 const dict={
  ko:{home:"홈",services:"서비스",portfolio:"포트폴리오",academy:"아카데미",business:"사업·계약",contact:"문의"},
  en:{home:"Home",services:"Services",portfolio:"Portfolio",academy:"Academy",business:"Business",contact:"Contact"},
  zh:{home:"首页",services:"服务",portfolio:"技术组合",academy:"学院",business:"商务与合同",contact:"联系"}
 };
 let lang=localStorage.getItem("motLang")||"ko";
 function apply(l){
   lang=l; localStorage.setItem("motLang",l); document.documentElement.lang=l==="zh"?"zh-CN":l;
   document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(dict[l]&&dict[l][k])el.textContent=dict[l][k]});
   document.querySelectorAll(".lang button").forEach(b=>b.classList.toggle("active",b.dataset.lang===l));
 }
 document.querySelectorAll(".lang button").forEach(b=>b.addEventListener("click",()=>apply(b.dataset.lang))); apply(lang);
 const form=document.querySelector("[data-mail-form]");
 if(form) form.addEventListener("submit",e=>{
   e.preventDefault(); const d=new FormData(form), email=(cfg.company||{}).customerServiceEmail||"";
   if(!email || email.includes("YOUR_")){alert("assets/js/site-config.js에 고객지원 이메일을 먼저 입력하세요.");return}
   const subject=encodeURIComponent("[M.O.T. 문의] "+(d.get("subject")||"기술 프로젝트"));
   const body=encodeURIComponent([...d.entries()].map(([k,v])=>k+": "+v).join("\n"));
   location.href=`mailto:${email}?subject=${subject}&body=${body}`;
 });
 document.querySelectorAll("[data-year]").forEach(x=>x.textContent=new Date().getFullYear());
})();
