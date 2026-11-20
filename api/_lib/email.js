// Email templates and the Resend call. Every interpolated value is escaped.
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

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f2efe6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2efe6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;font-family:Helvetica,Arial,sans-serif;color:#07080f;">
<tr><td style="background:#07080f;color:#f2efe6;padding:20px 28px;font-weight:bold;letter-spacing:0.08em;font-size:14px;border-radius:8px 8px 0 0;">SPACE PIGEON</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr></table></td></tr></table></body></html>`;
}

function row(label, value) {
  return `<tr><td style="padding:8px 0;border-top:1px solid #e6e3da;color:#5c5f6b;font-size:13px;width:140px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;border-top:1px solid #e6e3da;font-size:15px;">${value}</td></tr>`;
}

function addressLines(a) {
  return [a.line1, a.line2, [a.city, a.region, a.postal].filter(Boolean).join(', '), a.country].filter(Boolean);
}

export function orderConfirmationEmail(order) {
  const product = PRODUCTS[order.product];
  const subject = `Order request received: ${product.name} (${order.reference})`;
  const address = addressLines(order.shipping_address);
  const total = product.priceCents === null ? null : product.priceCents * order.quantity;
  const html = layout('We have your order request', `
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(order.name)}, thanks for your order request. This is a request, not a purchase: nothing has been charged. We'll be in touch to confirm the details.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
${row('Reference', `<strong>${escapeHtml(order.reference)}</strong>`)}
${row('Product', escapeHtml(product.name))}
${row('Quantity', escapeHtml(order.quantity))}
${row('Price', escapeHtml(formatPrice(product.priceCents)) + (total !== null && order.quantity > 1 ? ` each (${escapeHtml(formatPrice(total))} total)` : ''))}
${row('Ship to', address.map(escapeHtml).join('<br>'))}
${order.notes ? row('Notes', escapeHtml(order.notes).replace(/\n/g, '<br>')) : ''}
</table>
<p style="margin:0;font-size:13px;color:#5c5f6b;line-height:1.6;">Questions? Reply to this email.</p>`);
  const text = [
    `Hi ${order.name}, thanks for your order request.`,
    `This is a request, not a purchase: nothing has been charged. We'll be in touch to confirm the details.`,
    '',
    `Reference: ${order.reference}`,
    `Product: ${product.name}`,
    `Quantity: ${order.quantity}`,
    `Price: ${formatPrice(product.priceCents)}${total !== null && order.quantity > 1 ? ` each (${formatPrice(total)} total)` : ''}`,
    `Ship to: ${address.join(', ')}`,
    order.notes ? `Notes: ${order.notes}` : null,
    '',
    'Questions? Reply to this email.',
  ].filter((l) => l !== null).join('\n');
  return { subject, html, text };
}

export function adminSignInEmail(link) {
  const subject = 'Your Space Pigeon admin sign-in link';
  const html = layout('Sign in to Space Pigeon admin', `
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Use this link within 15 minutes. If you didn't ask for it, you can ignore this email.</p>
<p style="margin:0 0 20px;"><a href="${escapeHtml(link)}" style="display:inline-block;background:#07080f;color:#f2efe6;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;">Open admin</a></p>`);
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
