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
      ko: ['회사 / 담당자', '국가 / 지역', '대상 제품 또는 부품', '현재 문제 및 목표'],
      en: ['Company / Contact', 'Country / Region', 'Target product or component', 'Current issue and target'],
      zh: ['公司 / 联系人', '国家 / 地区', '目标产品或部件', '当前问题与目标']
    }[locale] || [];
    const values = [data.get('name'), data.get('region'), data.get('product'), data.get('issue')];
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

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) { notify(currentMessages().missing, 'is-error'); form.reportValidity(); return; }
      if (isPlaceholder(config.contactEmail)) { notify(currentMessages().config, 'is-error'); return; }
      const subjects = { ko: '[M.O.T.] 기술 프로젝트 상담 요청', en: '[M.O.T.] Technical Project Consultation', zh: '[M.O.T.] 技术项目咨询申请' };
      const body = projectBrief();
      window.location.href = `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(subjects[locale] || subjects.ko)}&body=${encodeURIComponent(body)}`;
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
