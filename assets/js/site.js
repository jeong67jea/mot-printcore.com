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

/* === M.O.T. USER GUIDE MODULE : BEGIN ===
   Appended module only. index.html is not changed.
   Required images:
   assets/images/user-guide-ko.png
   assets/images/user-guide-en.png
   assets/images/user-guide-zh.png
*/
(() => {
  'use strict';

  const MODULE_ID = 'mot-user-guide-module';
  if (window[MODULE_ID]) return;
  window[MODULE_ID] = true;

  const guides = {
    ko: {
      link: '사용자 가이드',
      title: '사용자 가이드',
      openFull: '새 창에서 크게 보기 ↗',
      close: '사용자 가이드 닫기',
      alt: 'M.O.T. PrintCore 웹사이트 한국어 사용자 가이드',
      image: 'assets/images/user-guide-ko.png'
    },
    en: {
      link: 'User Guide',
      title: 'User Guide',
      openFull: 'Open full size in a new window ↗',
      close: 'Close user guide',
      alt: 'M.O.T. PrintCore website user guide in English',
      image: 'assets/images/user-guide-en.png'
    },
    zh: {
      link: '用户指南',
      title: '用户指南',
      openFull: '在新窗口中查看大图 ↗',
      close: '关闭用户指南',
      alt: 'M.O.T. PrintCore 网站中文用户指南',
      image: 'assets/images/user-guide-zh.png'
    }
  };

  const normalizeLocale = (value) => ['ko', 'en', 'zh'].includes(value) ? value : 'ko';
  const getLocale = () => normalizeLocale(
    window.MOTLocale?.get?.() ||
    document.documentElement.dataset.locale ||
    localStorage.getItem('mot-locale') ||
    'ko'
  );

  function addStyles() {
    if (document.getElementById('mot-user-guide-styles')) return;
    const style = document.createElement('style');
    style.id = 'mot-user-guide-styles';
    style.textContent = `
      .mot-user-guide-link { cursor: pointer; }
      .mot-user-guide-modal[hidden] { display: none !important; }
      .mot-user-guide-modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: grid;
        place-items: center;
        padding: clamp(10px, 2.2vw, 28px);
      }
      .mot-user-guide-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(2, 12, 25, .78);
        backdrop-filter: blur(7px);
      }
      .mot-user-guide-dialog {
        position: relative;
        width: min(1120px, 100%);
        max-height: 94vh;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 28px 90px rgba(0,0,0,.42);
      }
      .mot-user-guide-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 16px 18px 14px 22px;
        border-bottom: 1px solid #dce5ef;
        background: linear-gradient(135deg, #071a2f, #0d3156);
        color: #fff;
      }
      .mot-user-guide-kicker {
        display: block;
        margin-bottom: 3px;
        font: 700 10px/1.2 'Space Mono', monospace;
        letter-spacing: .16em;
        color: #72c7f4;
      }
      .mot-user-guide-title {
        margin: 0;
        font-size: clamp(20px, 2.2vw, 30px);
        line-height: 1.2;
        color: #fff;
      }
      .mot-user-guide-close {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border: 1px solid rgba(255,255,255,.28);
        border-radius: 50%;
        background: rgba(255,255,255,.08);
        color: #fff;
        font-size: 29px;
        line-height: 1;
        cursor: pointer;
      }
      .mot-user-guide-close:hover,
      .mot-user-guide-close:focus-visible {
        background: rgba(255,255,255,.18);
        outline: 2px solid #72c7f4;
        outline-offset: 2px;
      }
      .mot-user-guide-scroll {
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
        background: #eef3f8;
      }
      .mot-user-guide-image-wrap {
        width: min(100%, 1000px);
        margin: 0 auto;
        padding: clamp(8px, 1.8vw, 20px);
      }
      .mot-user-guide-image {
        display: block;
        width: 100%;
        height: auto;
        background: #fff;
        box-shadow: 0 8px 30px rgba(5, 27, 49, .12);
      }
      .mot-user-guide-actions {
        display: flex;
        justify-content: flex-end;
        padding: 12px 18px;
        border-top: 1px solid #dce5ef;
        background: #fff;
      }
      .mot-user-guide-full {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 17px;
        border-radius: 999px;
        background: #0b65d8;
        color: #fff !important;
        font-weight: 700;
        text-decoration: none;
      }
      .mot-user-guide-full:hover,
      .mot-user-guide-full:focus-visible { background: #084da5; }
      body.mot-user-guide-open { overflow: hidden; }
      @media (max-width: 640px) {
        .mot-user-guide-modal { padding: 0; }
        .mot-user-guide-dialog { width: 100%; max-height: 100dvh; height: 100dvh; border-radius: 0; }
        .mot-user-guide-head { padding: 12px 12px 11px 16px; }
        .mot-user-guide-actions { justify-content: stretch; padding: 10px 12px; }
        .mot-user-guide-full { width: 100%; }
        .mot-user-guide-image-wrap { padding: 6px; }
      }
    `;
    document.head.appendChild(style);
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'mot-user-guide-modal';
    modal.className = 'mot-user-guide-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'mot-user-guide-title');
    modal.innerHTML = `
      <div class="mot-user-guide-backdrop" data-guide-close aria-hidden="true"></div>
      <section class="mot-user-guide-dialog" tabindex="-1">
        <header class="mot-user-guide-head">
          <div>
            <span class="mot-user-guide-kicker">M.O.T. PRINTCORE</span>
            <h2 class="mot-user-guide-title" id="mot-user-guide-title"></h2>
          </div>
          <button class="mot-user-guide-close" type="button" data-guide-close>×</button>
        </header>
        <div class="mot-user-guide-scroll">
          <div class="mot-user-guide-image-wrap">
            <img class="mot-user-guide-image" alt="" decoding="async" />
          </div>
        </div>
        <footer class="mot-user-guide-actions">
          <a class="mot-user-guide-full" target="_blank" rel="noopener"></a>
        </footer>
      </section>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function findFooterContactLink() {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    return Array.from(footer.querySelectorAll('a[href]')).find((anchor) => {
      const href = (anchor.getAttribute('href') || '').trim();
      return href === '#contact';
    }) || null;
  }

  function init() {
    const contactLink = findFooterContactLink();
    if (!contactLink || document.getElementById('mot-user-guide-link')) return;

    addStyles();
    const modal = createModal();
    const dialog = modal.querySelector('.mot-user-guide-dialog');
    const image = modal.querySelector('.mot-user-guide-image');
    const title = modal.querySelector('.mot-user-guide-title');
    const full = modal.querySelector('.mot-user-guide-full');
    const closeButton = modal.querySelector('.mot-user-guide-close');

    const link = document.createElement('a');
    link.id = 'mot-user-guide-link';
    link.className = `${contactLink.className || ''} mot-user-guide-link`.trim();
    link.href = '#user-guide';
    contactLink.insertAdjacentElement('afterend', link);

    let previousFocus = null;

    function applyLanguage(localeValue) {
      const locale = normalizeLocale(localeValue || getLocale());
      const guide = guides[locale];
      link.textContent = guide.link;
      link.setAttribute('aria-label', guide.link);
      title.textContent = guide.title;
      closeButton.setAttribute('aria-label', guide.close);
      image.src = guide.image;
      image.alt = guide.alt;
      full.href = guide.image;
      full.textContent = guide.openFull;
    }

    function openGuide(event) {
      event?.preventDefault();
      previousFocus = document.activeElement;
      applyLanguage();
      modal.hidden = false;
      document.body.classList.add('mot-user-guide-open');
      requestAnimationFrame(() => dialog.focus());
    }

    function closeGuide() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove('mot-user-guide-open');
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }

    link.addEventListener('click', openGuide);
    modal.querySelectorAll('[data-guide-close]').forEach((node) => node.addEventListener('click', closeGuide));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeGuide();
    });
    document.addEventListener('mot:localechange', (event) => applyLanguage(event.detail?.locale));

    applyLanguage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
/* === M.O.T. USER GUIDE MODULE : END === */
