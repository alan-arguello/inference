/* Formularios de AINosVemos: validación en línea, estado de envío y confirmación.
   Cada <form data-table="…"> guarda en esa tabla de Supabase (solo insertar,
   llave pública). Marcado que usa este archivo:
     [data-submit]     botón de envío
     [data-sent]       panel de confirmación (oculto hasta que se envía)
       [data-title]    título; usa data-new / data-dup según el caso
       [data-fill="x"] se llena con el valor del campo x (p. ej. correo)
   El campo "sitio" es una trampa para bots y nunca se envía. */
(function () {
  var SB_URL = 'https://vfenkhnmcetmkgxnpanr.supabase.co';
  var SB_KEY = 'sb_publishable_7IcpFdZIpxsLlgycyx-_-A_kWIwvicb';

  // Vercel Web Analytics: cola para eventos antes de que cargue el script.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  function track(name, data) {
    try { window.va('event', { name: name, data: data }); } catch (e) {}
    if (window.gtag) window.gtag('event', name, data);
  }

  var ICON_ALERT = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 5.75v5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>';

  // Mensajes por tipo de error, en el tono del sitio.
  function messageFor(input) {
    var v = input.validity;
    // data-name en cada campo: "tu nombre", "tu perfil de LinkedIn"…
    var label = input.getAttribute('data-name');
    if (v.valueMissing) return label ? 'Falta ' + label + '.' : 'Este campo es obligatorio.';
    if (input.type === 'email' && (v.typeMismatch || v.patternMismatch)) return 'Revisa el correo; debe verse como nombre@empresa.com.';
    if (input.type === 'tel' && v.patternMismatch) return 'Incluye el indicativo, por ejemplo +57 300 000 0000.';
    if (v.tooShort) return 'Escribe un poco más.';
    if (v.tooLong) return 'Es demasiado largo; resúmelo un poco.';
    return input.validationMessage || 'Revisa este campo.';
  }

  document.querySelectorAll('form[data-table]').forEach(function (form) {
    var table = form.getAttribute('data-table');
    var button = form.querySelector('[data-submit]');
    var done = form.querySelector('[data-sent]');
    var actions = form.querySelector('.inf-form__actions');
    if (!button) return;
    form.noValidate = true; // los mensajes los damos nosotros, junto a cada campo
    var label = button.innerHTML;
    var tried = false;

    // Banner de error general, encima del botón.
    var banner = document.createElement('div');
    banner.className = 'inf-form__alert';
    banner.setAttribute('role', 'alert');
    banner.hidden = true;
    actions.parentNode.insertBefore(banner, actions);
    function showBanner(text) {
      banner.innerHTML = ICON_ALERT + '<p></p>';
      banner.querySelector('p').textContent = text;
      banner.hidden = false;
    }

    var fields = Array.prototype.filter.call(form.querySelectorAll('.inf-input, .inf-textarea, .inf-select'), function (el) {
      return el.name && el.name !== 'sitio';
    });
    fields.forEach(function (input) {
      var box = input.closest('.inf-field');
      var msg = document.createElement('p');
      msg.className = 'inf-field__error';
      msg.id = input.id + '-error';
      msg.hidden = true;
      box.appendChild(msg);
      input.addEventListener('input', function () { if (tried) check(input); });
      input.addEventListener('blur', function () { if (tried && input.value) check(input); });
    });

    function check(input) {
      var msg = document.getElementById(input.id + '-error');
      var ok = input.checkValidity();
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      var described = (input.getAttribute('aria-describedby') || '').split(' ').filter(function (id) { return id && id !== msg.id; });
      if (!ok) { msg.textContent = messageFor(input); described.push(msg.id); }
      msg.hidden = ok;
      if (described.length) input.setAttribute('aria-describedby', described.join(' '));
      else input.removeAttribute('aria-describedby');
      return ok;
    }

    function setBusy(busy) {
      form.setAttribute('aria-busy', busy ? 'true' : 'false');
      fields.forEach(function (el) { el.readOnly = busy; });
      button.disabled = busy;
      button.innerHTML = busy ? '<span class="inf-spinner" aria-hidden="true"></span>Enviando…' : label;
    }

    function finish(duplicate, data) {
      if (!done) return;
      var title = done.querySelector('[data-title]');
      var first = (data.nombre || '').split(/\s+/)[0];
      if (title) {
        var base = title.getAttribute(duplicate ? 'data-dup' : 'data-new') || title.textContent;
        title.textContent = first ? base.replace(/\.$/, '') + ', ' + first + '.' : base;
      }
      done.querySelectorAll('[data-fill]').forEach(function (el) { el.textContent = data[el.getAttribute('data-fill')] || ''; });
      done.querySelectorAll('[data-dup-only]').forEach(function (el) { el.hidden = !duplicate; });
      done.querySelectorAll('[data-new-only]').forEach(function (el) { el.hidden = duplicate; });
      // El formulario se va; queda la confirmación en su lugar.
      Array.prototype.forEach.call(form.children, function (el) { if (el !== done) el.hidden = true; });
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      var top = form.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      done.focus({ preventScroll: true });
    }

    function submit() {
      tried = true;
      banner.hidden = true;
      var firstBad = null;
      fields.forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
      if (firstBad) {
        firstBad.focus();
        track('form_invalid', { form: table, field: firstBad.name });
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { v = String(v).trim(); if (k !== 'sitio') data[k] = v === '' ? null : v; });
      if (form.elements.sitio && form.elements.sitio.value) { finish(false, data); return; }
      var q = new URLSearchParams(location.search);
      data.pagina = location.pathname.slice(0, 300);
      data.referrer = document.referrer ? document.referrer.slice(0, 500) : null;
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { data[k] = q.get(k) ? q.get(k).slice(0, 120) : null; });

      setBusy(true);
      fetch(SB_URL + '/rest/v1/' + table, {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok || r.status === 409) {
          setBusy(false);
          finish(r.status === 409, data);
          track(r.status === 409 ? 'form_duplicate' : 'form_sent', { form: table });
          return;
        }
        return r.json().catch(function () { return {}; }).then(function (j) {
          setBusy(false);
          showBanner(j && j.code === '23514'
            ? 'Algún dato no tiene el formato correcto. Revisa los campos e intenta de nuevo.'
            : 'No pudimos enviar tu registro. Tus datos siguen aquí; intenta de nuevo en un momento.');
          track('form_error', { form: table, status: r.status });
        });
      }).catch(function () {
        setBusy(false);
        showBanner('No pudimos conectarnos. Revisa tu conexión; tus datos siguen aquí.');
        track('form_error', { form: table, status: 'network' });
      });
    }

    button.addEventListener('click', submit);
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
  });
})();
