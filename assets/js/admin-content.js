import { supabase, academyReady, t, getUser, configured, escapeHtml, withLocale, CONFIG } from './academy.js';

const $ = (selector, root = document) => root.querySelector(selector);
let products = [];
let current = null;
let workspaceBound = false;
let authSubscription = null;

function note(message, state = '') {
  const node = $('#admin-note');
  if (!node) return;
  node.textContent = message || '';
  node.className = `a-note ${state}`;
}
function accessMessage(message, state = '') {
  const node = $('#admin-access-message');
  if (!node) return;
  node.textContent = message || '';
  node.className = `a-note ${state}`;
}
function val(id) { return $(id)?.value?.trim() || ''; }
function setButtonBusy(selector, busy, label) {
  const button = $(selector);
  if (!button) return;
  if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent;
  button.disabled = !!busy;
  button.textContent = busy ? label : button.dataset.defaultLabel;
}
function adminRedirectUrl() {
  const route = CONFIG?.routes?.admin || 'admin-content.html';
  return withLocale(route);
}
function setAuthState({ user = null, role = null, state = 'signed-out', message = '', messageState = '' } = {}) {
  const access = $('#admin-access');
  const workspace = $('#admin-workspace');
  const signedOut = $('#admin-signed-out-state');
  const signedIn = $('#admin-signed-in-state');
  const email = user?.email || '—';
  $('#admin-session-email') && ($('#admin-session-email').textContent = email);
  $('#admin-workspace-email') && ($('#admin-workspace-email').textContent = user?.email ? `· ${user.email}` : '');
  if (signedOut) signedOut.hidden = state !== 'signed-out';
  if (signedIn) signedIn.hidden = state === 'signed-out';
  if (access) access.hidden = state === 'authorized';
  if (workspace) workspace.hidden = state !== 'authorized';
  const sessionRole = $('#admin-session-role');
  if (sessionRole) {
    sessionRole.textContent = state === 'authorized' ? t('adminRoleVerified') : (role ? `${t('adminCurrentRole')}: ${role}` : '');
    sessionRole.className = `a-note ${state === 'denied' ? 'error' : state === 'authorized' ? 'success' : ''}`;
  }
  accessMessage(message, messageState);
}

async function fetchAdminProfile(user) {
  if (!supabase || !user) return null;
  const { data, error } = await supabase.from('profiles').select('id,email,role').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function loadProducts() {
  const { data, error } = await supabase.from('products').select('*').order('sort_order');
  if (error) throw error;
  products = data || [];
  renderProducts();
}

async function refreshAdminAccess({ reloadProducts = true } = {}) {
  if (!configured() || !supabase) {
    setAuthState({ state: 'signed-out', message: t('adminConfigMissing'), messageState: 'error' });
    return false;
  }
  const user = await getUser();
  if (!user) {
    setAuthState({ state: 'signed-out', message: t('adminSignInPrompt') });
    return false;
  }
  setAuthState({ user, state: 'checking', message: t('adminRoleChecking') });
  try {
    const profile = await fetchAdminProfile(user);
    if (profile?.role !== 'admin') {
      setAuthState({ user, role: profile?.role || 'customer', state: 'denied', message: t('adminWrongRole'), messageState: 'error' });
      return false;
    }
    setAuthState({ user, role: profile.role, state: 'authorized', message: '' });
    if (reloadProducts) await loadProducts();
    return true;
  } catch (error) {
    console.error('[M.O.T. Admin] role verification failed', error);
    setAuthState({ user, state: 'denied', message: t('adminRoleCheckError'), messageState: 'error' });
    return false;
  }
}

async function handlePasswordSignIn(event) {
  event.preventDefault();
  if (!configured() || !supabase) { accessMessage(t('adminConfigMissing'), 'error'); return; }
  const email = val('#admin-signin-email');
  const password = $('#admin-signin-password')?.value || '';
  if (!email || !password) { accessMessage(t('fieldRequired'), 'error'); return; }
  setButtonBusy('#admin-signin-submit', true, t('adminSigningIn'));
  accessMessage(t('adminSigningIn'));
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    $('#admin-signin-password').value = '';
    const allowed = await refreshAdminAccess({ reloadProducts: true });
    if (!allowed) return;
    accessMessage(t('adminSignInSuccess'), 'success');
  } catch (error) {
    console.error('[M.O.T. Admin] password sign-in failed', error);
    accessMessage(t('adminSignInError'), 'error');
  } finally {
    setButtonBusy('#admin-signin-submit', false);
  }
}

async function handleMagicLinkSignIn(event) {
  event.preventDefault();
  if (!configured() || !supabase) { accessMessage(t('adminConfigMissing'), 'error'); return; }
  const email = val('#admin-magic-email');
  if (!email) { accessMessage(t('fieldRequired'), 'error'); return; }
  setButtonBusy('#admin-magic-submit', true, t('sending'));
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: adminRedirectUrl(), shouldCreateUser: false }
    });
    if (error) throw error;
    accessMessage(t('adminMagicSent'), 'success');
  } catch (error) {
    console.error('[M.O.T. Admin] magic-link sign-in failed', error);
    accessMessage(t('adminMagicError'), 'error');
  } finally {
    setButtonBusy('#admin-magic-submit', false);
  }
}

async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut({ scope: 'local' });
  setAuthState({ state: 'signed-out', message: t('adminSignOutDone'), messageState: 'success' });
  products = []; current = null;
}

function bindAuthentication() {
  $('#admin-signin-form')?.addEventListener('submit', handlePasswordSignIn);
  $('#admin-magic-form')?.addEventListener('submit', handleMagicLinkSignIn);
  $('#admin-show-password')?.addEventListener('change', (event) => {
    const input = $('#admin-signin-password');
    if (input) input.type = event.target.checked ? 'text' : 'password';
  });
  $('#admin-signout-inline')?.addEventListener('click', signOutAdmin);
}

function resetForm() {
  current = null;
  $('#admin-product-form')?.reset();
  $('#admin-product-id').value = '';
  $('#admin-sort').value = '100';
  $('#admin-publish').checked = false;
}
function productPayload() {
  return {
    slug: val('#admin-slug'), content_kind: val('#admin-kind'), access_type: val('#admin-billing'), membership_group: val('#admin-group') || null,
    title_ko: val('#admin-title-ko'), title_en: val('#admin-title-en'), title_zh: val('#admin-title-zh'),
    description_ko: val('#admin-desc-ko'), description_en: val('#admin-desc-en'), description_zh: val('#admin-desc-zh'),
    audience_ko: val('#admin-audience-ko'), audience_en: val('#admin-audience-en'), audience_zh: val('#admin-audience-zh'),
    price_krw: Number(val('#admin-price') || 0), sort_order: Number(val('#admin-sort') || 100), is_published: $('#admin-publish').checked
  };
}
function fillProduct(product) {
  current = product;
  $('#admin-product-id').value = product.id;
  $('#admin-slug').value = product.slug || '';
  $('#admin-kind').value = product.content_kind || 'pdf';
  $('#admin-billing').value = product.access_type || 'one_time';
  $('#admin-group').value = product.membership_group || '';
  $('#admin-title-ko').value = product.title_ko || '';
  $('#admin-title-en').value = product.title_en || '';
  $('#admin-title-zh').value = product.title_zh || '';
  $('#admin-desc-ko').value = product.description_ko || '';
  $('#admin-desc-en').value = product.description_en || '';
  $('#admin-desc-zh').value = product.description_zh || '';
  $('#admin-audience-ko').value = product.audience_ko || '';
  $('#admin-audience-en').value = product.audience_en || '';
  $('#admin-audience-zh').value = product.audience_zh || '';
  $('#admin-price').value = product.price_krw || 0;
  $('#admin-sort').value = product.sort_order || 100;
  $('#admin-publish').checked = !!product.is_published;
}
function renderProducts() {
  const list = $('#admin-product-list');
  const select = $('#admin-upload-product');
  if (!list || !select) return;
  list.innerHTML = products.map((product) => `<button type="button" data-id="${product.id}" class="${current?.id === product.id ? 'is-selected' : ''}"><span>${escapeHtml(product.title_ko || product.slug)}<small>${escapeHtml(product.slug)} · ${product.is_published ? t('published') : t('draft')}</small></span><b>${escapeHtml((product.content_kind || '').toUpperCase())}</b></button>`).join('') || `<p class="a-note">${escapeHtml(t('noProductsAdmin'))}</p>`;
  select.innerHTML = '<option value="">—</option>' + products.map((product) => `<option value="${product.id}">${escapeHtml(product.title_ko || product.slug)}</option>`).join('');
  list.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => {
    const product = products.find((item) => item.id === button.dataset.id);
    if (product) { fillProduct(product); renderProducts(); }
  }));
}
function updateLessonFields() { $('#admin-lesson-fields').hidden = val('#admin-upload-kind') !== 'video'; }

async function saveProduct(event) {
  event.preventDefault();
  const product = productPayload();
  if (!/^[a-z0-9-]+$/.test(product.slug) || !product.title_ko || !product.title_en || !product.title_zh) { note(t('fieldRequired'), 'error'); return; }
  const id = val('#admin-product-id');
  const response = id ? await supabase.from('products').update(product).eq('id', id) : await supabase.from('products').insert(product);
  if (response.error) { console.error(response.error); note(t('productSaveError'), 'error'); return; }
  note(t('productSaved'), 'success');
  await loadProducts();
}

async function uploadContent(event) {
  event.preventDefault();
  const productId = val('#admin-upload-product');
  const kind = val('#admin-upload-kind');
  const file = $('#admin-file').files?.[0];
  if (!productId || !file) { note(t('fieldRequired'), 'error'); return; }
  const product = products.find((item) => item.id === productId);
  if (!product) { note(t('fieldRequired'), 'error'); return; }
  const lessonSlug = val('#admin-lesson-slug');
  const lessonTitle = val('#admin-lesson-title');
  if (kind === 'video' && (!/^[a-z0-9-]+$/.test(lessonSlug) || !lessonTitle)) { note(t('fieldRequired'), 'error'); return; }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
  let bucket = 'academy-content';
  let path = '';
  if (kind === 'pdf') path = `books/${product.slug}/${Date.now()}-${safeName}`;
  else if (kind === 'video') path = `videos/${product.slug}/${Date.now()}-${safeName}`;
  else { bucket = 'academy-previews'; path = `previews/${product.slug}/${Date.now()}-${safeName}`; }
  note(t('uploading'));
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (uploadError) { console.error(uploadError); note(t('uploadError'), 'error'); return; }
  let linkError = null;
  if (kind === 'pdf') {
    ({ error: linkError } = await supabase.from('products').update({ storage_path: path }).eq('id', productId));
  } else if (kind === 'video') {
    ({ error: linkError } = await supabase.from('lessons').upsert({ product_id: productId, slug: lessonSlug, title_ko: lessonTitle, title_en: lessonTitle, title_zh: lessonTitle, storage_path: path, is_published: true }, { onConflict: 'product_id,slug' }));
  } else {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    ({ error: linkError } = await supabase.from('products').update({ preview_url: data.publicUrl }).eq('id', productId));
  }
  if (linkError) { console.error(linkError); note(t('uploadError'), 'error'); return; }
  await loadProducts();
  event.target.reset();
  updateLessonFields();
  note(t('uploadSuccess'), 'success');
}

function bindWorkspace() {
  if (workspaceBound) return;
  workspaceBound = true;
  $('#admin-new-product')?.addEventListener('click', resetForm);
  $('#admin-upload-kind')?.addEventListener('change', updateLessonFields);
  $('#admin-product-form')?.addEventListener('submit', saveProduct);
  $('#admin-upload-form')?.addEventListener('submit', uploadContent);
  updateLessonFields();
}

async function boot() {
  bindAuthentication();
  bindWorkspace();
  await academyReady;
  await refreshAdminAccess({ reloadProducts: true });
  if (supabase?.auth && !authSubscription) {
    const { data } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => refreshAdminAccess({ reloadProducts: true }), 0);
    });
    authSubscription = data?.subscription || null;
  }
}

document.addEventListener('mot:academy-languagechange', () => {
  if (products.length) renderProducts();
  refreshAdminAccess({ reloadProducts: false });
});
document.addEventListener('DOMContentLoaded', boot);
