/*
 * M.O.T. PrintCore Academy — public browser configuration
 * This file may contain ONLY the Supabase Project URL and Publishable (anon) key.
 * NEVER place Database Password, service_role key, sb_secret key, or PortOne API Secret here.
 */
window.MOT_ACADEMY_CONFIG = {
  siteUrl: "https://jeong67jea.github.io/mot-printcore.com/",

  supabase: {
    // Confirmed from the Supabase project overview screen.
    url: "https://hxpjxebwpnepxcfighff.supabase.co",

    // Paste the exact Supabase "Publishable key" here.
    // It normally begins with sb_publishable_... (or may be a legacy anon JWT beginning with eyJ...).
    anonKey: "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE",

    // Keep this unchanged.
    sdkUrl: "https://esm.sh/@supabase/supabase-js@2"
  },

  payment: {
    // Not required for administrator sign-in or content upload.
    // Set these only when PortOne payment setup is completed.
    storeId: "YOUR_PORTONE_STORE_ID",
    channelKey: "YOUR_PORTONE_CHANNEL_KEY"
  },

  routes: {
    academy: "academy.html",
    library: "my-library.html",
    player: "player.html",
    admin: "admin-content.html",
    success: "payment-success.html",
    failed: "payment-failed.html"
  }
};
