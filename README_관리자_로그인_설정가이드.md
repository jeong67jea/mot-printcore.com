# M.O.T. PrintCore Academy — 관리자 로그인·업로드 설정 가이드

`admin-content.html`은 GitHub Pages의 단순 숨김 페이지가 아닙니다.

> **Supabase 이메일 인증 → 관리자 역할(role=admin) 확인 → RLS 정책 확인 → 비공개 Storage 업로드**

순서가 모두 통과해야 PDF·영상 업로드 화면이 열립니다.

## 1. 공개 웹 파일 설정

`assets/js/academy-config.js`를 열어 아래 두 값만 먼저 입력합니다.

```javascript
supabase: {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
}
```

`anonKey`는 공개 웹에서 사용 가능한 publishable/anon key입니다. Service-role key, database password, PortOne API Secret은 절대로 GitHub에 올리지 마십시오.

## 2. Supabase Authentication에 관리자 계정 만들기

Supabase Dashboard에서 다음 순서로 진행합니다.

1. **Authentication → Users → Add user**를 엽니다.
2. 사용할 관리자 이메일과 강력한 비밀번호를 등록합니다.
3. 이메일 인증이 필요한 설정이라면, 관리자 이메일의 인증을 완료합니다.
4. **Authentication → URL Configuration**에서 아래 주소를 `Redirect URLs`에 추가합니다.

```text
https://jeong67jea.github.io/mot-printcore.com/admin-content.html
```

새 도메인이나 새 repository를 사용하면 그 실제 주소도 추가합니다. Magic Link 로그인을 사용하려면 이 주소가 반드시 허용되어야 합니다.

## 3. 관리자 역할 부여 — 한 번만 수행

관리자 계정을 생성·인증한 다음 Supabase의 **SQL Editor**에서 아래 SQL을 실행합니다.

```sql
update public.profiles
   set role = 'admin'
 where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com');

select id, email, role
  from public.profiles
 order by created_at;
```

역할 부여는 Supabase Dashboard의 SQL Editor 또는 service-role 환경에서만 수행하십시오. 웹사이트의 공개 JavaScript에 `admin` 역할 변경 기능을 넣으면 안 됩니다.

그 다음 `supabase/migrations/20260705_0002_admin_signin.sql`을 실행하면 `profiles` 테이블에서 브라우저 사용자의 역할 변경 권한을 명시적으로 차단합니다.

## 4. 관리자 로그인 방법

`admin-content.html`에서 다음 중 하나를 사용합니다.

### A. 이메일 + 비밀번호

- Supabase Authentication에서 만든 관리자 이메일과 비밀번호로 로그인합니다.
- 로그인 후 `profiles.role = 'admin'`을 다시 확인합니다.
- 통과 시 상품 등록·PDF/영상 업로드 영역이 열립니다.

### B. 보안 Magic Link

- 같은 관리자 이메일을 입력하고 링크를 받습니다.
- 이메일 링크를 열면 `admin-content.html`로 돌아옵니다.
- 이메일 소유 인증 후에도 관리자 역할 검증을 다시 통과해야 업로드가 열립니다.

## 5. 첫 업로드 전 점검표

- [ ] `academy-config.js`에 Supabase URL과 anon key 입력
- [ ] `20260705_0001_academy.sql` 실행
- [ ] `20260705_0002_admin_signin.sql` 실행
- [ ] Supabase Auth에 관리자 계정 생성 및 이메일 인증 완료
- [ ] `profiles`의 해당 계정을 `role='admin'`으로 변경
- [ ] Auth Redirect URL에 `admin-content.html` 주소 추가
- [ ] Storage에 `academy-content`(Private)와 `academy-previews`(Public) 버킷 생성 확인
- [ ] 관리자 로그인 후 화면 상단에 **관리자 권한 확인됨** 표시 확인
- [ ] 1 MB 이하 PDF로 시험 업로드 후 product의 `storage_path`가 저장되는지 확인

## 6. 운영 원칙

- 유료 PDF·MP4 원본은 GitHub `assets/` 폴더에 올리지 않습니다.
- 관리자 계정은 개인별로 분리하고, 비밀번호를 공유하지 않습니다.
- 관리자가 여러 명이면 각자 Supabase 계정을 만들고 승인된 계정에만 `role='admin'`을 부여합니다.
- 퇴직·외주 종료 시 즉시 아래 SQL로 권한을 회수합니다.

```sql
update public.profiles
   set role = 'customer'
 where lower(email) = lower('FORMER_ADMIN_EMAIL@example.com');
```

## 7. 문제 해결

### 로그인은 됐지만 “관리자 권한이 없습니다”가 표시됨

`profiles`에서 해당 이메일의 `role` 값이 `admin`인지 확인합니다. 이메일은 대소문자 혼동을 피하기 위해 `lower(email)` 기준으로 업데이트합니다.

### Magic Link를 눌러도 Academy 또는 다른 페이지로 이동함

새 파일의 `assets/js/academy.js`가 업로드됐는지 확인합니다. 이 버전은 admin 페이지에서 요청한 Magic Link의 redirect 주소를 `admin-content.html`로 고정합니다.

### 업로드에 실패함

현재 로그인 계정이 `admin`인지, `academy-content` 버킷이 private인지, 0001/0002 SQL의 Storage RLS 정책이 실행됐는지, 파일 크기가 bucket의 최대 용량 이내인지 확인합니다.
