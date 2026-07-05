/*
  M.O.T. PrintCore Academy — Public Browser Configuration
  ----------------------------------------------------------------
  This file is uploaded to GitHub Pages and is public.
  ✅ Put only public values here: Supabase URL, anon/publishable key,
     PortOne Store ID and Channel Key.
  ❌ Never put any API Secret, service-role key, payment secret, billing key,
     database password, or account login in this file.

  Before release, replace every {{ ... }} value.
*/
window.MOT_ACADEMY_CONFIG = {
  brand: "M.O.T. PrintCore Academy",
  siteUrl: "https://jeong67jea.github.io/mot-printcore.com/",

  supabase: {
    url: "https://abcdefghijklm.supabase.co",
    anonKey: "sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxx"
  },

  auth: {
    // Administrator login uses Supabase Auth email/password or a verified magic link.
    // Keep registration closed on the public website. Create the admin user in Supabase Dashboard.
    adminSignIn: "password_or_magic_link",
    publicAdminSignup: false
  },

  payment: {
    provider: "PORTONE_V2",
    testMode: true,
    storeId: "{{ store-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx }}",
    channelKey: "{{ channel-key-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx }}",
    currency: "KRW"
  },

  storage: {
    privateBucket: "academy-content",
    previewBucket: "academy-previews",
    signedUrlSeconds: 600
  },

  routes: {
    academy: "academy.html",
    library: "my-library.html",
    player: "player.html",
    success: "payment-success.html",
    failed: "payment-failed.html",
    admin: "admin-content.html",
    terms: "terms.html",
    privacy: "privacy.html",
    refund: "refund.html",
    commerce: "commerce.html"
  },

  contact: {
    supportEmail: "{{ support@yourdomain.com }}",
    privacyEmail: "{{ privacy@yourdomain.com }}"
  },

  security: {
    allowDirectPdfDownload: true,
    showAdminLink: false,
    requireMagicLinkLogin: true
  }
};
