/*
  Academy language UI. This file intentionally has no Supabase / payment SDK import.
  Therefore KO / EN / 中文 always work even when the back-end is not configured
  or an external SDK is temporarily unavailable.
*/
(function (window, document) {
  'use strict';

  const I18N = window.MOT_ACADEMY_I18N || {};
  const CONFIG = window.MOT_ACADEMY_CONFIG || {};
  const SUPPORTED = ['ko', 'en', 'zh'];
  const $all = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const page = () => document.body?.dataset?.academyPage || 'academy';
  let locale = window.MOTLocale ? window.MOTLocale.init() : 'ko';

  function valid(value) { return SUPPORTED.includes(value) ? value : 'ko'; }
  function t(key) {
    return I18N?.[locale]?.[key] ?? I18N?.ko?.[key] ?? key;
  }
  function routeWithLocale(route) {
    try {
      const url = new URL(route, window.location.href);
      url.searchParams.set('lang', locale);
      return `${url.pathname.split('/').pop() || 'academy.html'}${url.search}${url.hash}`;
    } catch (_) {
      return route;
    }
  }
  function pageTitle() {
    const key = {
      academy: 'pageTitleAcademy', library: 'pageTitleLibrary', player: 'pageTitlePlayer',
      admin: 'pageTitleAdmin', success: 'pageTitleSuccess', failed: 'pageTitleFailed'
    }[page()];
    return key ? t(key) : document.title;
  }
  function apply() {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.locale = locale;
    document.title = pageTitle();
    $all('[data-ai18n]').forEach((node) => {
      const value = t(node.dataset.ai18n);
      if (value !== undefined) node.textContent = value;
    });
    $all('[data-ai18n-html]').forEach((node) => {
      const value = t(node.dataset.ai18nHtml);
      if (value !== undefined) node.innerHTML = value;
    });
    $all('[data-ai18n-placeholder]').forEach((node) => {
      node.placeholder = t(node.dataset.ai18nPlaceholder);
    });
    $all('[data-ai18n-aria]').forEach((node) => {
      node.setAttribute('aria-label', t(node.dataset.ai18nAria));
    });
    $all('[data-ai18n-title]').forEach((node) => {
      node.setAttribute('title', t(node.dataset.ai18nTitle));
    });
    $all('.a-lang [data-lang]').forEach((button) => {
      const active = button.dataset.lang === locale;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $all('[data-academy-link]').forEach((anchor) => {
      const route = CONFIG.routes?.[anchor.dataset.academyLink];
      if (route) anchor.setAttribute('href', routeWithLocale(route));
    });
    window.MOTLocale?.propagate(locale);
  }
  function select(next) {
    const selected = valid(next);
    if (window.MOTLocale) window.MOTLocale.set(selected);
    else {
      locale = selected;
      try { window.localStorage.setItem('mot-locale', selected); } catch (_) {}
      apply();
      document.dispatchEvent(new CustomEvent('mot:academy-languagechange', { detail: { locale } }));
    }
  }
  function bind() {
    $all('.a-lang [data-lang]').forEach((button) => {
      if (button.dataset.localeBound === 'true') return;
      button.dataset.localeBound = 'true';
      button.type = 'button';
      button.addEventListener('click', () => select(button.dataset.lang));
    });
  }
  function handleSharedChange(event) {
    const next = valid(event.detail?.locale || window.MOTLocale?.get?.() || 'ko');
    if (next === locale) { apply(); return; }
    locale = next;
    apply();
    document.dispatchEvent(new CustomEvent('mot:academy-languagechange', { detail: { locale } }));
  }

  document.addEventListener('mot:localechange', handleSharedChange);
  document.addEventListener('DOMContentLoaded', () => { locale = valid(window.MOTLocale?.get?.() || locale); apply(); bind(); });

  window.MOTAcademyUI = Object.freeze({
    getLocale: () => locale,
    t,
    apply,
    select,
    routeWithLocale
  });
})(window, document);
