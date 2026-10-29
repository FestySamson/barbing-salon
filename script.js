(() => {
  'use strict';
  /* ===== CONFIG: salon WhatsApp number, international format, digits only (no +, spaces or dashes) ===== */
  const WHATSAPP_NUMBER = '2348130809951'; // PLACEHOLDER - replace with the salon's real number
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wa = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  if (window.lucide) lucide.createIcons();
  $('#year').textContent = new Date().getFullYear();
  $('#waLink').href = $('#waFloat').href = wa('Hello, I would like to make an enquiry.');

  // Mobile menu + sticky nav
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  const setMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40 || menu.classList.contains('open'));
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Scroll reveal (content stays visible if JS/observer is unavailable)
  const rev = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    rev.forEach(el => io.observe(el));
  } else rev.forEach(el => el.classList.add('in'));

  // Lightbox
  const lb = $('#lb'), lbImg = $('img', lb);
  const closeLb = () => { lb.hidden = true; };
  $$('.gal button').forEach(b => b.addEventListener('click', () => { lbImg.src = b.dataset.full; lbImg.alt = $('img', b).alt; lb.hidden = false; $('#lbClose').focus(); }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); setMenu(false); } });

  // Booking form
  const form = $('#form'), type = $('#type'), service = $('#service'), addrWrap = $('#addrWrap'), address = $('#address'), date = $('#date'), time = $('#time'), status = $('#status');
  for (let h = 9; h <= 19; h++) ['00', '30'].forEach(m => { if (h === 19 && m === '30') return; const v = `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`; time.add(new Option(v, v)); });
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  date.min = iso(new Date());

  const syncType = () => {
    const home = type.value === 'Home service';
    addrWrap.hidden = !home; address.required = home; if (!home) { address.value = ''; clearErr(address); }
  };
  type.addEventListener('change', syncType);
  service.addEventListener('change', () => { if (service.value === 'Home Service') { type.value = 'Home service'; syncType(); } });

  // CTAs preselect service / type
  $$('[data-service]').forEach(a => a.addEventListener('click', () => {
    service.value = a.dataset.service;
    type.value = a.dataset.type || (a.dataset.service === 'Home Service' ? 'Home service' : type.value);
    syncType();
  }));

  const err = (el, msg) => { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'e-' + el.id); $('#e-' + el.id).textContent = msg; };
  function clearErr(el) { el.removeAttribute('aria-invalid'); const e = $('#e-' + el.id); if (e) e.textContent = ''; }
  $$('input,select,textarea', form).forEach(el => el.addEventListener('input', () => clearErr(el)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = id => $('#' + id);
    let bad = [];
    $$('input,select', form).forEach(el => clearErr(el));
    if (!f('name').value.trim()) bad.push([f('name'), 'Please enter your full name.']);
    if (!/^[+\d][\d\s().-]{6,}$/.test(f('phone').value.trim())) bad.push([f('phone'), 'Please enter a valid phone number.']);
    if (!service.value) bad.push([service, 'Please select a service.']);
    if (!type.value) bad.push([type, 'Please select an appointment type.']);
    if (!date.value) bad.push([date, 'Please choose a date.']);
    else if (date.value < iso(new Date())) bad.push([date, 'The date cannot be in the past.']);
    if (!time.value) bad.push([time, 'Please choose a time.']);
    if (type.value === 'Home service' && !address.value.trim()) bad.push([address, 'Please enter your address for home service.']);
    if (bad.length) { bad.forEach(([el, m]) => err(el, m)); bad[0][0].focus(); status.textContent = 'Please fix the highlighted fields.'; return; }

    const lines = ['Hello, I would like to book an appointment.', '',
      `Name: ${f('name').value.trim()}`, `Phone: ${f('phone').value.trim()}`, `Service: ${service.value}`,
      `Appointment Type: ${type.value}`, `Preferred Date: ${date.value}`, `Preferred Time: ${time.value}`];
    if (type.value === 'Home service') lines.push(`Address: ${address.value.trim()}`);
    if (f('notes').value.trim()) lines.push(`Additional Notes: ${f('notes').value.trim()}`);
    lines.push('', 'Please confirm availability and the total cost. Thank you.');
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
    status.textContent = 'WhatsApp should now be open. Your request is not confirmed until you send the message and the salon replies to confirm availability.';
  });

  // Product enquiries
  $$('[data-product]').forEach(b => b.addEventListener('click', () => window.open(wa(`Hello, I would like to enquire about: ${b.dataset.product}. Please share availability and price.`), '_blank', 'noopener')));
})();
