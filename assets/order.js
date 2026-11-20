// Order request dialog. "Place Order" / "Purchase" buttons carry data-order="SPH72|SPH42|PATCH".
(function () {
  var dialog = document.getElementById('order-dialog');
  if (!dialog) return;
  var form = document.getElementById('order-form');
  var done = document.getElementById('order-done');
  var errorBox = document.getElementById('order-error');
  var submit = document.getElementById('order-submit');
  var title = document.getElementById('order-title');
  var price = document.getElementById('order-price');
  var select = form.elements.product;
  var lastOpener = null;

  var LABELS = { SPH72: 'SPH72', SPH42: 'SPH42', PATCH: 'Official Pigeonnaut Patch' };
  var PRICES = { SPH72: 'COST: $246,000', SPH42: 'COST: $174,000', PATCH: '' };

  function showProduct(p) {
    title.textContent = LABELS[p] || 'Order request';
    price.textContent = PRICES[p] || '';
  }

  function open(product, opener) {
    lastOpener = opener || null;
    form.hidden = false;
    done.hidden = true;
    errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    if (LABELS[product]) select.value = product;
    showProduct(select.value);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    form.elements.name.focus();
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  dialog.addEventListener('close', function () {
    if (lastOpener) lastOpener.focus();
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) close();
  });
  dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  select.addEventListener('change', function () { showProduct(select.value); });

  document.querySelectorAll('[data-order]').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.getAttribute('data-order'), btn); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var f = form.elements;
    var body = {
      product: f.product.value,
      quantity: Number(f.quantity.value),
      name: f.name.value,
      email: f.email.value,
      address: {
        line1: f.line1.value,
        line2: f.line2.value,
        city: f.city.value,
        region: f.region.value,
        postal: f.postal.value,
        country: f.country.value,
      },
      notes: f.notes.value,
      company: f.company.value,
    };
    errorBox.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';
    fetch('/api/order-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok) {
          var fields = (r.data && r.data.fields) || {};
          Object.keys(fields).forEach(function (k) {
            var el = f[k.replace('address.', '')];
            if (el) el.setAttribute('aria-invalid', 'true');
          });
          var detail = Object.keys(fields).map(function (k) {
            var el = f[k.replace('address.', '')];
            var label = el && el.labels && el.labels[0] ? el.labels[0].textContent.replace(/\s*\(optional\)/, '') : k;
            return label + ' ' + fields[k];
          });
          errorBox.textContent = (r.data && r.data.error ? r.data.error : 'Something went wrong.') + (detail.length ? ' ' + detail.join('. ') + '.' : '');
          return;
        }
        document.getElementById('order-ref').textContent = r.data.reference;
        document.getElementById('order-email').textContent = body.email.trim();
        form.reset();
        form.hidden = true;
        done.hidden = false;
        done.querySelector('button').focus();
      })
      .catch(function () {
        errorBox.textContent = 'We couldn’t reach the server. Please check your connection and try again.';
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = 'Send order request';
      });
  });
})();
