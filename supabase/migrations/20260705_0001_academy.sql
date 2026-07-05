-- M.O.T. PrintCore Academy: secure content, order and entitlement model.
-- Apply in Supabase SQL Editor before deploying Edge Functions.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  content_kind text not null check (content_kind in ('pdf','video','membership')),
  access_type text not null default 'one_time' check (access_type in ('one_time','monthly_manual')),
  membership_group text,
  title_ko text not null,
  title_en text not null,
  title_zh text not null,
  description_ko text,
  description_en text,
  description_zh text,
  audience_ko text,
  audience_en text,
  audience_zh text,
  price_krw integer not null check (price_krw >= 0),
  storage_path text,
  preview_url text,
  is_published boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  title_ko text not null,
  title_en text not null,
  title_zh text not null,
  storage_path text not null,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  unique(product_id, slug)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  amount_krw integer not null check (amount_krw >= 0),
  currency text not null default 'KRW',
  provider text not null default 'PORTONE_V2',
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','refunded')),
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  membership_group text,
  scope_key text not null,
  source_order_id uuid references public.orders(id) on delete set null,
  status text not null default 'active' check (status in ('active','revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, scope_key)
);

create table if not exists public.content_access_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  action text not null check (action in ('download','stream')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_entitlements_user_scope on public.entitlements(user_id, scope_key);
create index if not exists idx_lessons_product on public.lessons(product_id, sort_order);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists trg_entitlements_updated_at on public.entitlements;
create trigger trg_entitlements_updated_at before update on public.entitlements for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, email) values (new.id, new.email) on conflict (id) do update set email = excluded.email;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_academy_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.content_access_log enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid() or public.is_academy_admin());
create policy "products_public_read" on public.products for select using (is_published = true or public.is_academy_admin());
create policy "products_admin_write" on public.products for all using (public.is_academy_admin()) with check (public.is_academy_admin());
create policy "lessons_admin_readwrite" on public.lessons for all using (public.is_academy_admin()) with check (public.is_academy_admin());
create policy "orders_read_own" on public.orders for select using (user_id = auth.uid() or public.is_academy_admin());
create policy "entitlements_read_own" on public.entitlements for select using (user_id = auth.uid() or public.is_academy_admin());
create policy "access_log_read_own" on public.content_access_log for select using (user_id = auth.uid() or public.is_academy_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('academy-content','academy-content',false,5368709120,array['application/pdf','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=false;
insert into storage.buckets (id, name, public, file_size_limit)
values ('academy-previews','academy-previews',true,104857600)
on conflict (id) do update set public=true;

create policy "academy_content_admin_only" on storage.objects for all to authenticated using (bucket_id = 'academy-content' and public.is_academy_admin()) with check (bucket_id = 'academy-content' and public.is_academy_admin());
create policy "academy_previews_public_read" on storage.objects for select using (bucket_id = 'academy-previews');
create policy "academy_previews_admin_write" on storage.objects for all to authenticated using (bucket_id = 'academy-previews' and public.is_academy_admin()) with check (bucket_id = 'academy-previews' and public.is_academy_admin());

-- Draft catalog examples. Upload the source files privately and publish only after review.
insert into public.products(slug,content_kind,access_type,title_ko,title_en,title_zh,description_ko,description_en,description_zh,audience_ko,audience_en,audience_zh,price_krw,sort_order,is_published)
values
('digital-design-system-guide','pdf','one_time','Digital Design System 실무 가이드','Digital Design System Practical Guide','数字化设计系统实务指南','설계표준·CTQ·Gate Review를 실무 흐름으로 정리한 기술자료입니다.','A practical technical guide to design standards, CTQ and gate reviews.','围绕设计标准、CTQ和阶段评审的实务技术资料。','개발·설계·품질 리더','R&D, design and quality leaders','研发、设计与质量负责人',79000,10,false),
('dr-jh30-developer-roller-manufacturing','pdf','one_time','DR JH30 실리콘 Developer Roller 제조 가이드','DR JH30 Silicone Developer Roller Manufacturing Guide','DR JH30硅胶显影辊制造指南','도전성 실리콘, PU 코팅, Dipping·Spray 비교와 관리 포인트를 다룹니다.','Conductive silicone, PU coating, and process-control guidance for developer rollers.','涵盖导电硅胶、PU涂层以及显影辊工艺控制。','DR·코팅·공정 엔지니어','DR, coating and process engineers','显影辊、涂层与工艺工程师',79000,20,false),
('printing-core-components-course','video','one_time','프린팅 핵심부품 실무 강좌','Printing Core Components Practice Course','打印核心部件实务课程','DR·PCR·MR·OPC·Cleaning Blade의 기능, CTQ, 불량 해석을 다루는 영상 과정입니다.','A video course on functions, CTQ and defect analysis for DR, PCR, MR, OPC and cleaning blades.','讲解DR、PCR、MR、OPC及清洁刮刀的功能、CTQ和不良分析。','프린팅 부품 개발·품질 담당자','Printing component development and quality teams','打印部件开发与质量人员',149000,30,false),
('design-standard-library','membership','monthly_manual','설계표준 문서 라이브러리','Design-Standard Document Library','设计标准文档库','월간 업데이트되는 CTQ·도면품질·공차·검증 체크리스트 열람권입니다.','Monthly access to updated CTQ, drawing quality, tolerance and verification checklists.','按月更新的CTQ、图纸质量、公差与验证检查表访问权限。','설계·제조 조직','Engineering and manufacturing teams','设计与制造团队',59000,40,false),
('printcore-academy-membership','membership','monthly_manual','PrintCore Academy 멤버십','PrintCore Academy Membership','PrintCore Academy会员','전문 강좌·문서 라이브러리·신규 콘텐츠 우선공개를 포함한 월간 이용권입니다.','Monthly access to courses, document library and early releases.','包含课程、文档库及新内容优先访问的月度会员。','개인 기술전문가·팀 리더','Individual professionals and team leaders','个人技术专家与团队负责人',129000,50,false)
on conflict (slug) do nothing;

update public.products set membership_group = 'library' where slug = 'design-standard-library';
update public.products set membership_group = 'academy' where slug = 'printcore-academy-membership';

insert into public.products(slug,content_kind,access_type,title_ko,title_en,title_zh,description_ko,description_en,description_zh,audience_ko,audience_en,audience_zh,price_krw,sort_order,is_published)
values ('rubber-formulation-training-deck','pdf','one_time','대표고무 표준배합 교육자료','Standard Rubber Formulation Training Deck','代表橡胶标准配方培训资料','대표 고무계의 배합 원리, Grade 예시와 공정 설계 포인트를 정리한 교육자료입니다.','Training material on rubber formulation principles, grade examples and process-design points.','介绍橡胶配方原理、牌号示例和工艺设计要点的培训资料。','고무 소재·공정 엔지니어','Rubber material and process engineers','橡胶材料与工艺工程师',79000,25,false)
on conflict (slug) do nothing;
