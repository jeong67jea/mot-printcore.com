(() => {
  const config = window.MOT_CONFIG || {};
  const dictionaries = window.MOT_I18N || {};
  const issueSets = window.MOT_ISSUES || {};
  const defaultLocale = "ko";
  const sharedLocale = window.MOTLocale;
  let locale = sharedLocale ? sharedLocale.init() : (localStorage.getItem("mot-locale") || defaultLocale);
  if (!dictionaries[locale]) locale = defaultLocale;
  let currentIssue = "resistance";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function isPlaceholder(value) {
    return !value || /YOUR_|example\.com|0000/.test(value);
  }

  function applyConfig() {
    $$('[data-config-email]').forEach((el) => {
      const email = config.contactEmail || 'YOUR_EMAIL@example.com';
      el.textContent = email;
      el.href = `mailto:${email}`;
    });
    $$('[data-config-phone]').forEach((el) => {
      const text = config.phoneDisplay || '+82 10 0000 0000';
      el.textContent = text;
      el.href = `tel:${config.phoneLink || text.replace(/[^+\d]/g, '')}`;
    });
    $$('[data-config-wechat]').forEach((el) => { el.textContent = config.wechat || 'YOUR_WECHAT_ID'; });

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && config.siteUrl && !isPlaceholder(config.siteUrl)) canonical.href = config.siteUrl;
  }

  function translate() {
    const dict = dictionaries[locale] || dictionaries[defaultLocale];
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.locale = locale;
    sharedLocale?.propagate(locale);
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(dict, key)) el.textContent = dict[key];
    });
    $$('[data-i18n-html]').forEach((el) => {
      const key = el.dataset.i18nHtml;
      if (Object.prototype.hasOwnProperty.call(dict, key)) el.innerHTML = dict[key];
    });

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      const descriptions = {
        ko: 'M.O.T. Technology Innovation Lab — 프린팅 핵심부품 개발, 제조혁신, 설계·제조 표준화 및 기술이전',
        en: 'M.O.T. Technology Innovation Lab — printing core component engineering, manufacturing innovation, design and manufacturing standardization.',
        zh: 'M.O.T. Technology Innovation Lab — 打印核心部件开发、制造创新、设计与制造标准化及技术移交。'
      };
      meta.content = descriptions[locale] || descriptions.ko;
    }
    const titles = {
      ko: 'M.O.T. | 프린팅 핵심부품·제조혁신',
      en: 'M.O.T. | PrintCore Engineering & Manufacturing Innovation',
      zh: 'M.O.T. | 打印核心部件与制造创新'
    };
    document.title = titles[locale] || titles.ko;

    const placeholders = {
      ko: { name: '회사명 / 담당자', region: '한국 / 중국 / 기타', product: '예: Developer Roller, PFA Tube', issue: '문제 현상, 현재 조건, 목표, 일정' },
      en: { name: 'Company / Name', region: 'Korea / China / Other', product: 'e.g. Developer Roller, PFA Tube', issue: 'Problem, current condition, target, schedule' },
      zh: { name: '公司 / 联系人', region: '韩国 / 中国 / 其他', product: '例如：Developer Roller、PFA Tube', issue: '问题现象、现有条件、目标、时间计划' }
    };
    const place = placeholders[locale] || placeholders.ko;
    const form = $('#project-form');
    if (form) {
      Object.entries(place).forEach(([name, value]) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) input.placeholder = value;
      });
    }

    $$('.lang-btn').forEach((button) => {
      const active = button.dataset.lang === locale;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateIssue(currentIssue);
  }

  function updateIssue(name) {
    currentIssue = name;
    const set = issueSets[locale] || issueSets[defaultLocale];
    const issue = set && set[name];
    if (!issue) return;
    const title = $('#issue-title');
    const body = $('#issue-body');
    const output = $('#issue-output');
    const index = $('.issue-index');
    const panel = $('#issue-panel');
    if (title) title.textContent = issue.title;
    if (body) body.textContent = issue.body;
    if (output) output.textContent = issue.output;
    if (index) index.textContent = issue.index;
    if (panel) panel.dataset.issue = name;
    $$('.issue-tab').forEach((button) => {
      const active = button.dataset.issue === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function bindMenu() {
    const menu = $('.menu-toggle');
    const nav = $('#primary-nav');
    if (!menu || !nav) return;
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  function bindHeader() {
    const header = $('.site-header');
    const progress = $('#read-progress');
    function update() {
      const top = window.scrollY || document.documentElement.scrollTop;
      header?.classList.toggle('is-scrolled', top > 10);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, (top / max) * 100) : 0}%`;
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function bindReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((item) => item.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: .08 });
    items.forEach((item) => observer.observe(item));
  }

  function bindNavigator() {
    $$('.issue-tab').forEach((button) => {
      button.addEventListener('click', () => updateIssue(button.dataset.issue));
    });
  }

  function notify(text, state = '') {
    const node = $('#form-note');
    if (!node) return;
    node.textContent = text;
    node.classList.remove('is-success', 'is-error');
    if (state) node.classList.add(state);
  }

  function projectBrief() {
    const form = $('#project-form');
    if (!form) return '';
    const data = new FormData(form);
   const labels = {
  ko: [
    '회사 / 담당자',
    '국가 / 지역',
    '회신 이메일',
    '대상 제품 또는 부품',
    '현재 문제 및 목표'
  ],
  en: [
    'Company / Contact',
    'Country / Region',
    'Reply email',
    'Target product or component',
    'Current issue and target'
  ],
  zh: [
    '公司 / 联系人',
    '国家 / 地区',
    '回复邮箱',
    '目标产品或部件',
    '当前问题与目标'
  ]
}[locale] || [];

const values = [
  data.get('name'),
  data.get('region'),
  data.get('email'),
  data.get('product'),
  data.get('issue')
];    
    return labels.map((label, index) => `${label}: ${values[index] || '-'}`).join('\n');
  }

  function bindProjectForm() {
    const form = $('#project-form');
    const copy = $('#copy-brief');
    if (!form) return;
    const messages = {
      ko: { missing: '회사/담당자, 대상 제품 또는 부품, 현재 문제 및 목표를 입력해 주세요.', config: '먼저 assets/js/site-config.js에 공개용 이메일 주소를 입력해 주세요.', copied: '문의 내용을 복사했습니다. 이메일 또는 WeChat에 붙여 넣을 수 있습니다.', copiedFail: '자동 복사가 지원되지 않습니다. 내용을 선택해 복사해 주세요.' },
      en: { missing: 'Please enter company/contact, target component, and the current issue/target.', config: 'Please add a public email address in assets/js/site-config.js first.', copied: 'The project brief has been copied. You can paste it into email or WeChat.', copiedFail: 'Automatic copy is unavailable. Please select and copy the content manually.' },
      zh: { missing: '请填写公司/联系人、目标产品或部件，以及当前问题与目标。', config: '请先在 assets/js/site-config.js 中填写公开邮箱地址。', copied: '咨询内容已复制，可粘贴到邮件或微信中。', copiedFail: '无法自动复制，请手动选择并复制内容。' }
    };
    const currentMessages = () => messages[locale] || messages.ko;
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    notify(currentMessages().missing, 'is-error');
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonHtml = submitButton?.innerHTML || '';

  const data = new FormData(form);

  const payload = {
    name: String(data.get('name') || '').trim(),
    region: String(data.get('region') || '').trim(),
    email: String(data.get('email') || '').trim(),
    product: String(data.get('product') || '').trim(),
    issue: String(data.get('issue') || '').trim(),
    website: String(data.get('website') || '').trim()
  };

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        locale === 'zh'
          ? '正在发送...'
          : locale === 'en'
            ? 'Sending...'
            : '문의 전송 중...';
    }

    notify(
      locale === 'zh'
        ? '正在发送咨询内容。'
        : locale === 'en'
          ? 'Sending your inquiry.'
          : '문의 내용을 전송하고 있습니다.'
    );

    const response = await fetch(
      'https://hxpjxebwpnepxcfighff.supabase.co/functions/v1/contact-request',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json().catch(() => ({
      ok: false,
      error: 'Invalid server response'
    }));

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error ||
        `문의 전송 실패: HTTP ${response.status}`
      );
    }

    notify(
      locale === 'zh'
        ? '咨询已成功发送。我们将尽快回复。'
        : locale === 'en'
          ? 'Your inquiry has been sent successfully. We will reply as soon as possible.'
          : '문의가 정상적으로 전송되었습니다. 확인 후 답변드리겠습니다.',
      'is-success'
    );

    form.reset();
  } catch (error) {
    console.error('Contact request failed:', error);

    notify(
      locale === 'zh'
        ? '发送失败，请稍后重试。'
        : locale === 'en'
          ? 'The inquiry could not be sent. Please try again later.'
          : '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      'is-error'
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHtml;
    }
  }
});

    copy?.addEventListener('click', async () => {
      if (!form.checkValidity()) { notify(currentMessages().missing, 'is-error'); form.reportValidity(); return; }
      const brief = projectBrief();
      try {
        await navigator.clipboard.writeText(brief);
        notify(currentMessages().copied, 'is-success');
      } catch (_) {
        notify(currentMessages().copiedFail, 'is-error');
      }
    });
  }

  function boot() {
    applyConfig();
    translate();
    bindMenu();
    bindHeader();
    bindReveal();
    bindNavigator();
    bindProjectForm();
    $('#year').textContent = new Date().getFullYear();
    $$('.lang-btn').forEach((button) => button.addEventListener('click', () => {
      const next = button.dataset.lang;
      if (sharedLocale) sharedLocale.set(next);
      else {
        locale = next;
        localStorage.setItem('mot-locale', locale);
        translate();
      }
    }));
    if (sharedLocale) {
      sharedLocale.subscribe((next) => {
        if (!dictionaries[next]) return;
        locale = next;
        translate();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();

/* ==========================================================================
   M.O.T. PrintCore multilingual user guide
   - This module is independent from the existing site.js IIFE above.
   - It does not replace or modify the existing page content.
   - Required image files:
       assets/images/user-guide-ko.png
       assets/images/user-guide-en.png
       assets/images/user-guide-zh.png
   ========================================================================== */
(() => {
  'use strict';

  const MODULE_ID = 'mot-user-guide-module';
  const LINK_ID = 'mot-user-guide-link';
  const MODAL_ID = 'mot-user-guide-modal';
  const STYLE_ID = 'mot-user-guide-style';

  const content = {
    ko: {
      link: '사용자 가이드',
      title: '사용자 가이드',
      openImage: '새 창에서 크게 보기',
      close: '닫기',
      alt: 'M.O.T. PrintCore 웹사이트 사용자 가이드',
      loadError: '사용자 가이드 이미지를 불러오지 못했습니다.'
    },
    en: {
      link: 'User Guide',
      title: 'User Guide',
      openImage: 'Open full-size image',
      close: 'Close',
      alt: 'M.O.T. PrintCore website user guide',
      loadError: 'The user guide image could not be loaded.'
    },
    zh: {
      link: '用户指南',
      title: '用户指南',
      openImage: '在新窗口中查看大图',
      close: '关闭',
      alt: 'M.O.T. PrintCore 网站用户指南',
      loadError: '无法加载用户指南图片。'
    }
  };

  const imageByLocale = {
    ko: 'assets/images/user-guide-ko.png',
    en: 'assets/images/user-guide-en.png',
    zh: 'assets/images/user-guide-zh.png'
  };

  let activeLocale = 'ko';
  let previousBodyOverflow = '';

  function normalizeLocale(value) {
    const locale = String(value || '').toLowerCase();
    if (locale.startsWith('zh')) return 'zh';
    if (locale.startsWith('en')) return 'en';
    return 'ko';
  }

  function readLocale() {
    const datasetLocale = document.documentElement.dataset.locale;
    const storedLocale = localStorage.getItem('mot-locale');
    const htmlLocale = document.documentElement.lang;
    return normalizeLocale(datasetLocale || storedLocale || htmlLocale || 'ko');
  }

  function getFooterLinkReference() {
    const footer = document.querySelector('footer, .site-footer');
    if (!footer) return null;

    const anchors = Array.from(footer.querySelectorAll('a'));
    const preferred = anchors.find((anchor) => {
      const href = anchor.getAttribute('href') || '';
      const text = anchor.textContent.trim();
      return /contact|project/i.test(href) ||
        ['프로젝트 문의', 'Project Inquiry', '项目咨询'].includes(text);
    });

    return preferred || anchors.find((anchor) => {
      const href = anchor.getAttribute('href') || '';
      return href.startsWith('#') && href !== '#top';
    }) || null;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${LINK_ID} {
        cursor: pointer;
      }

      #${MODAL_ID}[hidden] {
        display: none !important;
      }

      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: clamp(12px, 2.5vw, 32px);
        background: rgba(4, 12, 24, 0.82);
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
      }

      #${MODAL_ID} .mot-guide-dialog {
        width: min(1180px, 100%);
        margin: auto;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
      }

      #${MODAL_ID} .mot-guide-header {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 64px;
        padding: 12px 16px 12px 22px;
        border-bottom: 1px solid #dce5f0;
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(10px);
      }

      #${MODAL_ID} .mot-guide-title {
        margin: 0;
        color: #111827;
        font-size: clamp(18px, 2vw, 25px);
        font-weight: 750;
        line-height: 1.25;
      }

      #${MODAL_ID} .mot-guide-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      #${MODAL_ID} .mot-guide-full,
      #${MODAL_ID} .mot-guide-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
        transition: background-color 0.18s ease, border-color 0.18s ease;
      }

      #${MODAL_ID} .mot-guide-full {
        padding: 0 14px;
        border: 1px solid #cbd8e8;
        color: #174b8f;
        background: #f7faff;
      }

      #${MODAL_ID} .mot-guide-full:hover {
        border-color: #8eafd7;
        background: #edf5ff;
      }

      #${MODAL_ID} .mot-guide-close {
        width: 40px;
        padding: 0;
        border: 1px solid #cbd8e8;
        color: #1f2937;
        background: #ffffff;
        cursor: pointer;
      }

      #${MODAL_ID} .mot-guide-close:hover {
        background: #f1f5f9;
      }

      #${MODAL_ID} .mot-guide-body {
        position: relative;
        min-height: 240px;
        background: #f3f6fa;
      }

      #${MODAL_ID} .mot-guide-image {
        display: block;
        width: 100%;
        height: auto;
        margin: 0 auto;
        background: #ffffff;
      }

      #${MODAL_ID} .mot-guide-error {
        display: none;
        margin: 0;
        padding: 64px 20px;
        color: #991b1b;
        text-align: center;
        font-size: 16px;
        font-weight: 650;
      }

      #${MODAL_ID}.has-image-error .mot-guide-image {
        display: none;
      }

      #${MODAL_ID}.has-image-error .mot-guide-error {
        display: block;
      }

      @media (max-width: 640px) {
        #${MODAL_ID} {
          padding: 0;
        }

        #${MODAL_ID} .mot-guide-dialog {
          width: 100%;
          min-height: 100%;
          border: 0;
          border-radius: 0;
        }

        #${MODAL_ID} .mot-guide-header {
          min-height: 58px;
          padding: 9px 10px 9px 15px;
        }

        #${MODAL_ID} .mot-guide-full {
          width: 40px;
          padding: 0;
          overflow: hidden;
          color: transparent;
          font-size: 0;
        }

        #${MODAL_ID} .mot-guide-full::before {
          content: '↗';
          color: #174b8f;
          font-size: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) {
      return document.getElementById(MODAL_ID);
    }

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `${MODAL_ID}-title`);

    const dialog = document.createElement('div');
    dialog.className = 'mot-guide-dialog';

    const header = document.createElement('div');
    header.className = 'mot-guide-header';

    const title = document.createElement('h2');
    title.id = `${MODAL_ID}-title`;
    title.className = 'mot-guide-title';

    const actions = document.createElement('div');
    actions.className = 'mot-guide-actions';

    const fullLink = document.createElement('a');
    fullLink.className = 'mot-guide-full';
    fullLink.target = '_blank';
    fullLink.rel = 'noopener noreferrer';

    const closeButton = document.createElement('button');
    closeButton.className = 'mot-guide-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';

    actions.append(fullLink, closeButton);
    header.append(title, actions);

    const body = document.createElement('div');
    body.className = 'mot-guide-body';

    const image = document.createElement('img');
    image.className = 'mot-guide-image';
    image.decoding = 'async';

    const error = document.createElement('p');
    error.className = 'mot-guide-error';

    body.append(image, error);
    dialog.append(header, body);
    modal.append(dialog);
    document.body.appendChild(modal);

    closeButton.addEventListener('click', closeGuide);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeGuide();
    });

    image.addEventListener('load', () => {
      modal.classList.remove('has-image-error');
    });
    image.addEventListener('error', () => {
      modal.classList.add('has-image-error');
    });

    return modal;
  }

  function updateGuideLocale(nextLocale) {
    activeLocale = normalizeLocale(nextLocale || readLocale());

    const text = content[activeLocale];
    const imagePath = imageByLocale[activeLocale];
    const link = document.getElementById(LINK_ID);
    const modal = document.getElementById(MODAL_ID);

    if (link) {
      link.textContent = text.link;
      link.setAttribute('aria-label', text.link);
      link.setAttribute('title', text.link);
    }

    if (!modal) return;

    const title = modal.querySelector('.mot-guide-title');
    const fullLink = modal.querySelector('.mot-guide-full');
    const closeButton = modal.querySelector('.mot-guide-close');
    const image = modal.querySelector('.mot-guide-image');
    const error = modal.querySelector('.mot-guide-error');

    if (title) title.textContent = text.title;
    if (fullLink) {
      fullLink.textContent = text.openImage;
      fullLink.href = imagePath;
      fullLink.setAttribute('aria-label', text.openImage);
      fullLink.setAttribute('title', text.openImage);
    }
    if (closeButton) {
      closeButton.setAttribute('aria-label', text.close);
      closeButton.setAttribute('title', text.close);
    }
    if (error) error.textContent = text.loadError;
    if (image) {
      image.alt = text.alt;
      modal.classList.remove('has-image-error');
      if (image.getAttribute('src') !== imagePath) image.src = imagePath;
    }
  }

  function openGuide(event) {
    event?.preventDefault();

    const modal = createModal();
    updateGuideLocale(readLocale());

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.hidden = false;

    requestAnimationFrame(() => {
      modal.querySelector('.mot-guide-close')?.focus();
    });
  }

  function closeGuide() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    document.getElementById(LINK_ID)?.focus();
  }

  function createFooterLink() {
    const existing = document.getElementById(LINK_ID);
    if (existing) return existing;

    const reference = getFooterLinkReference();
    if (!reference || !reference.parentElement) return null;

    const link = document.createElement('a');
    link.id = LINK_ID;
    link.href = '#user-guide';
    link.className = reference.className;
    link.dataset.motUserGuide = 'true';
    link.addEventListener('click', openGuide);

    reference.insertAdjacentElement('afterend', link);
    return link;
  }

  function bindLocaleChanges() {
    const localeHandler = (event) => {
      const detail = event?.detail;
      const nextLocale =
        (typeof detail === 'string' && detail) ||
        detail?.locale ||
        detail?.lang ||
        readLocale();
      updateGuideLocale(nextLocale);
    };

    window.addEventListener('mot:localechange', localeHandler);
    document.addEventListener('mot:localechange', localeHandler);

    if (window.MOTLocale && typeof window.MOTLocale.subscribe === 'function') {
      window.MOTLocale.subscribe((nextLocale) => {
        updateGuideLocale(nextLocale);
      });
    }

    document.querySelectorAll('.lang-btn').forEach((button) => {
      button.addEventListener('click', () => {
        window.setTimeout(() => updateGuideLocale(button.dataset.lang), 0);
      });
    });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeGuide();
    });
  }

  function bootUserGuide() {
    if (document.documentElement.dataset.motUserGuideReady === 'true') return;
    document.documentElement.dataset.motUserGuideReady = 'true';

    injectStyles();
    createModal();
    createFooterLink();
    bindLocaleChanges();
    bindKeyboard();
    updateGuideLocale(readLocale());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootUserGuide, { once: true });
  } else {
    bootUserGuide();
  }

  window[MODULE_ID] = {
    open: openGuide,
    close: closeGuide,
    setLocale: updateGuideLocale
  };
})();
