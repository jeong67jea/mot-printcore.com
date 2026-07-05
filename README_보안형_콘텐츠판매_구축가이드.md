# M.O.T. PrintCore Academy — 보안형 콘텐츠 판매 구축 가이드

## 1. 이 구현의 운영 방식

이 웹사이트는 **GitHub Pages = 공개 판매 화면**, **Supabase = 회원·비공개 파일·권한·서버 기능**, **PortOne V2 = 결제창 및 결제 검증**으로 나누어 구성되어 있습니다.

```text
고객 → academy.html → 이메일 로그인(Supabase Auth)
     → 결제 요청(PortOne browser SDK)
     → 서버 결제 금액·상태 검증(Supabase Edge Function)
     → 권한(entitlement) 발급
     → PDF 제한시간 다운로드 URL 또는 영상 제한시간 스트리밍 URL
```

**중요:** 유료 PDF와 교육 동영상 원본은 GitHub에 업로드하지 않습니다. GitHub는 공개 저장소이므로 파일 주소가 노출되면 누구나 복사할 수 있습니다. 원본은 Supabase의 비공개 `academy-content` 버킷에 올립니다.

이 첫 버전의 월간 상품은 **30일 이용권 + 고객의 갱신 결제**입니다. 자동 카드 재결제는 PortOne 결제수단의 빌링키 지원·고객 동의·해지 화면·실패 재청구 정책을 확정한 뒤 2단계에서 적용하십시오.

---

## 2. 시작 전 준비물

1. GitHub Pages 저장소: `mot-printcore.com`
2. Supabase 계정 및 새 프로젝트 1개
3. PortOne V2 판매자 계정과 실제 결제채널 승인
4. 공개용 이메일 주소
5. 사업자 정보, 이용약관, 개인정보 처리방침, 환불·구독정책 확정본
6. 판매 권리와 기밀성 검토가 끝난 PDF·영상 원본

---

## 3. GitHub Pages 업로드

1. 본 ZIP을 풀어 기존 저장소의 루트에 **전체 덮어쓰기**합니다.
2. `academy.html`, `my-library.html`, `player.html`, `payment-success.html`, `payment-failed.html`, `admin-content.html`, `assets/`, `supabase/`가 모두 포함되는지 확인합니다.
3. `assets/js/academy-config.js`에서 아래 공개값을 수정합니다.

```javascript
supabase: {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_PUBLIC_KEY"
},
payment: {
  provider: "PORTONE_V2",
  testMode: true,
  storeId: "store-...",
  channelKey: "channel-key-..."
}
```

`anonKey`, `storeId`, `channelKey`는 브라우저에 공개되어도 되는 식별자입니다. **PortOne API Secret, Supabase Service Role Key, PG 비밀키는 절대 GitHub에 넣지 마십시오.**

---

## 4. Supabase 데이터베이스·스토리지 생성

1. Supabase Dashboard → **SQL Editor**를 엽니다.
2. `supabase/migrations/20260705_0001_academy.sql` 전체를 붙여넣고 Run합니다.
3. Authentication → URL Configuration에서 다음 주소를 추가합니다.

```text
https://jeong67jea.github.io/mot-printcore.com/my-library.html
https://jeong67jea.github.io/mot-printcore.com/academy.html
https://jeong67jea.github.io/mot-printcore.com/payment-success.html
```

4. Email provider를 활성화합니다. 최초에는 Supabase 기본 이메일 발송량이 제한될 수 있으므로, 실제 상업 운영 전에는 자체 SMTP를 연결하십시오.
5. 본인 이메일로 Academy에서 로그인한 뒤, SQL Editor에서 아래 명령으로 관리자 권한을 부여합니다.

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

6. Storage에 아래 버킷이 생성되었는지 확인합니다.

```text
academy-content  → Private
academy-previews → Public
```

---

## 5. Edge Function 비밀값 등록 및 배포

Supabase CLI에서 프로젝트에 로그인하고 링크합니다.

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

서버 비밀값을 등록합니다.

```bash
supabase secrets set \
  SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  PORTONE_API_SECRET="YOUR_PORTONE_V2_API_SECRET"
```

그 다음 4개의 Edge Function을 배포합니다.

```bash
supabase functions deploy create-order
supabase functions deploy verify-portone-payment
supabase functions deploy customer-library
supabase functions deploy access-content
```

각 함수의 JWT 검증은 기본값을 사용합니다. `service_role` 키는 Edge Function 내부에서만 사용되며, 프런트엔드 파일에 넣지 않습니다.

---

## 6. PortOne V2 연결과 테스트 결제

1. PortOne 관리자 화면에서 `storeId`, `channelKey`, V2 API Secret을 확인합니다.
2. `academy-config.js`에는 `storeId`, `channelKey`만 입력합니다.
3. V2 API Secret은 Supabase secrets에만 입력합니다.
4. 먼저 PortOne 테스트 결제 채널에서 아래 순서로 검증합니다.

```text
로그인 → 상품 선택 → 결제창 → payment-success.html → 서버 금액/상태 확인 → My Library 권한 발급 → PDF/영상 접근
```

5. 주문은 `orders`, 이용권은 `entitlements`, 접근 이력은 `content_access_log` 테이블에서 확인합니다.
6. 테스트가 끝난 뒤에만 `testMode: false`와 실제 채널 키로 전환합니다.

**결제 성공 화면만으로 권한을 부여하면 안 됩니다.** 이 구현은 `verify-portone-payment` 함수가 PortOne API에서 실제 결제 상태와 금액을 다시 확인한 뒤 권한을 발급하도록 만들었습니다.

---

## 7. 기술서적 PDF 업로드 방법

1. `admin-content.html`을 엽니다.
2. 관리자 이메일로 로그인합니다.
3. 상품을 신규 등록하거나 기존 초안을 선택합니다.
4. 제목·설명은 **한국어, 영어, 중국어**를 모두 작성합니다.
5. 처음에는 `공개 판매`를 체크하지 않습니다.
6. PDF 업로드에서 해당 상품을 선택하고 `Private PDF`를 선택합니다.
7. 파일 업로드 후 미리보기 파일이 있으면 `Public preview`로 별도 업로드합니다.
8. 가격, 환불 조건, 미리보기, 파일명, 저작권·기밀성 검토를 마친 뒤에만 `공개 판매`를 체크하고 저장합니다.

PDF 1회 구매자는 제한시간이 있는 signed URL을 받습니다. URL 만료시간은 `access-content` 함수의 `createSignedUrl(..., 600)`에서 600초로 설정되어 있습니다. 필요 시 300~900초 범위에서 조정하십시오.

---

## 8. 교육 동영상 업로드 방법

1. 동영상 상품을 등록하고 `content_kind = video`로 저장합니다.
2. Upload 영역에서 `Private video lesson`을 선택합니다.
3. Lesson ID는 예: `01-introduction`, `02-developer-roller-ctq` 형식으로 입력합니다.
4. Lesson title은 고객에게 표시될 이름입니다.
5. MP4(H.264/AAC, 1080p 이하 권장)를 올립니다.
6. 영상 과정 상품을 공개합니다.

이 버전은 영상 파일의 **제한시간 signed URL 스트리밍**을 제공합니다. 완전한 DRM·녹화 방지 기능은 아닙니다. 고가의 영상 과정은 향후 Mux, Vimeo OTT, Cloudflare Stream 같은 전용 영상 서비스와 연동하는 것이 더 안전합니다.

---

## 9. 상품 공개 전 점검표

- [ ] 판매권·저작권·회사 기밀·고객 정보 검토 완료
- [ ] PDF/영상에 타사 로고·개인정보·비공개 단가가 없는지 확인
- [ ] KO / EN / 中文 제목·설명 검토
- [ ] 가격·부가세 표시·환불 문구 검토
- [ ] PDF 미리보기 또는 목차 업로드
- [ ] 테스트 계정 결제 → 권한 → 다운로드/재생 확인
- [ ] 환불 발생 시 `orders.status=refunded`, `entitlements.status=revoked` 처리 절차 마련
- [ ] 고객지원 이메일과 응답 SLA 정함

---

## 10. 기존 자료 사용 원칙

`MOT_PrintCore_Private_Content_Upload_Source.zip`은 업로드 후보 자료를 별도로 분리한 것입니다. 이 ZIP은 **GitHub에 업로드하면 안 됩니다.**

기술자료는 외부 공개 가능한 범위인지 먼저 확인하십시오. 고객사명, 소재 배합, 공급가, 내부 치수, 미공개 제품 사양 등 민감 정보는 삭제·익명화한 판매용 버전만 올리십시오.

---

## 11. 운영상 한계와 2단계 확장

| 구분 | 현재 구현 | 2단계 권장 |
|---|---|---|
| PDF | 비공개 파일 + 제한시간 다운로드 URL | 구매자 이메일·주문번호 PDF 워터마크 자동 삽입 |
| 영상 | 제한시간 signed URL 스트리밍 | Mux/Vimeo/Cloudflare Stream DRM·도메인 제한 |
| 구독 | 30일 이용권 + 고객 갱신 결제 | PortOne 빌링키 기반 자동 정기결제·해지·실패재결제 |
| 환불 | 관리자 수동 처리 | PortOne 환불 API + 자동 권한 회수 웹훅 |
| 기업 고객 | 개인 계정 1인 사용 | 회사별 좌석 수·관리자·동시접속 제어 |

---

## 12. 반드시 지켜야 할 보안 원칙

- GitHub, JavaScript, HTML, CSS에 `PORTONE_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, PG 비밀번호를 넣지 않습니다.
- 유료 원본을 `assets/downloads/`에 넣지 않습니다.
- 결제 성공 redirect만 보고 권한을 주지 않습니다.
- 백엔드에서 결제 ID, 결제 상태, 금액, 주문 소유자를 모두 확인합니다.
- 환불·분쟁 발생 시 해당 entitlement를 즉시 `revoked` 처리합니다.
- 버전 관리와 접근 로그를 유지합니다.
