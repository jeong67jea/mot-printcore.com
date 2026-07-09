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
function manualPurchaseEnabled() {
  // Safe default: when PortOne is not fully configured, use a manual purchase-request workflow.
  // Set CONFIG.payment.manualPurchase = false only after PortOne + Edge Functions are fully verified.
  return CONFIG?.payment?.manualPurchase !== false;
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
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) { toast(t('setupLead'), 'error'); return; }
    const email = $('#academy-login-email')?.value?.trim();
    if (!email) return;
    const submit = $('#academy-login-submit');
    submit.disabled = true; submit.textContent = t('sending');
    const callback = new URL(CONFIG.routes?.authCallback || 'auth-callback.html', location.href);
    callback.searchParams.set('next', CONFIG.routes?.academy || 'academy.html');
    callback.searchParams.set('lang', locale);
    const redirect = callback.href;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
    submit.disabled = false; submit.textContent = t('sendMagicLink');
    if (error) toast(t('loginError'), 'error');
    else toast(t('magicSent'), 'success');
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

async function notifyPurchaseRequest(requestId) {
  if (!supabase || !requestId) return { ok: false, skipped: true };
  try {
    const { data, error } = await supabase.functions.invoke('notify-purchase-request', { body: { requestId } });
    if (error) {
      console.warn('[M.O.T. Academy] purchase notification failed:', error);
      return { ok: false, error };
    }
    if (data && data.ok === false) console.warn('[M.O.T. Academy] purchase notification not sent:', data);
    return data || { ok: true };
  } catch (error) {
    console.warn('[M.O.T. Academy] purchase notification exception:', error);
    return { ok: false, error };
  }
}

async function requestManualPurchase(product, user) {
  if (!supabase) throw new Error('Supabase is not configured');
  if (!product?.id) throw new Error('Product id is missing');

  const openStatuses = ['requested', 'payment_pending', 'paid_confirmed'];
  const { data: existing, error: lookupError } = await supabase
    .from('purchase_requests')
    .select('id,status,created_at')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .in('status', openStatuses)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return { duplicate: true, request: existing };

  const row = {
    user_id: user.id,
    product_id: product.id,
    product_slug: product.slug,
    customer_email: user.email,
    price_krw: product.price_krw || 0,
    status: 'requested',
    request_note: `${valueLocalized(product, 'title', product.slug)} / ${formatMoney(product.price_krw)}`
  };
  const { data, error } = await supabase.from('purchase_requests').insert(row).select('id,status,created_at').single();
  if (error) throw error;

  // Send an administrator email notification through a Supabase Edge Function.
  // The purchase request itself is already saved, so email failure must not block the customer flow.
  const notification = await notifyPurchaseRequest(data?.id);
  return { duplicate: false, request: data, notification };
}

async function startPurchase(slug, button) {
  const user = await requireLogin();
  if (!user) return;
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) { toast(t('noProducts'), 'error'); return; }

  const original = button.innerHTML;
  button.disabled = true;

  // Safe manual purchase request mode. This is the default until PortOne and all Edge Functions are verified.
  if (manualPurchaseEnabled()) {
    button.textContent = t('manualPurchasePreparing');
    try {
      const result = await requestManualPurchase(product, user);
      const message = result.duplicate ? t('manualPurchaseDuplicate') : t('manualPurchaseRequested');
      toast(`${message} ${t('manualPurchaseInstructions')}`, 'success');
      button.textContent = result.duplicate ? t('manualPurchaseDuplicateShort') : t('manualPurchaseRequestedShort');
      window.setTimeout(() => { button.disabled = false; button.innerHTML = original; }, 3500);
    } catch (error) {
      console.error(error);
      toast(t('manualPurchaseError'), 'error');
      button.disabled = false; button.innerHTML = original;
    }
    return;
  }

  if (!configuredPayment()) { toast(t('setupLead'), 'error'); button.disabled = false; button.innerHTML = original; return; }
  button.textContent = t('paymentPreparing');
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

export { supabase, academyReady, CONFIG, I18N, t, getUser, getSession, configured, configuredPayment, manualPurchaseEnabled, escapeHtml, valueLocalized, withLocale, locale };
