# M.O.T. Premium Technology Website — GitHub Pages 배포 가이드

이 폴더는 새 GitHub 저장소와 새 웹 주소에 올리도록 제작한 **완전 독립형 정적 홈페이지**입니다. 서버·데이터베이스·유료 플러그인이 필요하지 않습니다.

## 1. 포함된 기능

- 프리미엄 B2B 기술기업형 디자인: PC / 태블릿 / 모바일 반응형
- 한국어 · English · 中文 즉시 전환
- DR / PCR / MR 실물 제품 사진 기반의 기술 포트폴리오
- 프린팅 핵심부품·제조혁신·설계표준화·기술이전 서비스 소개
- 기술 문제 탐색 도구: 전기저항 / 표면·코팅 / 화질·현상 / 성형·공정 / 설계·표준
- 전문 경력 타임라인, 성과, 지식자산, 회사소개서 PDF 다운로드
- 이메일 문의 초안 생성 및 문의내용 복사 기능
- SEO 기본 메타태그, Open Graph 미리보기, favicon, `robots.txt`, `sitemap.xml`, 404 페이지

## 2. 새 GitHub 저장소 만들기

1. GitHub 로그인 → 우측 상단 `+` → **New repository**
2. 예시 저장소 이름: `mot-printcore` 또는 `mot-technology-lab`
3. Public 선택
4. `Add a README file`은 선택하지 않아도 됩니다.
5. **Create repository** 클릭

새 주소 예시:

```text
https://YOUR_GITHUB_USERNAME.github.io/mot-printcore/
```

## 3. 업로드 방법

1. `MOT_Premium_Technology_Website_GitHub_Pages.zip` 압축을 풉니다.
2. 새 저장소 화면에서 **Add file → Upload files** 선택
3. 압축을 푼 폴더 *안의 모든 파일과 폴더*를 드래그하여 업로드합니다.
4. 반드시 아래 구조가 저장소 최상단(root)에 그대로 올라가야 합니다.

```text
index.html
404.html
asset-notes.html
robots.txt
sitemap.xml
site.webmanifest
.nojekyll
assets/
  css/site.css
  js/site-config.js
  js/i18n.js
  js/site.js
  images/
  icons/
  downloads/
```

5. 하단 **Commit changes** 클릭

## 4. GitHub Pages 켜기

1. 저장소의 **Settings** → **Pages** 메뉴 선택
2. `Build and deployment`의 Source를 **Deploy from a branch**로 선택
3. Branch: `main`, Folder: `/(root)` 선택
4. **Save**
5. 약 1~5분 뒤 표시되는 `Visit site` 주소로 접속

## 5. 공개 전 반드시 수정할 파일

### A. 연락처 및 웹 주소

`assets/js/site-config.js`를 열어 다음 값만 실제 공개용 정보로 바꾸세요.

```javascript
window.MOT_CONFIG = {
  siteName: "M.O.T. Technology Innovation Lab",
  contactEmail: "YOUR_EMAIL@example.com",
  phoneDisplay: "+82 10 0000 0000",
  phoneLink: "+821000000000",
  wechat: "YOUR_WECHAT_ID",
  siteUrl: "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/"
};
```

전화번호는 `phoneDisplay`에는 보기 좋은 형식으로, `phoneLink`에는 공백 없는 국제번호 형식으로 넣습니다.

### B. robots.txt와 sitemap.xml

새 주소가 확정되면 `YOUR_GITHUB_USERNAME`과 `YOUR_REPOSITORY_NAME`을 실제 값으로 바꾸세요.

## 6. 문의 양식 작동 방식

GitHub Pages는 정적 호스팅이라 자체 서버 저장 기능이 없습니다. 따라서 이 홈페이지의 문의 양식은:

- 입력 내용을 저장하지 않음
- 버튼 클릭 시 등록한 공개 이메일 주소로 메일 초안 생성
- 별도 버튼으로 문의 내용을 복사하여 WeChat 등에 붙여넣기 가능

개인정보를 서버에 수집하지 않는 안전한 구조입니다. 자동 접수·첨부파일·CRM 연동이 필요할 때에는 Formspree, Google Form, 또는 자체 서버를 별도로 연결해야 합니다.

## 7. 이미지·기밀정보 확인

제품 사진은 제공받은 이미지로 구성되어 있습니다. 공개 전에 `asset-notes.html` 및 `ASSET_CREDITS.md`의 확인 항목을 검토하세요.

- 고객사명, OEM 로고, 비공개 도면, 인증문서, 세부 사양은 허가 없이 추가하지 않기
- 연락처는 공개용 정보만 입력하기
- 사진의 권리 및 공개 범위 최종 확인하기

## 8. 품질 확인 체크리스트

배포 후 PC와 모바일에서 확인하세요.

- 메인 화면의 DR / PCR / MR 사진이 정상 표시되는가
- 언어 전환 버튼이 정상 작동하는가
- 연락처가 실제 공개 정보로 표시되는가
- 회사소개서 PDF 다운로드가 정상 작동하는가
- 문의 양식에서 이메일 초안 또는 복사가 되는가
- GitHub Pages 주소가 `site-config.js`, `robots.txt`, `sitemap.xml`에 반영되었는가

