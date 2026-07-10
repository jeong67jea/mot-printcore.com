/*
  M.O.T. Academy Preview Language Bridge
  Purpose:
  - Translates manually inserted preview/PDF blocks when KO / EN / 中文 buttons are clicked.
  - Works with existing MOTLocale / MOTAcademyUI language controller.
  - No Supabase secret, no external SDK, no payment code.

  Usage examples in academy.html:
    <h2 data-preview-text-ko="PDF 미리보기" data-preview-text-en="PDF Preview" data-preview-text-zh="PDF 预览">PDF 미리보기</h2>
    <a data-preview-href-ko="previews/ko/sample.pdf" data-preview-href-en="previews/en/sample.pdf" data-preview-href-zh="previews/zh/sample.pdf"
       data-preview-text-ko="한국어 PDF 보기" data-preview-text-en="View PDF" data-preview-text-zh="查看 PDF">한국어 PDF 보기</a>
*/
(function (window, document) {
  'use strict';

  const SUPPORTED = ['ko', 'en', 'zh'];

  function normalize(value) {
    return SUPPORTED.includes(value) ? value : 'ko';
  }

  function getLocale() {
    try {
      const urlLang = new URL(window.location.href).searchParams.get('lang');
      if (SUPPORTED.includes(urlLang)) return urlLang;
    } catch (_) {}
    const shared = window.MOTAcademyUI?.getLocale?.() || window.MOTLocale?.get?.();
    if (SUPPORTED.includes(shared)) return shared;
    try {
      const stored = window.localStorage.getItem('mot-locale');
      if (SUPPORTED.includes(stored)) return stored;
    } catch (_) {}
    return normalize(document.documentElement.dataset.locale || document.documentElement.lang || 'ko');
  }

  function valueFor(node, base, locale) {
    const key = `${base}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
    const fallbackKo = `${base}Ko`;
    const fallbackEn = `${base}En`;
    const fallbackZh = `${base}Zh`;
    return node.dataset[key] || node.dataset[fallbackKo] || node.dataset[fallbackEn] || node.dataset[fallbackZh] || '';
  }

  function setHrefWithLocale(anchor, href, locale) {
    if (!href) return;
    anchor.setAttribute('href', href);
    // Preserve external/file URLs as provided. For same-site html links, also propagate lang.
    try {
      const url = new URL(href, window.location.href);
      const raw = (href || '').trim();
      const isHtml = /\.html$/i.test(url.pathname) || /\/$/.test(url.pathname);
      const isInternal = url.origin === window.location.origin;
      if (isInternal && isHtml && !raw.startsWith('#')) {
        url.searchParams.set('lang', locale);
        const relative = `${url.pathname.split('/').pop() || 'index.html'}${url.search}${url.hash}`;
        anchor.setAttribute('href', relative);
      }
    } catch (_) {}
  }

  function apply(root) {
    const scope = root || document;
    const locale = getLocale();

    scope.querySelectorAll('[data-preview-text-ko],[data-preview-text-en],[data-preview-text-zh]').forEach((node) => {
      const text = valueFor(node, 'previewText', locale);
      if (text) node.textContent = text;
    });

    scope.querySelectorAll('[data-preview-html-ko],[data-preview-html-en],[data-preview-html-zh]').forEach((node) => {
      const html = valueFor(node, 'previewHtml', locale);
      if (html) node.innerHTML = html;
    });

    scope.querySelectorAll('[data-preview-title-ko],[data-preview-title-en],[data-preview-title-zh]').forEach((node) => {
      const title = valueFor(node, 'previewTitle', locale);
      if (title) node.setAttribute('title', title);
    });

    scope.querySelectorAll('[data-preview-aria-ko],[data-preview-aria-en],[data-preview-aria-zh]').forEach((node) => {
      const aria = valueFor(node, 'previewAria', locale);
      if (aria) node.setAttribute('aria-label', aria);
    });

    scope.querySelectorAll('[data-preview-href-ko],[data-preview-href-en],[data-preview-href-zh]').forEach((node) => {
      const href = valueFor(node, 'previewHref', locale);
      if (href) setHrefWithLocale(node, href, locale);
    });
  }

  document.addEventListener('DOMContentLoaded', () => apply(document));
  document.addEventListener('mot:localechange', () => apply(document));
  document.addEventListener('mot:academy-languagechange', () => apply(document));

  // Fallback: if another script changes html[data-locale] without dispatching events.
  try {
    const observer = new MutationObserver(() => apply(document));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-locale'] });
  } catch (_) {}

  window.MOTPreviewI18N = Object.freeze({ apply });
})(window, document);
