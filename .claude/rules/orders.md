---
description: Order requests, the admin area and email — applies to api/, admin/, assets/order.js, supabase/
globs: ["api/**", "admin/**", "assets/order.js", "supabase/**", "e2e/orders.spec.mjs", "e2e/admin.spec.mjs"]
---

# Order requests, admin and email

## Order requests (`api/order-request.js`)

- "Place Order" / "Purchase" (`data-order="SPH72|SPH42|PATCH"`) open the dialog; it posts JSON to `/api/order-request`. **A request is not a purchase**: nothing is charged, and the copy says so in the dialog and the email.
- The server validates everything (`api/_lib/orders.js`); the browser's checks are UX only. Prices come from `PRODUCTS`, never the request. The patch has no listed price ("Price on request").
- Honeypot `company`: a bot gets the same 200 answer and nothing is stored or sent.
- Rate limits (per instance, best effort): 5 per network address and 3 per email per 10 minutes.
- Saved first, then emailed. A failed email still returns success (`emailed: false`) — the request is on file.

## Email (`api/_lib/email.js`)

- Resend, key `resend_key`, from `EMAIL_FROM` (orders@spacepigeon.net; the domain must be verified in Resend).
- Order confirmation goes to the customer with `ORDER_CC` (admin@coalesce.nyc) on CC and as reply-to.
- Every interpolated value goes through `escapeHtml`. Email links use `SITE_URL`, never the request's Host header.
- Log error names only — never addresses, form contents or provider messages (`logError`).

## Admin (`admin/`, `api/admin/`)

- Sign-in is by emailed link only, for addresses in `ADMIN_EMAILS`. The login answer is identical for every address.
- Links carry an HMAC token (`tokens.js`, `SESSION_SECRET` ≥ 32 chars, else admin is off), purpose `login`, 15 minutes. **Opening a link changes nothing**; only the Continue button (POST `/api/admin/session`) spends it — mail scanners open links.
- The session is an HMAC token of purpose `session` (7 days) in the `sp_admin` cookie: HttpOnly, Secure, SameSite=Strict, Path=/api/admin. Every admin request re-checks the allow-list.
- The admin page renders data with `textContent` only (never `innerHTML`).

## Database (`supabase/migrations/`, `api/_lib/db.js`)

- `order_requests` has RLS on with no policies and no grants for `anon` / `authenticated`: the public API can't touch it.
- The service-role key is used only in `db.js`, and only after the caller is verified (validated public form, or a signed admin session). `service_role` gets SELECT, INSERT and UPDATE of `status`, `updated_at` only; no DELETE (cancel instead).
- Statuses: `new`, `contacted`, `fulfilled`, `cancelled`. Money in integer cents; times in UTC.
- A new column or status means: migration + `orders.js` + admin page + tests, in one PR.

## Tests

- `e2e/support/stub-services.mjs` stands in for Supabase and Resend (`SUPABASE_URL` / `RESEND_API_URL` point at it in `playwright.config.mjs`); tests read `/__state` to check what was stored and sent. Never hit the real services from tests.
- Form tests disable WebGL (`getContext → null`) so they don't wait on the 3D.
