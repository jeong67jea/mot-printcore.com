(function () {
  'use strict';

  const C = window.MOT_COMMERCE_CONFIG;
  const D = window.MOT_COMMERCE_I18N || {};
  if (!C || !D.ko) return;

  const SUPPORTED = ['ko', 'en', 'zh'];
  const PAGE = document.body.dataset.commercePage || 'commerce';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const isPlaceholder = (value) => !value || /\{\{|YOUR_|example\.com/i.test(String(value));
  const safe = (value) => String(value ?? '').replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]));

  const urlLocale = new URLSearchParams(window.location.search).get('lang');
  let locale = SUPPORTED.includes(urlLocale) ? urlLocale : (localStorage.getItem('mot-locale') || 'ko');
  if (!SUPPORTED.includes(locale)) locale = 'ko';

  const t = (key) => (D[locale] && Object.prototype.hasOwnProperty.call(D[locale], key) ? D[locale][key] : (D.ko[key] || key));
  const getPath = (source, dottedPath) => dottedPath.split('.').reduce((value, key) => value?.[key], source);

  function applyConfig() {
    $$('[data-commerce]').forEach((node) => {
      const value = getPath(C, node.dataset.commerce);
      node.textContent = value || '—';
    });
  }

  function setPageMetadata() {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.locale = locale;
    const title = D[locale]?.pageTitles?.[PAGE] || D.ko.pageTitles?.[PAGE] || document.title;
    document.title = title;
    const description = D[locale]?.meta?.[PAGE] || D.ko.meta?.[PAGE];
    const meta = $('meta[name="description"]');
    if (meta && description) meta.content = description;
  }

  function translateStaticText() {
    $$('[data-ci18n]').forEach((node) => {
      const key = node.dataset.ci18n;
      const value = t(key);
      if (value !== undefined) node.textContent = value;
    });
    $$('[data-ci18n-html]').forEach((node) => {
      const key = node.dataset.ci18nHtml;
      const value = t(key);
      if (value !== undefined) node.innerHTML = value;
    });
    $$('[data-ci18n-placeholder]').forEach((node) => {
      const value = t(node.dataset.ci18nPlaceholder);
      if (value !== undefined) node.placeholder = value;
    });
    $$('.commerce-lang-btn').forEach((button) => {
      const active = button.dataset.commerceLang === locale;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function localOffer(kind, code, fallback) {
    const localized = D[locale]?.offers?.[kind]?.[code] || D.ko?.offers?.[kind]?.[code] || {};
    return { ...fallback, ...localized };
  }

  function renderB2B() {
    const grid = $('#b2b-offers');
    if (!grid) return;
    const vatText = C.policy.priceBasis === 'VAT_INCLUSIVE' ? t('vatIncluded') : t('vatExclusive');
    grid.innerHTML = C.offers.b2b.map((rawOffer, index) => {
      const offer = localOffer('b2b', rawOffer.code, rawOffer);
      return `
        <article class="offer-card ${index === 2 ? 'offer-card-featured' : ''}">
          <div class="offer-top"><span>${String(index + 1).padStart(2, '0')}</span><b>${safe(offer.duration)}</b></div>
          <h3>${safe(offer.name)}</h3>
          <p class="offer-price">${safe(offer.startingPrice || rawOffer.startingPrice)} <small>${safe(vatText)}</small></p>
          <p class="offer-payment">${safe(offer.payment)}</p>
          <ul>${(offer.includes || []).map((item) => `<li>${safe(item)}</li>`).join('')}</ul>
          <p class="offer-exclude"><b>${safe(t('additionalCost'))}</b>${safe(offer.excludes)}</p>
          <a class="text-link" href="#project-request">${t('requestService')}</a>
        </article>`;
    }).join('');
  }

  function renderContent() {
    const grid = $('#content-offers');
    if (!grid) return;
    grid.innerHTML = C.offers.content.map((rawItem, index) => {
      const item = localOffer('content', rawItem.sku, rawItem);
      const url = C.checkouts[rawItem.checkoutKey];
      const inactive = isPlaceholder(url);
      return `
        <article class="content-card ${index === 3 ? 'content-card-featured' : ''}">
          <div class="content-label">${safe(item.kind)}</div>
          <h3>${safe(item.name)}</h3>
          <p class="content-price">${safe(item.price || rawItem.price)}</p>
          <p class="content-billing">${safe(item.billing)}</p>
          <div class="content-access"><span>${safe(t('access'))}</span><p>${safe(item.access)}</p></div>
          <a class="button ${index === 3 ? 'button-accent' : 'button-dark'} ${inactive ? 'button-disabled' : ''}" href="${inactive ? '#checkout-setup' : safe(url)}" ${inactive ? 'data-unconfigured="true"' : 'target="_blank" rel="noopener"'}>${safe(item.button)} <span>↗</span></a>
          <p class="content-note">${safe(item.note)}</p>
        </article>`;
    }).join('');
  }

  function configureFormMail() {
    const form = $('#project-request-form');
    const note = $('#request-form-note');
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        note.textContent = t('formMissing');
        note.className = 'form-note form-error';
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonHtml = submitButton?.innerHTML || '';
      const f = new FormData(form);

      const payload = {
        requestType: 'quotation',
        company: String(f.get('company') || '').trim(),
        name: String(f.get('name') || '').trim(),
        email: String(f.get('email') || '').trim(),
        phone: String(f.get('phone') || '').trim(),
        service: String(f.get('service') || '').trim(),
        issue: String(f.get('issue') || '').trim(),
        detail: String(f.get('detail') || '').trim(),
        locale,
        website: ''
      };

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent =
            locale === 'zh' ? '正在发送...' :
            locale === 'en' ? 'Sending...' :
            '견적 요청 전송 중...';
        }

        note.textContent =
          locale === 'zh' ? '正在发送报价请求。' :
          locale === 'en' ? 'Sending your quotation request.' :
          '견적 요청을 전송하고 있습니다.';
        note.className = 'form-note';

        const response = await fetch(
          'https://hxpjxebwpnepxcfighff.supabase.co/functions/v1/contact-request',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        const result = await response.json().catch(() => ({
          ok: false,
          error: `HTTP ${response.status}`
        }));

        if (!response.ok || !result.ok) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        note.textContent =
          locale === 'zh' ? '报价请求已成功发送。我们将确认后回复。' :
          locale === 'en' ? 'Your quotation request has been sent successfully.' :
          '견적 요청이 정상적으로 전송되었습니다. 확인 후 답변드리겠습니다.';
        note.className = 'form-note form-success';
        form.reset();
      } catch (error) {
        console.error('Quotation request failed:', error);
        note.textContent =
          locale === 'zh' ? '发送失败，请稍后重试。' :
          locale === 'en' ? 'The quotation request could not be sent. Please try again.' :
          '견적 요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
        note.className = 'form-note form-error';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }

  function bindLanguageButtons() {
    $$('.commerce-lang-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const requested = button.dataset.commerceLang;
        if (!SUPPORTED.includes(requested)) return;
        locale = requested;
        localStorage.setItem('mot-locale', locale);
        const current = new URL(window.location.href);
        current.searchParams.set('lang', locale);
        history.replaceState(null, '', current);
        render();
      });
    });
  }

  function bindUnconfiguredCheckout() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-unconfigured="true"]');
      if (!target) return;
      event.preventDefault();
      $('#checkout-setup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function render() {
    setPageMetadata();
    translateStaticText();
    applyConfig();
    renderB2B();
    renderContent();
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    configureFormMail();
    bindLanguageButtons();
    bindUnconfiguredCheckout();
  });
})();
