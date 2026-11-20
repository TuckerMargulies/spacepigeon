// Order request rules shared by the API and its tests. Pure: no network, no env.

export const PRODUCTS = {
  SPH72: { name: 'SPH72', priceCents: 24600000 },
  SPH42: { name: 'SPH42', priceCents: 17400000 },
  PATCH: { name: 'Official Pigeonnaut Patch', priceCents: null },
};

export const STATUSES = ['new', 'contacted', 'fulfilled', 'cancelled'];

const LIMITS = {
  name: 120,
  email: 254,
  line1: 200,
  line2: 200,
  city: 100,
  region: 100,
  postal: 20,
  country: 60,
  notes: 1000,
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Control characters (except tab/newline in notes) never belong in a form field.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function text(value, max, { required = true, multiline = false } = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') return { error: 'must be text' };
  const v = multiline ? value.replace(/\r\n/g, '\n').trim() : value.replace(/\s+/g, ' ').trim();
  if (required && v.length === 0) return { error: 'is required' };
  if (v.length > max) return { error: `must be ${max} characters or fewer` };
  if (CONTROL_RE.test(v) || (!multiline && /[\n\t]/.test(v))) return { error: 'has characters we can’t accept' };
  return { value: v };
}

/**
 * Checks an order request from the browser. Returns { order } or { errors }.
 * The price always comes from PRODUCTS, never from the request.
 */
export function validateOrder(input) {
  const errors = {};
  const order = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: { form: 'is missing' } };

  const product = typeof input.product === 'string' ? input.product.toUpperCase() : '';
  if (!PRODUCTS[product]) errors.product = 'is not one we make';
  else order.product = product;

  const qty = Number(input.quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) errors.quantity = 'must be a whole number from 1 to 10';
  else order.quantity = qty;

  for (const field of ['name', 'email']) {
    const r = text(input[field], LIMITS[field]);
    if (r.error) errors[field] = r.error;
    else order[field] = r.value;
  }
  if (order.email !== undefined) {
    order.email = order.email.toLowerCase();
    if (!EMAIL_RE.test(order.email)) {
      errors.email = 'doesn’t look like an email address';
      delete order.email;
    }
  }

  const addr = input.address && typeof input.address === 'object' ? input.address : {};
  const address = {};
  for (const field of ['line1', 'line2', 'city', 'region', 'postal', 'country']) {
    const r = text(addr[field], LIMITS[field], { required: !['line2', 'region'].includes(field) });
    if (r.error) errors[`address.${field}`] = r.error;
    else address[field] = r.value;
  }
  order.shipping_address = address;

  const notes = text(input.notes, LIMITS.notes, { required: false, multiline: true });
  if (notes.error) errors.notes = notes.error;
  else order.notes = notes.value || null;

  if (Object.keys(errors).length) return { errors };
  order.unit_price_cents = PRODUCTS[order.product].priceCents;
  return { order };
}

/** A honeypot field people never see. Anything in it means a bot. */
export function isBot(input) {
  return Boolean(input && typeof input.company === 'string' && input.company.trim() !== '');
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newReference(randomBytes) {
  const bytes = randomBytes(6);
  let ref = 'SP-';
  for (const b of bytes) ref += REF_ALPHABET[b % REF_ALPHABET.length];
  return ref;
}

export function formatPrice(cents) {
  if (cents === null || cents === undefined) return 'Price on request';
  return '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function isStatus(value) {
  return STATUSES.includes(value);
}

export function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
