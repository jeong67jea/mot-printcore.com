/*
  M.O.T. shared language controller
  - Korean / English / Simplified Chinese
  - Works without Supabase, PortOne, or any external SDK
  - Persists language in the URL and browser storage
*/
(function (window, document) {
  'use strict';

  const SUPPORTED = ['ko', 'en', 'zh'];
  const STORAGE_KEY = 'mot-locale';
  const listeners = new Set();

  function normalize(value) {
    return SUPPORTED.includes(value) ? value : 'ko';
  }

  function localeFromUrl() {
    try {
      return new URL(window.location.href).searchParams.get('lang');
    } catch (_) {
      return null;
    }
  }

  function get() {
    const requested = localeFromUrl();
    if (SUPPORTED.includes(requested)) return requested;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(stored)) return stored;
    } catch (_) {
      // Storage may be blocked in privacy mode. Korean remains the default.
    }
    return normalize(document.documentElement.getAttribute('lang'));
  }

  function putInUrl(locale, replace) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', locale);
      if (replace) window.history.replaceState(null, '', url.toString());
      else window.history.pushState(null, '', url.toString());
    } catch (_) {
      // File previews and locked-down browsers may not permit URL history changes.
    }
  }

  function isInternalHtmlLink(anchor) {
    const raw = (anchor.getAttribute('href') || '').trim();
    if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) return false;
    try {
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin && !url.protocol.startsWith('file:')) return false;
      return /\.html$/i.test(url.pathname) || /\/$/.test(url.pathname);
    } catch (_) {
      return false;
    }
  }

  function propagate(locale, root) {
    const scope = root || document;
    scope.querySelectorAll('a[href]').forEach((anchor) => {
      if (!isInternalHtmlLink(anchor)) return;
      try {
        const url = new URL(anchor.getAttribute('href'), window.location.href);
        url.searchParams.set('lang', locale);
        const relative = `${url.pathname.split('/').pop() || 'index.html'}${url.search}${url.hash}`;
        // Preserve a relative link for GitHub Pages repository hosting.
        if (!/^(https?:)?\/\//i.test(anchor.getAttribute('href'))) anchor.setAttribute('href', relative);
        else anchor.href = url.toString();
      } catch (_) {
        // Ignore malformed links and leave them untouched.
      }
    });
  }

  function syncDocument(locale) {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.locale = locale;
    propagate(locale);
  }

  function notify(locale) {
    listeners.forEach((listener) => {
      try { listener(locale); } catch (error) { console.error('[M.O.T. locale]', error); }
    });
    document.dispatchEvent(new CustomEvent('mot:localechange', { detail: { locale } }));
  }

  function set(value, options) {
    const locale = normalize(value);
    const opts = Object.assign({ replace: true, silent: false }, options || {});
    try { window.localStorage.setItem(STORAGE_KEY, locale); } catch (_) {}
    putInUrl(locale, opts.replace);
    syncDocument(locale);
    if (!opts.silent) notify(locale);
    return locale;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return function () {};
    listeners.add(listener);
    return function () { listeners.delete(listener); };
  }

  function init() {
    const locale = get();
    syncDocument(locale);
    return locale;
  }

  window.MOTLocale = Object.freeze({
    supported: SUPPORTED.slice(),
    get,
    set,
    init,
    subscribe,
    propagate
  });
})(window, document);
