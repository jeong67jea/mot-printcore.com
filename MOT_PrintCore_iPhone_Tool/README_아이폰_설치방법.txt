MOT PrintCore 아이폰 결제안내 도구
====================================

이 도구는 원본 HTML을 아이폰 Safari와 홈 화면 웹앱에서 사용하도록 보완한 버전입니다.
기존 홈페이지의 index.html을 덮어쓰지 마십시오.

[방법 1 — 가장 간단함: HTML 파일 1개]
1. mot-payment-iphone.html 또는 MOT_PrintCore_iPhone.html 파일 1개를 GitHub Pages 저장소의 최상위에 업로드합니다.
2. 기존 홈페이지 index.html은 변경하거나 덮어쓰지 않습니다.
3. 아이폰 Safari에서 아래 형식의 주소로 접속합니다.
   https://사용자명.github.io/저장소명/mot-payment-iphone.html
4. Safari 공유 버튼 → “홈 화면에 추가”를 누릅니다.
5. 이후 홈 화면의 아이콘을 눌러 앱처럼 사용합니다.

이 방법은 설치가 가장 쉽고 아래 기능을 지원합니다.
- 주문정보 입력 및 즉시 반영
- 이메일 본문 복사
- 입력 완료 HTML을 iOS 공유 화면으로 저장
- 인쇄 및 PDF 저장
- 입력값 보관과 초기화

[방법 2 — 오프라인 사용 포함: PWA 폴더 전체]
1. ZIP 안의 MOT_PrintCore_iPhone_Tool 폴더 전체를 저장소 안에 그대로 업로드합니다.
2. 기존 홈페이지의 index.html과 충돌하지 않도록 반드시 별도 폴더로 유지합니다.
3. Safari 접속 주소 예:
   https://사용자명.github.io/저장소명/MOT_PrintCore_iPhone_Tool/
4. Safari 공유 버튼 → “홈 화면에 추가”를 선택합니다.
5. 최초 접속 후 필요한 파일이 캐시되므로 이후 오프라인 사용도 가능합니다.

[PWA 폴더 구조]
MOT_PrintCore_iPhone_Tool/
  index.html
  manifest.webmanifest
  service-worker.js
  icons/
    icon-180.png
    icon-192.png
    icon-512.png

[아이폰 버튼 사용]
- 내용 적용: 입력한 주문정보를 결제안내에 반영합니다.
- 이메일 본문 복사: 메일 본문을 길게 누른 뒤 “붙여넣기”를 선택합니다.
- 입력 완료 HTML 저장: iOS 공유 화면에서 “파일에 저장”을 선택합니다.
- 인쇄/PDF 저장: 인쇄 미리보기를 두 손가락으로 확대 → 공유 → “파일에 저장”을 선택합니다.
- 입력 초기화: 화면과 저장된 입력값을 초기화합니다.

[중요]
- 아이폰 파일 앱에서 HTML을 직접 누르면 JavaScript가 제한될 수 있습니다.
- Safari의 GitHub Pages HTTPS 주소에서 실행해야 모든 기능이 가장 안정적입니다.
- 앱스토어 설치, 유료 앱 또는 Xcode 빌드는 필요하지 않습니다.
