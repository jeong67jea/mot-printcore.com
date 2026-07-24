/*
  M.O.T. PrintCore Academy - Public Video Preview Catalog

  게시 방법
  1) MP4 파일을 아래 경로와 파일명으로 업로드합니다.
     - downloads/previews/videos/korean/
     - downloads/previews/videos/chinese/
  2) 일부만 공개: PUBLISH_ALL = false 상태에서 PUBLISHED_VIDEO_NOS에 번호를 추가합니다.
     예: const PUBLISHED_VIDEO_NOS = ['01', '02'];
  3) 33개 한국어/중국어 파일을 모두 올린 뒤 전체 공개: PUBLISH_ALL = true로 변경합니다.

  주의: GitHub 공개 저장소의 MP4는 누구나 주소를 통해 열거나 저장할 수 있습니다.
*/
(function () {
  'use strict';

  // ===== 사용자가 수정할 곳 =====
  const PUBLISH_ALL = false;
  const PUBLISHED_VIDEO_NOS = ['01'];
  // ============================

  const COURSES = [
  {
    "no": "01",
    "slug": "01_DDMC_preview",
    "koTitle": "디지털 디자인 프로세스를 통한 제품 개발에 대한 비디오 강좌",
    "koDesc": "디지털 디자인 프로세스를 활용하여 표준 설계에의한 제품개발에 대한 영상 Preview입니다.",
    "enTitle": "Video course on product development through the digital design process",
    "enDesc": "This is a video preview of product development based on standard design utilizing a digital design process.",
    "zhTitle": "通过数字设计流程进行产品开发的视频课程",
    "zhDesc": "这是基于标准设计并采用数字化设计流程的产品开发视频预览",
    "koFile": "downloads/previews/videos/korean/kr_01_DDMC_Preview.mp4",
    "zhFile": "downloads/previews/videos/chinese/cn_01_DDMC_Preview.mp4"
  },
  {
    "no": "02",
    "slug": "02_""_preview",
    "koTitle": " ",
    "koDesc": " ",
    "enTitle": " ",
    "enDesc": " ",
    "zhTitle": " ",
    "zhDesc": " ",
    "koFile": " ",
    "zhFile": " "
  },
];

  const BUTTON_TEXT = {
    ko: { ko: '한국어 영상', zh: '中文 영상' },
    en: { ko: 'Korean Video', zh: 'Chinese Video' },
    zh: { ko: '韩文视频', zh: '中文视频' }
  };

  function normalizeLang(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.startsWith('zh') || raw === 'cn' || raw === 'chinese') return 'zh';
    if (raw.startsWith('en')) return 'en';
    return 'ko';
  }

  function getCurrentLang(explicitLang) {
    if (explicitLang) return normalizeLang(explicitLang);
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang) return normalizeLang(urlLang);
    } catch (_) {}
    try {
      const stored = localStorage.getItem('mot-lang') || localStorage.getItem('academy-lang') || localStorage.getItem('lang');
      if (stored) return normalizeLang(stored);
    } catch (_) {}
    return normalizeLang(document.documentElement.lang || 'ko');
  }

  function isPublished(no) {
    return PUBLISH_ALL || PUBLISHED_VIDEO_NOS.includes(String(no).padStart(2, '0'));
  }

  function getPublishedCourses() {
    return COURSES.filter((course) => isPublished(course.no));
  }

  function getCourse(no) {
    const normalized = String(no || '').padStart(2, '0');
    return COURSES.find((course) => course.no === normalized) || null;
  }

  function textFor(course, lang, field) {
    const prefix = lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'ko';
    return course[prefix + field] || course['ko' + field] || '';
  }

  function playerUrl(no, language) {
    return 'preview-video.html?id=' + encodeURIComponent(no) + '&lang=' + encodeURIComponent(language);
  }

  function createVideoCard(course) {
    const card = document.createElement('article');
    card.className = 'preview-card preview-video-card';
    card.setAttribute('data-preview-type', 'video');
    card.setAttribute('data-video-no', course.no);
    card.setAttribute('data-generated-video-card', 'true');

    const number = document.createElement('span');
    number.className = 'book-no';
    number.textContent = 'V' + course.no;

    const title = document.createElement('h3');
    const description = document.createElement('p');

    const buttons = document.createElement('div');
    buttons.className = 'preview-buttons';

    const koLink = document.createElement('a');
    koLink.href = playerUrl(course.no, 'ko');
    koLink.setAttribute('data-video-language', 'ko');
    koLink.setAttribute('aria-label', course.koTitle + ' 한국어 영상 Preview');

    const zhLink = document.createElement('a');
    zhLink.href = playerUrl(course.no, 'zh');
    zhLink.setAttribute('data-video-language', 'zh');
    zhLink.setAttribute('aria-label', course.zhTitle + ' 中文视频 Preview');

    buttons.append(koLink, zhLink);
    card.append(number, title, description, buttons);
    return card;
  }

  function applyVideoLanguage(lang) {
    const current = getCurrentLang(lang);
    const section = document.getElementById('technical-book-previews');
    if (!section) return;

    section.querySelectorAll('[data-generated-video-card="true"]').forEach((card) => {
      const course = getCourse(card.getAttribute('data-video-no'));
      if (!course) return;
      const title = card.querySelector('h3');
      const description = card.querySelector('p');
      const koLink = card.querySelector('[data-video-language="ko"]');
      const zhLink = card.querySelector('[data-video-language="zh"]');
      if (title) title.textContent = textFor(course, current, 'Title');
      if (description) description.textContent = textFor(course, current, 'Desc');
      if (koLink) koLink.textContent = BUTTON_TEXT[current].ko;
      if (zhLink) zhLink.textContent = BUTTON_TEXT[current].zh;
    });
  }

  function renderVideoCards() {
    const grid = document.getElementById('preview-content-grid');
    if (!grid) return;

    grid.querySelectorAll('[data-generated-video-card="true"]').forEach((card) => card.remove());
    getPublishedCourses().forEach((course) => grid.appendChild(createVideoCard(course)));
    applyVideoLanguage(getCurrentLang());

    document.dispatchEvent(new CustomEvent('mot:preview-video-catalog-ready', {
      detail: { publishedCount: getPublishedCourses().length }
    }));
  }

  window.MOTPreviewVideoCatalog = {
    courses: COURSES,
    isPublished,
    getCourse,
    getPublishedCourses,
    textFor,
    normalizeLang
  };

  document.addEventListener('mot:localechange', (event) => {
    applyVideoLanguage(event.detail && event.detail.locale);
  });
  document.addEventListener('mot:academy-languagechange', (event) => {
    applyVideoLanguage(event.detail && event.detail.locale);
  });
  window.addEventListener('storage', () => applyVideoLanguage(getCurrentLang()));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderVideoCards);
  } else {
    renderVideoCards();
  }
})();
