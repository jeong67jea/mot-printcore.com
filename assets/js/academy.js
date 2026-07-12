const CONFIG = window.MOT_ACADEMY_CONFIG || {};
const I18N = window.MOT_ACADEMY_I18N || {};
const SUPPORTED = ['ko', 'en', 'zh'];
const AcademyUI = window.MOTAcademyUI || null;
const PAGE = document.body?.dataset?.academyPage || 'academy';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function isPlaceholder(value) {
  return !value || /\{\{|YOUR_|example\.com|https:\/\/YOUR_/i.test(String(value));
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]));
}
function getLocale() {
  const requested = AcademyUI?.getLocale?.() || window.MOTLocale?.get?.() || new URLSearchParams(location.search).get('lang');
  const stored = (() => { try { return localStorage.getItem('mot-locale'); } catch (_) { return null; } })();
  return SUPPORTED.includes(requested) ? requested : (SUPPORTED.includes(stored) ? stored : 'ko');
}
let locale = getLocale();
function t(key) { return I18N?.[locale]?.[key] ?? I18N?.ko?.[key] ?? key; }
function fieldForLocale(prefix) { return `${prefix}_${locale === 'zh' ? 'zh' : locale}`; }
function valueLocalized(obj, prefix, fallback = '') {
  return obj?.[fieldForLocale(prefix)] || obj?.[`${prefix}_ko`] || obj?.[`${prefix}_en`] || obj?.[`${prefix}_zh`] || fallback;
}
function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : locale === 'zh' ? 'zh-CN' : 'en-US', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);
}
function currentPath(file) {
  const base = location.pathname.replace(/[^/]*$/, '');
  return `${base}${file}`;
}
function withLocale(url) {
  const absolute = new URL(url, location.href);
  absolute.searchParams.set('lang', locale);
  return absolute.href;
}
function setSetupBanner(visible) {
  $('#academy-setup-banner')?.classList.toggle('is-visible', !!visible);
}
function configured() {
  return !isPlaceholder(CONFIG?.supabase?.url) && !isPlaceholder(CONFIG?.supabase?.anonKey);
}
function configuredPayment() {
  return configured() && !isPlaceholder(CONFIG?.payment?.storeId) && !isPlaceholder(CONFIG?.payment?.channelKey);
}
let supabase = null;
let resolveAcademyReady;
const academyReady = new Promise((resolve) => { resolveAcademyReady = resolve; });

async function initializeSupabase() {
  if (!configured()) return null;
  try {
    // Dynamic import keeps KO / EN / 中文 controls usable even if an external SDK is blocked.
    const source = CONFIG?.supabase?.sdkUrl || 'https://esm.sh/@supabase/supabase-js@2';
    const module = await import(source);
    const createClient = module.createClient;
    if (typeof createClient !== 'function') throw new Error('Supabase client module is unavailable');
    supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return supabase;
  } catch (error) {
    console.error('[M.O.T. Academy] Supabase SDK initialization failed.', error);
    return null;
  }
}

async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}
async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}
function toast(message, state = '') {
  const note = $('#academy-global-note');
  if (!note) return;
  note.textContent = message;
  note.className = `a-note ${state}`;
  clearTimeout(window.__academyToastTimer);
  window.__academyToastTimer = setTimeout(() => { if (note.textContent === message) note.textContent = ''; }, 5500);
}
function refreshStaticLanguage() {
  locale = AcademyUI?.getLocale?.() || window.MOTLocale?.get?.() || getLocale();
  AcademyUI?.apply?.();
}

function openLogin() {
  const modal = $('#academy-login-modal');
  if (!modal) return;
  modal.classList.add('is-open');
  $('#academy-login-email')?.focus();
}
function closeLogin() { $('#academy-login-modal')?.classList.remove('is-open'); }
async function bindAuth() {
  const loginBtn = $('#academy-login-button');
  const logoutBtn = $('#academy-logout-button');
  const user = await getUser();
  if (loginBtn) loginBtn.hidden = !!user;
  if (logoutBtn) logoutBtn.hidden = !user;
  const identity = $('#academy-identity');
  if (identity) identity.textContent = user?.email || '';
  loginBtn?.addEventListener('click', openLogin);
  logoutBtn?.addEventListener('click', async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    location.href = withLocale(CONFIG.routes?.academy || 'academy.html');
  });
  $('#academy-login-close')?.addEventListener('click', closeLogin);
  $('#academy-login-modal')?.addEventListener('click', (event) => {
    if (event.target.id === 'academy-login-modal') closeLogin();
  });
  const form = $('#academy-login-form');

  let loginNote = $('#academy-login-note');
  if (form && !loginNote) {
    loginNote = document.createElement('p');
    loginNote.id = 'academy-login-note';
    loginNote.className = 'a-note';
    loginNote.setAttribute('aria-live', 'polite');
    form.appendChild(loginNote);
  }

  const loginMessages = {
    ko: {
      sending: '로그인 링크를 요청하고 있습니다...',
      success: '정상적으로 요청되었습니다. 입력한 이메일의 받은편지함과 스팸함을 확인해 주세요.',
      error: '로그인 링크 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    },
    en: {
      sending: 'Requesting your sign-in link...',
      success: 'Your request was completed successfully. Check the inbox and spam folder of the email you entered.',
      error: 'The sign-in link request failed. Please try again later.'
    },
    zh: {
      sending: '正在请求登录链接...',
      success: '请求已成功完成。请检查所输入邮箱的收件箱和垃圾邮件文件夹。',
      error: '登录链接请求失败，请稍后重试。'
    }
  };

  const setLoginNote = (message, state = '') => {
    if (!loginNote) return;
    loginNote.textContent = message;
    loginNote.className = `a-note ${state}`.trim();
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const messageSet = loginMessages[locale] || loginMessages.ko;

    if (!supabase) {
      setLoginNote(t('setupLead'), 'error');
      toast(t('setupLead'), 'error');
      return;
    }

    const email = $('#academy-login-email')?.value?.trim();
    if (!email) return;

    const submit = $('#academy-login-submit');
    if (submit) {
      submit.disabled = true;
      submit.textContent = t('sending');
    }
    setLoginNote(messageSet.sending);

    const redirectUrl = new URL(CONFIG.routes?.library || 'my-library.html', CONFIG.siteUrl || location.href);
    redirectUrl.searchParams.set('lang', locale);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl.toString() }
    });

    if (submit) {
      submit.disabled = false;
      submit.textContent = t('sendMagicLink');
    }

    if (error) {
      console.error('[M.O.T. Academy] Magic-link request failed:', error);
      setLoginNote(`${messageSet.error} (${error.message || 'Unknown error'})`, 'error');
      toast(t('loginError'), 'error');
      return;
    }

    setLoginNote(messageSet.success, 'success');
    toast(messageSet.success, 'success');

    try {
      await invokeFunction('contact-request', {
        requestType: 'login_request',
        email,
        locale,
        pageUrl: location.href,
        requestedAt: new Date().toISOString(),
        website: ''
      });
    } catch (notifyError) {
      console.warn('[M.O.T. Academy] Admin login-request notification failed:', notifyError);
    }
  });
}

function cardType(product) {
  if (product.content_kind === 'pdf') return t('typePdf');
  if (product.content_kind === 'video') return t('typeVideo');
  if (product.membership_group === 'library') return t('typeLibrary');
  return t('typeMembership');
}
function cardBilling(product) {
  if (product.access_type === 'monthly_manual') return t('monthly');
  return t('oneTime');
}
function productActionText(product) {
  if (product.access_type === 'monthly_manual') return t('subscribe');
  return t('buy');
}
function buildProductCard(product) {
  const desc = valueLocalized(product, 'description', '');
  const audience = valueLocalized(product, 'audience', '');
  const note = product.membership_group ? `<a class="a-preview-link" href="${withLocale(`${CONFIG.routes.academy}?focus=subscription`)}">${escapeHtml(t('includedWithMembership'))}</a>` : '';
  const preview = product.preview_url ? `<a class="a-preview-link" href="${escapeHtml(product.preview_url)}" target="_blank" rel="noopener">${escapeHtml(t('preview'))} ↗</a>` : '';
  return `<article class="a-card" data-kind="${escapeHtml(product.content_kind)}" data-product="${escapeHtml(product.slug)}">
    <div class="a-card-kind"><span>${escapeHtml(cardType(product))}</span><b>${escapeHtml(cardBilling(product))}</b></div>
    <h3>${escapeHtml(valueLocalized(product, 'title', product.slug))}</h3>
    <p class="a-card-desc">${escapeHtml(desc)}</p>
    <div class="a-card-meta">
      <span><i>${escapeHtml(locale === 'ko' ? '대상' : locale === 'zh' ? '适用对象' : 'Audience')}</i><b>${escapeHtml(audience || '—')}</b></span>
      <span><i>${escapeHtml(locale === 'ko' ? '이용권' : locale === 'zh' ? '使用权' : 'Access')}</i><b>${escapeHtml(product.access_type === 'monthly_manual' ? t('monthly') : t('perpetual'))}</b></span>
    </div>
    <div class="a-card-footer"><div class="a-price">${escapeHtml(formatMoney(product.price_krw))}<small>${escapeHtml(product.access_type === 'monthly_manual' ? t('monthly') : t('oneTime'))}</small></div>
    <button class="a-button a-dark" type="button" data-purchase="${escapeHtml(product.slug)}">${escapeHtml(productActionText(product))} <span>↗</span></button></div>
    ${preview || note}
  </article>`;
}
let catalogProducts = [];
async function loadCatalog() {
  const target = $('#academy-catalog');
  if (!target) return;
  if (!supabase) { target.innerHTML = `<div class="a-empty">${escapeHtml(t('setupLead'))}</div>`; return; }
  target.innerHTML = `<div class="a-empty">${escapeHtml(t('loading'))}</div>`;
  const { data, error } = await supabase.from('products')
    .select('id,slug,content_kind,access_type,membership_group,title_ko,title_en,title_zh,description_ko,description_en,description_zh,audience_ko,audience_en,audience_zh,price_krw,preview_url,sort_order')
    .eq('is_published', true).order('sort_order', { ascending: true });
  if (error) { target.innerHTML = `<div class="a-empty">${escapeHtml(t('noProducts'))}</div>`; return; }
  catalogProducts = data || [];
  applyCatalogFilter();
  bindCatalogActions();
}
function applyCatalogFilter() {
  const target = $('#academy-catalog');
  if (!target) return;
  const focus = new URLSearchParams(location.search).get('focus') || 'all';
  const filtered = catalogProducts.filter((p) => {
    if (focus === 'pdf') return p.content_kind === 'pdf';
    if (focus === 'video') return p.content_kind === 'video';
    if (focus === 'subscription') return p.access_type === 'monthly_manual';
    return true;
  });
  target.innerHTML = filtered.length ? filtered.map(buildProductCard).join('') : `<div class="a-empty">${escapeHtml(t('noProducts'))}</div>`;
  $$('.a-filter button').forEach((button) => button.classList.toggle('is-active', button.dataset.filter === focus));
}
function bindCatalogActions() {
  $$('.a-filter button').forEach((button) => {
    button.onclick = () => {
      const url = new URL(location.href);
      url.searchParams.set('focus', button.dataset.filter);
      url.searchParams.set('lang', locale);
      history.replaceState(null, '', url);
      applyCatalogFilter();
      bindCatalogActions();
    };
  });
  $$('[data-purchase]').forEach((button) => {
    button.onclick = () => startPurchase(button.dataset.purchase, button);
  });
}
async function requireLogin() {
  const user = await getUser();
  if (user) return user;
  openLogin();
  toast(t('loginRequired'));
  return null;
}
async function invokeFunction(name, body) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data;
}
async function startPurchase(slug, button) {
  if (!configuredPayment()) { toast(t('setupLead'), 'error'); return; }
  const user = await requireLogin();
  if (!user) return;
  const original = button.innerHTML;
  button.disabled = true; button.textContent = t('paymentPreparing');
  try {
    const order = await invokeFunction('create-order', { productSlug: slug });
    if (!window.PortOne?.requestPayment) throw new Error('PortOne Browser SDK did not load');
    const successUrl = new URL(CONFIG.routes.success, location.href);
    successUrl.searchParams.set('order', order.orderId);
    successUrl.searchParams.set('lang', locale);
    const response = await window.PortOne.requestPayment({
      storeId: CONFIG.payment.storeId,
      channelKey: CONFIG.payment.channelKey,
      paymentId: order.paymentId,
      orderName: order.orderName,
      totalAmount: order.amount,
      currency: 'CURRENCY_KRW',
      payMethod: 'CARD',
      redirectUrl: successUrl.href,
      customer: { email: user.email, fullName: user.user_metadata?.full_name || user.email }
    });
    if (response?.code) throw new Error(response.message || response.code);
    const paymentId = response?.paymentId || order.paymentId;
    location.href = withLocale(`${CONFIG.routes.success}?order=${encodeURIComponent(order.orderId)}&paymentId=${encodeURIComponent(paymentId)}`);
  } catch (error) {
    console.error(error);
    toast(t('paymentError'), 'error');
    button.disabled = false; button.innerHTML = original;
  }
}

async function loadLibrary() {
  const target = $('#academy-library');
  if (!target) return;
  if (!supabase) { target.innerHTML = `<div class="a-empty">${escapeHtml(t('setupLead'))}</div>`; return; }
  const user = await getUser();
  if (!user) { target.innerHTML = `<div class="a-empty"><p>${escapeHtml(t('loginRequired'))}</p><button class="a-button a-primary" id="library-login">${escapeHtml(t('navLogin'))}</button></div>`; $('#library-login')?.addEventListener('click', openLogin); return; }
  target.innerHTML = `<div class="a-empty">${escapeHtml(t('loading'))}</div>`;
  try {
    const data = await invokeFunction('customer-library', {});
    const items = data.items || [];
    if (!items.length) { target.innerHTML = `<div class="a-empty">${escapeHtml(t('libraryEmpty'))}</div>`; return; }
    target.innerHTML = items.map((item) => {
      const title = valueLocalized(item, 'title', item.slug);
      const desc = valueLocalized(item, 'description', '');
      const expiry = item.expires_at ? new Date(item.expires_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'ko-KR') : t('lifetime');
      const actions = item.content_kind === 'pdf'
        ? `<button class="a-button a-dark" data-download="${escapeHtml(item.slug)}">${escapeHtml(t('download'))} ↓</button>`
        : item.content_kind === 'video'
          ? `<button class="a-button a-dark" data-watch-product="${escapeHtml(item.slug)}">${escapeHtml(t('watch'))} →</button>`
          : `<a class="a-button a-dark" href="${withLocale(CONFIG.routes.academy)}">${escapeHtml(t('viewLibrary'))} →</a>`;
      return `<article class="a-library-card"><span class="state">${escapeHtml(t('active'))}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p><div class="expires">${escapeHtml(item.expires_at ? `${t('expires')}: ${expiry}` : t('lifetime'))}</div><div class="actions">${actions}${item.access_type === 'monthly_manual' ? `<button class="a-button a-primary" data-purchase="${escapeHtml(item.slug)}">${escapeHtml(t('renew'))}</button>` : ''}</div></article>`;
    }).join('');
    $$('[data-download]').forEach((button) => button.addEventListener('click', () => downloadProduct(button.dataset.download, button)));
    $$('[data-watch-product]').forEach((button) => button.addEventListener('click', async () => {
      const slug = button.dataset.watchProduct;
      location.href = withLocale(`${CONFIG.routes.player}?product=${encodeURIComponent(slug)}`);
    }));
    $$('[data-purchase]').forEach((button) => button.addEventListener('click', () => startPurchase(button.dataset.purchase, button)));
  } catch (error) {
    console.error(error); target.innerHTML = `<div class="a-empty">${escapeHtml(t('libraryEmpty'))}</div>`;
  }
}
async function downloadProduct(slug, button) {
  const original = button.innerHTML;
  button.disabled = true; button.textContent = t('loading');
  try {
    const data = await invokeFunction('access-content', { productSlug: slug, action: 'download' });
    if (!data.url) throw new Error('No signed URL');
    window.open(data.url, '_blank', 'noopener');
  } catch (error) {
    console.error(error); toast(t('noAccess'), 'error');
  } finally { button.disabled = false; button.innerHTML = original; }
}
async function loadPlayer() {
  const video = $('#academy-video');
  if (!video) return;
  const productSlug = new URLSearchParams(location.search).get('product');
  const lessonSlug = new URLSearchParams(location.search).get('lesson');
  const title = $('#academy-player-title');
  if (!productSlug) { title.textContent = t('noAccess'); return; }
  try {
    const data = await invokeFunction('access-content', { productSlug, lessonSlug, action: 'stream' });
    if (!data.url) throw new Error('No stream URL');
    title.textContent = valueLocalized(data.product || {}, 'title', t('playerTitle'));
    $('#academy-player-description').textContent = valueLocalized(data.product || {}, 'description', t('playerLead'));
    if (data.lesson) $('#academy-lesson-title').textContent = valueLocalized(data.lesson, 'title', '');
    video.src = data.url; video.load();
  } catch (error) {
    console.error(error); title.textContent = t('noAccess'); $('#academy-player-description').textContent = t('playerLead');
  }
}
async function verifyPaymentPage() {
  const result = $('#academy-payment-result');
  if (!result || !supabase) return;
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');
  const paymentId = params.get('paymentId');
  if (!orderId || !paymentId) { result.textContent = t('paymentFailed'); return; }
  result.textContent = t('paymentVerify');
  try {
    const data = await invokeFunction('verify-portone-payment', { orderId, paymentId });
    result.textContent = data?.message || t('successLead');
    $('#academy-success-go')?.removeAttribute('hidden');
  } catch (error) {
    console.error(error); result.textContent = t('paymentFailed');
    $('#academy-success-back')?.removeAttribute('hidden');
  }
}

function attachGeneralRoutes() {
  $$('[data-scroll-catalog]').forEach((button) => button.addEventListener('click', () => $('#academy-catalog-section')?.scrollIntoView({ behavior: 'smooth' })));
  $$('[data-open-login]').forEach((button) => button.addEventListener('click', openLogin));
}

async function bootstrap() {
  let client = null;
  try {
    refreshStaticLanguage();
    client = await initializeSupabase();
    setSetupBanner(!configured() || !client);
    await bindAuth();
    attachGeneralRoutes();
    if (PAGE === 'academy') await loadCatalog();
    if (PAGE === 'library') await loadLibrary();
    if (PAGE === 'player') await loadPlayer();
    if (PAGE === 'success') await verifyPaymentPage();
  } catch (error) {
    console.error('[M.O.T. Academy] UI initialization failed.', error);
    setSetupBanner(true);
  } finally {
    resolveAcademyReady({ supabase, configured: !!client });
  }
}

document.addEventListener('mot:academy-languagechange', async (event) => {
  locale = event.detail?.locale || AcademyUI?.getLocale?.() || getLocale();
  if (PAGE === 'academy') await loadCatalog();
  if (PAGE === 'library') await loadLibrary();
  if (PAGE === 'player') await loadPlayer();
});
document.addEventListener('DOMContentLoaded', bootstrap);

export { supabase, academyReady, CONFIG, I18N, t, getUser, getSession, configured, configuredPayment, escapeHtml, valueLocalized, withLocale, locale };
