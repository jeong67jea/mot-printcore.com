/*
  M.O.T. Commercial Operations Configuration
  ---------------------------------------------------------------------
  1) Replace all values inside {{ ... }} before publishing.
  2) Never store a PG secret key, Stripe secret key, API key, password,
     or bank-account login in GitHub Pages.
  3) 'checkoutUrl' is a hosted checkout / storefront / membership URL.
*/
window.MOT_COMMERCE_CONFIG = {
  company: {
    brand: "M.O.T. Technology Innovation Lab",
    legalName: "엠오티(M.O.T)",
    representative: "최정재",
    businessRegistrationNo: "642-91-00194",
    mailOrderRegistrationNo: "525101",
    address: "saeunro 126 Yongin-city Gyeonggi-do south Korea",
    customerServiceEmail: "choijjai42@gmail.com",
    billingEmail: "choijjai42@gmail.com",
    privacyOfficer: "jeongjae choi",
    privacyEmail: "choijjai42@gmail.com"
  },

  policy: {
    currency: "KRW",
    priceBasis: "VAT_EXCLUSIVE", // VAT_EXCLUSIVE | VAT_INCLUSIVE
    domesticCheckoutLabel: "국내 결제",
    globalCheckoutLabel: "International checkout",
    serviceInquiryEmail: "choijjai42@gmail.com",
    contentSupportEmail: "choijjai42@gmail.com"
  },

  /*
    Set these after creating hosted checkout links.
    - PDF 1회 판매: '구매 후 다운로드 전달' 기능이 있는 플랫폼의 상품 URL
    - 멤버십: 로그인·구독·콘텐츠 권한관리를 제공하는 플랫폼의 멤버십 URL
    - B2B 서비스: 결제 링크보다 견적·계약·청구서 방식이 기본입니다.
  */
  checkouts: {
    pdfSingle: "academy.html?focus=pdf",
    pdfLibraryMonthly: "academy.html?focus=subscription",
    academyCourse: "academy.html?focus=video",
    academyMembership: "academy.html?focus=subscription"
  },

  /* Initial public price architecture. Change only after reviewing costs and market response. */
  offers: {
    b2b: [
      {
        code: "DIAGNOSIS",
        name: "기술진단 프로젝트",
        duration: "2주 기준",
        startingPrice: "₩3,800,000~",
        payment: "계약 후 100% 선결제",
        includes: ["대상 1개 품목 또는 1개 핵심 문제", "사전 데이터 검토", "원인 가설 및 시험계획", "결과보고서 및 온라인 리뷰 2회"],
        excludes: "현장 출장, 시료 제작, 외부 분석·시험, 통번역, 운송비는 별도"
      },
      {
        code: "SPRINT",
        name: "수율·불량 개선 Sprint",
        duration: "8주 기준",
        startingPrice: "₩16,000,000~",
        payment: "착수 50% / 중간 30% / 종료 20%",
        includes: ["CTQ 및 문제 구조화", "DOE·MSA 검증 설계", "개선안·Control Plan", "표준작업 및 재발방지안"],
        excludes: "현장 상주, 장비·치구·재료 구매, 외부 시험·측정은 별도"
      },
      {
        code: "CO_DEV",
        name: "핵심부품 공동개발",
        duration: "3~6개월 이상",
        startingPrice: "₩50,000,000~",
        payment: "착수 40% / 설계동결 30% / 시제품검증 20% / 이관 10%",
        includes: ["요구사양·CTQ·개발계획", "소재·구조·공정 조건 검토", "시제품·신뢰성 평가 계획", "양산 기준·검사 기준·기술이관"],
        excludes: "금형, 장비, 시료, 지식재산권 출원, 외부 인증·시험은 별도"
      },
      {
        code: "ADVISORY",
        name: "월간 기술고문",
        duration: "월 단위",
        startingPrice: "₩4,500,000~/월",
        payment: "매월 선결제",
        includes: ["월간 기술회의", "개발·품질 이슈 자문", "데이터·시험계획 리뷰", "경영진 또는 개발팀 브리핑"],
        excludes: "현장 방문일, 출장비 및 별도 개발 과제는 별도 계약"
      },
      {
        code: "EDU",
        name: "기업 기술교육",
        duration: "반일 / 1일",
        startingPrice: "₩2,000,000~ / ₩3,800,000~",
        payment: "교육일 7영업일 전 100% 결제",
        includes: ["맞춤형 강의자료", "질의응답", "참석자용 학습자료", "교육 후 핵심 개선과제 요약"],
        excludes: "교통·숙박·통역·장소·인쇄물·실습재료는 별도"
      }
    ],
    content: [
      {
        sku: "PDF-SINGLE",
        kind: "PDF DOWNLOAD",
        name: "기술서적 단권 구매",
        price: "₩79,000 / 권",
        billing: "1회 결제 · 개인용 영구 열람",
        access: "결제 서버 검증 후 비공개 파일의 제한시간 다운로드 링크 발급",
        button: "단권 구매",
        checkoutKey: "pdfSingle",
        note: "다운로드형 파일은 공급이 시작된 뒤에는 환불 제한 정책이 적용됩니다. 결제 전 미리보기와 목차를 반드시 확인하십시오."
      },
      {
        sku: "PDF-LIBRARY",
        kind: "DOCUMENT LIBRARY",
        name: "설계표준 문서 라이브러리",
        price: "₩59,000 / 월",
        billing: "자동갱신 구독 · 언제든 다음 결제일 전 해지",
        access: "로그인 기반 열람. 월간 업데이트 문서·체크리스트 제공",
        button: "라이브러리 구독",
        checkoutKey: "pdfLibraryMonthly",
        note: "구독형 라이브러리는 열람권 모델입니다. 전체 원문 PDF 일괄 다운로드 권한은 포함하지 않습니다."
      },
      {
        sku: "VIDEO-COURSE",
        kind: "ON-DEMAND COURSE",
        name: "프린팅 핵심부품 실무 강좌",
        price: "₩149,000 / 과정",
        billing: "1회 결제 · 과정별 수강권",
        access: "로그인 기반 HD 스트리밍, 진도관리, 학습자료 제공",
        button: "과정 수강",
        checkoutKey: "academyCourse",
        note: "강의 구성 완료 전에는 사전등록 또는 대기목록으로 운영하십시오. 공개 강의 링크만으로 유료 영상을 제공하지 마십시오."
      },
      {
        sku: "ACADEMY-MEMBER",
        kind: "MEMBERSHIP",
        name: "PrintCore Academy 멤버십",
        price: "₩129,000 / 월",
        billing: "자동갱신 구독 · 월간 해지 가능",
        access: "전문 강좌, 설계표준 라이브러리, 월간 Q&A, 신규 콘텐츠 우선공개",
        button: "멤버십 시작",
        checkoutKey: "academyMembership",
        note: "멤버십은 계정 1인 사용 기준입니다. 고객사 단체 이용은 별도 기업 라이선스로 견적하십시오."
      }
    ]
  }
};
