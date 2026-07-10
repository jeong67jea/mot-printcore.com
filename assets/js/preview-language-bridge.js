/*
  M.O.T. Academy Preview Language Bridge - Lang Button Fix
  Fix:
  - Do NOT keep using ?lang=ko after the user clicks EN / 中文.
  - The clicked top language button has highest priority.
  - Supports preview text/html/href/src/data/title/aria/alt attributes.

  Supported attributes:
  data-preview-text-ko / en / zh     -> textContent
  data-preview-html-ko / en / zh     -> innerHTML
  data-preview-href-ko / en / zh     -> href for <a>
  data-preview-src-ko / en / zh      -> src for <iframe>, <embed>, <img>, etc.
  data-preview-data-ko / en / zh     -> data for <object>
  data-preview-title-ko / en / zh    -> title
  data-preview-aria-ko / en / zh     -> aria-label
  data-preview-alt-ko / en / zh      -> alt
*/
(function (window, document) {
  'use strict';

  const SUPPORTED = ['ko', 'en', 'zh'];
  let activeLocale = '';

  function normalize(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'kr' || raw.startsWith('ko')) return 'ko';
    if (raw.startsWith('en')) return 'en';
    if (raw === 'cn' || raw === 'zh-cn' || raw === 'zh_cn' || raw.startsWith('zh')) return 'zh';
    return SUPPORTED.includes(raw) ? raw : '';
  }

  function readStoredLocale() {
    try {
      const keys = ['mot-locale', 'motLocale', 'academy-locale', 'mot-academy-locale', 'locale', 'lang'];
      for (const key of keys) {
        const value = normalize(window.localStorage.getItem(key));
        if (value) return value;
      }
    } catch (_) {}
    return '';
  }

  function readUrlLocale() {
    try {
      return normalize(new URL(window.location.href).searchParams.get('lang'));
    } catch (_) {
      return '';
    }
  }

  function readRuntimeLocale() {
    return (
      normalize(window.MOTAcademyUI?.getLocale?.()) ||
      normalize(window.MOTLocale?.get?.()) ||
      normalize(document.documentElement.dataset.locale) ||
      normalize(document.documentElement.lang)
    );
  }

  function readPressedButtonLocale() {
    const pressed = document.querySelector('.a-lang button[aria-pressed="true"], .a-lang button.is-active, .a-lang button.active');
    return normalize(pressed && pressed.dataset.lang);
  }

  function getLocale() {
    // Important: URL ?lang=ko is only an initial fallback.
    // After the user clicks EN/ZH, activeLocale must override URL.
    return activeLocale || readPressedButtonLocale() || readRuntimeLocale() || readStoredLocale() || readUrlLocale() || 'ko';
  }

  function cap(locale) {
    return locale.charAt(0).toUpperCase() + locale.slice(1);
  }

  function valueFor(node, base, locale) {
    const exact = `${base}${cap(locale)}`;
    return node.dataset[exact] || node.dataset[`${base}Ko`] || node.dataset[`${base}En`] || node.dataset[`${base}Zh`] || '';
  }

  function setInternalUrlWithLang(el, attr, rawUrl, locale) {
    if (!rawUrl) return;
    el.setAttribute(attr, rawUrl);

    // For same-site HTML links only, preserve the selected language in the URL.
    // PDF/storage links are left unchanged.
    try {
      const url = new URL(rawUrl, window.location.href);
      const isInternal = url.origin === window.location.origin;
      const isHtml = /\.html$/i.test(url.pathname) || /\/$/.test(url.pathname);
      const raw = String(rawUrl || '').trim();
      if (isInternal && isHtml && !raw.startsWith('#')) {
        url.searchParams.set('lang', locale);
        const base = url.pathname.split('/').pop() || 'index.html';
        el.setAttribute(attr, `${base}${url.search}${url.hash}`);
      }
    } catch (_) {}
  }

  function apply(root, forcedLocale) {
    const scope = root || document;
    const locale = normalize(forcedLocale) || getLocale();
    activeLocale = locale;

    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.locale = locale;

    scope.querySelectorAll('[data-preview-text-ko],[data-preview-text-en],[data-preview-text-zh]').forEach((node) => {
      const value = valueFor(node, 'previewText', locale);
      if (value) node.textContent = value;
    });

    scope.querySelectorAll('[data-preview-html-ko],[data-preview-html-en],[data-preview-html-zh]').forEach((node) => {
      const value = valueFor(node, 'previewHtml', locale);
      if (value) node.innerHTML = value;
    });

    scope.querySelectorAll('[data-preview-href-ko],[data-preview-href-en],[data-preview-href-zh]').forEach((node) => {
      const value = valueFor(node, 'previewHref', locale);
      if (value) setInternalUrlWithLang(node, 'href', value, locale);
    });

    scope.querySelectorAll('[data-preview-src-ko],[data-preview-src-en],[data-preview-src-zh]').forEach((node) => {
      const value = valueFor(node, 'previewSrc', locale);
      if (value) setInternalUrlWithLang(node, 'src', value, locale);
    });

    scope.querySelectorAll('[data-preview-data-ko],[data-preview-data-en],[data-preview-data-zh]').forEach((node) => {
      const value = valueFor(node, 'previewData', locale);
      if (value) setInternalUrlWithLang(node, 'data', value, locale);
    });

    scope.querySelectorAll('[data-preview-title-ko],[data-preview-title-en],[data-preview-title-zh]').forEach((node) => {
      const value = valueFor(node, 'previewTitle', locale);
      if (value) node.setAttribute('title', value);
    });

    scope.querySelectorAll('[data-preview-aria-ko],[data-preview-aria-en],[data-preview-aria-zh]').forEach((node) => {
      const value = valueFor(node, 'previewAria', locale);
      if (value) node.setAttribute('aria-label', value);
    });

    scope.querySelectorAll('[data-preview-alt-ko],[data-preview-alt-en],[data-preview-alt-zh]').forEach((node) => {
      const value = valueFor(node, 'previewAlt', locale);
      if (value) node.setAttribute('alt', value);
    });
  }

  function localeFromEvent(event) {
    const d = event && event.detail;
    if (!d) return '';
    return normalize(d.lang || d.locale || d.language || d.currentLang);
  }

  document.addEventListener('DOMContentLoaded', () => {
    apply(document, readRuntimeLocale() || readStoredLocale() || readUrlLocale() || 'ko');

    document.querySelectorAll('.a-lang button[data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        const locale = normalize(button.dataset.lang) || 'ko';
        activeLocale = locale;
        try { window.localStorage.setItem('mot-locale', locale); } catch (_) {}
        // Apply immediately and once more after the existing site i18n script finishes.
        apply(document, locale);
        window.setTimeout(() => apply(document, locale), 80);
        window.setTimeout(() => apply(document, locale), 250);
      });
    });
  });

  document.addEventListener('mot:localechange', (event) => apply(document, localeFromEvent(event)));
  document.addEventListener('mot:academy-languagechange', (event) => apply(document, localeFromEvent(event)));
  document.addEventListener('mot:languagechange', (event) => apply(document, localeFromEvent(event)));

  try {
    const observer = new MutationObserver(() => {
      const locale = readRuntimeLocale();
      if (locale && locale !== activeLocale) apply(document, locale);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-locale'] });
  } catch (_) {}

  window.MOTPreviewI18N = Object.freeze({ apply, getLocale });
})(window, document);
