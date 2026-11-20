// Every setting the API reads, in one place. Secrets stay server-side.
//
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   set by the Vercel ↔ Supabase integration
//   resend_key                                Resend API key
//   SESSION_SECRET                            32+ characters; signs admin links and sessions
//   ADMIN_EMAILS                              comma-separated; default admin@coalesce.nyc
//   ORDER_CC                                  comma-separated; default admin@coalesce.nyc
//   EMAIL_FROM                                default "Space Pigeon <orders@spacepigeon.net>"
//   SITE_URL                                  origin for email links; default https://spacepigeon.net
//   RESEND_API_URL                            tests only (stub); default https://api.resend.com

function list(value, fallback) {
  const items = (value ?? fallback).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return items;
}

export function config() {
  const env = process.env;
  return {
    supabaseUrl: (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, ''),
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    resendKey: env.resend_key || env.RESEND_API_KEY || '',
    resendApiUrl: (env.RESEND_API_URL || 'https://api.resend.com').replace(/\/$/, ''),
    emailFrom: env.EMAIL_FROM || 'Space Pigeon <orders@spacepigeon.net>',
    sessionSecret: env.SESSION_SECRET || '',
    adminEmails: list(env.ADMIN_EMAILS, 'admin@coalesce.nyc'),
    orderCc: list(env.ORDER_CC, 'admin@coalesce.nyc'),
    siteUrl: (env.SITE_URL || 'https://spacepigeon.net').replace(/\/$/, ''),
  };
}
