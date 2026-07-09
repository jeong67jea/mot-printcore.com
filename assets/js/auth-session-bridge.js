// M.O.T. PrintCore Academy auth-session bridge
// Purpose: When Supabase email confirmation / magic-link returns to index.html or auth-callback.html,
// this script saves the Supabase session in browser localStorage and then moves the customer to academy.html.
(function () {
  const CONFIG = window.MOT_ACADEMY_CONFIG || {};
  const SUPPORTED = ['ko', 'en', 'zh'];

  function isPlaceholder(value) {
    return !value || /\{\{|YOUR_|example\.com|https:\/\/YOUR_/i.test(String(value));
  }
  function configured() {
    return !isPlaceholder(CONFIG?.supabase?.url) && !isPlaceholder(CONFIG?.supabase?.anonKey);
  }
  function currentLocale() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    let stored = null;
    try { stored = localStorage.getItem('mot-locale'); } catch (_) {}
    return SUPPORTED.includes(fromUrl) ? fromUrl : (SUPPORTED.includes(stored) ? stored : 'ko');
  }
  function hasAuthReturnParams() {
    const hash = location.hash || '';
    const search = location.search || '';
    return /access_token|refresh_token|type=|expires_in|code=|error=/.test(hash + search);
  }
  function pageUrl(page, params = {}) {
    const url = new URL(page || 'academy.html', location.href);
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });
    return url.href;
  }
  function nextPage() {
    const params = new URLSearchParams(location.search);
    const next = params.get('next') || 'academy.html';
    // Only allow local page redirects, never external URLs.
    if (/^https?:\/\//i.test(next) || next.startsWith('//')) return 'academy.html';
    return next;
  }
  async function run() {
    if (!configured()) return;
    if (!hasAuthReturnParams() && !document.body?.dataset?.authCallback) return;

    const note = document.getElementById('auth-callback-note');
    const setNote = (msg) => { if (note) note.textContent = msg; };
    setNote('로그인 인증 정보를 확인하고 있습니다...');

    try {
      const sdkUrl = CONFIG?.supabase?.sdkUrl || 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
      const module = await import(sdkUrl);
      const client = module.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });

      const url = new URL(location.href);
      const code = url.searchParams.get('code');
      if (code && typeof client.auth.exchangeCodeForSession === 'function') {
        try { await client.auth.exchangeCodeForSession(code); } catch (e) { console.warn('[MOT auth bridge] code exchange warning:', e); }
      }

      // Give supabase-js a moment to persist the session when the return URL uses a hash token.
      await new Promise((resolve) => setTimeout(resolve, 300));
      const { data } = await client.auth.getSession();
      const locale = currentLocale();
      const destination = pageUrl(nextPage(), { lang: locale, auth: data?.session ? 'ok' : 'check' });
      setNote(data?.session ? '로그인 완료. 아카데미로 이동합니다...' : '인증 확인 후 아카데미로 이동합니다...');
      location.replace(destination);
    } catch (error) {
      console.error('[MOT auth bridge] failed:', error);
      const locale = currentLocale();
      location.replace(pageUrl('academy.html', { lang: locale, auth: 'retry' }));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
