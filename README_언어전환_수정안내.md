# KO / EN / 中文 언어전환 수정본 안내

## 수정 범위

이번 수정본은 아래 모든 페이지에서 한국어·영어·중국어(간체) 전환이 독립적으로 동작하도록 재구성했습니다.

- `index.html` — 기업 메인 홈페이지
- `academy.html` — PrintCore Academy 콘텐츠 판매 페이지
- `my-library.html` — 구매자 라이브러리
- `player.html` — 교육 영상 시청 페이지
- `admin-content.html` — 관리자 콘텐츠 등록 페이지
- `payment-success.html` / `payment-failed.html` — 결제 결과 페이지
- `commerce.html` — B2B 계약·결제·콘텐츠 판매 안내
- `terms.html` / `privacy.html` / `refund.html` — 약관·개인정보·환불정책

## 이번에 수정한 핵심 원인

기존 Academy 페이지는 첫 단계에서 외부 Supabase 모듈을 불러오도록 되어 있었습니다.
외부 모듈 또는 인터넷 연결이 실패하면, 언어전환 코드도 같이 실행되지 않을 수 있었습니다.

수정본은 언어전환 기능을 결제·로그인·Supabase와 완전히 분리했습니다.
따라서 Supabase와 PortOne 설정 전에도 `KO / EN / 中文` 버튼은 즉시 작동합니다.

## 새로 추가된 파일

```text
assets/js/mot-locale.js       공통 언어 선택·URL·링크 전달 처리
assets/js/academy-ui.js       Academy 전용 정적 언어전환 처리
```

## 사용 방법

1. 기존 GitHub 저장소의 파일을 모두 삭제하지 말고, 이 ZIP을 압축 해제합니다.
2. 압축 해제된 폴더 안의 `index.html`, 모든 `.html` 파일 및 `assets` 폴더 전체를 저장소 루트에 덮어씁니다.
3. 아래 파일 4개가 반드시 GitHub에 업로드되었는지 확인합니다.

```text
assets/js/mot-locale.js
assets/js/academy-ui.js
assets/js/academy-i18n.js
assets/js/commerce-i18n.js
```

4. 배포 후 아래 주소로 점검합니다.

```text
.../index.html?lang=ko
.../index.html?lang=en
.../index.html?lang=zh
.../academy.html?lang=ko
.../academy.html?lang=en
.../academy.html?lang=zh
.../commerce.html?lang=ko
.../commerce.html?lang=en
.../commerce.html?lang=zh
```

언어 버튼을 누르면 선택 언어가 브라우저에 저장되며, 다른 페이지로 이동해도 같은 언어가 유지됩니다. 내부 링크에도 `?lang=ko`, `?lang=en`, `?lang=zh`가 자동으로 전달됩니다.

## GitHub 업로드 주의

`assets` 폴더 내부 구조가 유지되어야 합니다. GitHub 웹페이지에서 폴더 업로드가 불편하면 GitHub Desktop을 사용하십시오.

- GitHub Desktop에서 저장소를 `Clone`
- 이 ZIP의 전체 파일을 로컬 저장소에 덮어쓰기
- `Commit to main`
- `Push origin`

이 방법은 `assets/css`, `assets/js`, `assets/images`, `assets/downloads` 폴더 구조를 그대로 유지합니다.
