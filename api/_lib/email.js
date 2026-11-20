// Email templates and the Resend call. Every interpolated value is escaped.
// The look follows the site: near-black space, cream type, mono labels, orange accents, and
// still renders of the 3D (assets/email/) — email clients can't run WebGL or load our web fonts.
import { PRODUCTS, formatPrice } from './orders.js';
import { config } from './env.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const C = { space: '#07080F', panel: '#0D0F19', line: '#23263A', cream: '#F2EFE6', body: '#C9CAD2', muted: '#8B8E9C', orange: '#FF6B2C', teal: '#7FE0C4' };
const DISPLAY = "'Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

const SPECS = {
  SPH72: ['FIT: DOVE', 'USE: INTER-PLANETARY', 'COST: $246,000'],
  SPH42: ['FIT: DOVE', 'USE: LOW EARTH ORBIT', 'COST: $174,000'],
  PATCH: ['EARNED BY ONLY THE BRAVEST ASTRO-FOWL.'],
};
const IMAGES = { SPH72: 'sph72.jpg', SPH42: 'sph42.jpg', PATCH: 'patch.jpg' };

function label(text, color = C.muted) {
  return `<span style="font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${color};">${escapeHtml(text)}</span>`;
}

function layout({ preheader, eyebrow, title, image, imageAlt, bodyHtml }) {
  const { siteUrl } = config();
  const site = escapeHtml(siteUrl);
  const img = image
    ? `<tr><td style="padding:0;"><img src="${site}/assets/email/${escapeHtml(image)}" width="600" alt="${escapeHtml(imageAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;background:${C.space};"></td></tr>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.space};" bgcolor="${C.space}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.space};">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.space}" style="background:${C.space};">
<tr><td align="center" style="padding:28px 12px 40px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="padding:0 4px 18px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-family:${DISPLAY};font-weight:900;font-size:15px;letter-spacing:0.08em;color:${C.cream};"><span style="color:${C.orange};">&#9679;</span>&nbsp; SPACE PIGEON</td>
    <td align="right">${label(eyebrow)}</td>
  </tr></table>
</td></tr>
<tr><td bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.line};border-radius:12px;overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${img}
<tr><td style="padding:32px 32px 8px;">
  <h1 style="margin:0;font-family:${DISPLAY};font-weight:900;font-size:30px;line-height:1.08;letter-spacing:-0.01em;color:${C.cream};">${escapeHtml(title)}</h1>
</td></tr>
<tr><td style="padding:12px 32px 32px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.body};">
${bodyHtml}
</td></tr>
</table>
</td></tr>
<tr><td style="padding:24px 4px 0;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.muted};">
  ${label("For the galaxy's ultimate navigators")}<br>
  <a href="${site}" style="color:${C.body};text-decoration:underline;">spacepigeon.net</a> &nbsp;·&nbsp;
  <a href="https://www.instagram.com/coalescenyc/" style="color:${C.body};text-decoration:underline;">Instagram</a> &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/company/coalesce-creative" style="color:${C.body};text-decoration:underline;">LinkedIn</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function row(name, valueHtml) {
  return `<tr><td valign="top" style="padding:12px 0;border-top:1px solid ${C.line};width:120px;">${label(name)}</td><td valign="top" style="padding:12px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:15px;line-height:1.5;color:${C.cream};">${valueHtml}</td></tr>`;
}

function addressLines(a) {
  return [a.line1, a.line2, [a.city, a.region, a.postal].filter(Boolean).join(', '), a.country].filter(Boolean);
}

export function orderConfirmationEmail(order) {
  const product = PRODUCTS[order.product];
  const { orderCc } = config();
  const contact = orderCc[0] || 'admin@coalesce.nyc';
  const subject = `Order request received: ${product.name} (${order.reference})`;
  const address = addressLines(order.shipping_address);
  const total = product.priceCents === null ? null : product.priceCents * order.quantity;
  const priceText = formatPrice(product.priceCents) + (total !== null && order.quantity > 1 ? ` each (${formatPrice(total)} total)` : '');
  const firstName = String(order.name).split(' ')[0];

  const html = layout({
    preheader: `${product.name} × ${order.quantity} — reference ${order.reference}. Nothing has been charged.`,
    eyebrow: `Order request · ${order.reference}`,
    title: 'We have your order request.',
    image: IMAGES[order.product],
    imageAlt: `The ${product.name}`,
    bodyHtml: `
<p style="margin:0 0 20px;">Hi ${escapeHtml(firstName)}, thanks for your order request. We'll be in touch to confirm the details.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${C.line};border-radius:10px;">
  <tr><td style="padding:16px 18px;">
    ${label('Status', C.orange)}<br>
    <span style="font-family:${SANS};font-size:15px;line-height:1.5;color:${C.cream};">Request filed. This is a request, not a purchase: nothing has been charged.</span>
  </td></tr>
</table>
<p style="margin:0 0 4px;font-family:${DISPLAY};font-weight:900;font-size:40px;line-height:1;letter-spacing:-0.02em;color:${C.cream};">${escapeHtml(product.name)}</p>
<p style="margin:0 0 20px;">${SPECS[order.product].map((l) => label(l, C.body)).join('<br>')}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
${row('Reference', `<strong>${escapeHtml(order.reference)}</strong>`)}
${row('Quantity', escapeHtml(order.quantity))}
${row('Price', escapeHtml(priceText))}
${row('Ship to', address.map(escapeHtml).join('<br>'))}
${order.notes ? row('Notes', escapeHtml(order.notes).replace(/\n/g, '<br>')) : ''}
</table>
<p style="margin:0;font-size:14px;color:${C.muted};">Questions? Reply to this email or write to <a href="mailto:${escapeHtml(contact)}" style="color:${C.teal};text-decoration:underline;">${escapeHtml(contact)}</a>.</p>`,
  });

  const text = [
    `Hi ${firstName}, thanks for your order request.`,
    `This is a request, not a purchase: nothing has been charged. We'll be in touch to confirm the details.`,
    '',
    `Reference: ${order.reference}`,
    `Product: ${product.name}`,
    `Quantity: ${order.quantity}`,
    `Price: ${priceText}`,
    `Ship to: ${address.join(', ')}`,
    order.notes ? `Notes: ${order.notes}` : null,
    '',
    `Questions? Reply to this email or write to ${contact}.`,
    '',
    "Space Pigeon — for the galaxy's ultimate navigators",
  ].filter((l) => l !== null).join('\n');
  return { subject, html, text };
}

export function adminSignInEmail(link) {
  const subject = 'Your Space Pigeon admin sign-in link';
  const html = layout({
    preheader: 'Your sign-in link. It works for 15 minutes.',
    eyebrow: 'Admin sign-in',
    title: 'Sign in to Space Pigeon admin.',
    image: 'hero.jpg',
    imageAlt: 'A pigeon in an SPH72 helmet, in orbit',
    bodyHtml: `
<p style="margin:0 0 24px;">Use this link within 15 minutes. If you didn't ask for it, you can ignore this email.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${C.orange}" style="border-radius:999px;">
  <a href="${escapeHtml(link)}" style="display:inline-block;padding:15px 28px;font-family:${DISPLAY};font-weight:900;font-size:14px;letter-spacing:0.06em;color:${C.space};text-decoration:none;">OPEN ADMIN &rarr;</a>
</td></tr></table>`,
  });
  const text = `Sign in to Space Pigeon admin (valid for 15 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email.`;
  return { subject, html, text };
}

/** Sends through Resend. Throws on failure; callers decide whether that matters. */
export async function sendEmail({ to, cc, replyTo, subject, html, text }) {
  const { resendKey, resendApiUrl, emailFrom } = config();
  if (!resendKey) throw new Error('EmailNotConfigured');
  const res = await fetch(`${resendApiUrl}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      ...(cc && cc.length ? { cc } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) throw new Error(`EmailFailed${res.status}`);
  return res.json().catch(() => ({}));
}
