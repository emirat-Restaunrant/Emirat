/* Кнопка «Настройки» с пунктом «Хотите похожий сайт для бизнеса?».
   Подключение: <script src="sm.js" defer data-accent="#c9a14a" data-admin="admin.html"></script>
   Кнопка-триггер: любой элемент с атрибутом data-sm-open (если его нет — появится круглая кнопка в углу). */
(function () {
  'use strict';
  var me = document.currentScript || document.querySelector('script[src*="sm.js"]');
  var ACC = (me && me.dataset.accent) || '#1d4fc4';
  var ADMIN = me && me.dataset.admin;
  var DEV = '77476128411', DEV_SHOW = '8 747 612 84 11';

  var css = '.sm-gear{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:40px;min-width:40px;padding:0 12px;border-radius:99px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;flex:none;line-height:1}' +
    '.sm-gear svg{width:18px;height:18px;flex:none}' +
    '@media(max-width:700px){.sm-gear span{display:none}.sm-gear{padding:0;width:40px}}' +
    '.sm-fab{position:fixed;left:14px;bottom:calc(86px + env(safe-area-inset-bottom));width:46px;height:46px;padding:0;z-index:9990;background:rgba(255,255,255,.92);color:#111;box-shadow:0 6px 20px rgba(0,0,0,.18);backdrop-filter:blur(8px)}' +
    '.sm-wrap{position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,12,16,.55);opacity:0;pointer-events:none;transition:opacity .2s;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.sm-wrap.on{opacity:1;pointer-events:auto}' +
    '.sm-p{width:100%;max-width:460px;max-height:88vh;overflow:auto;background:#fff;color:#14161a;border-radius:24px 24px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom));transform:translateY(40px);transition:transform .25s;text-align:left}' +
    '.sm-wrap.on .sm-p{transform:none}' +
    '@media(min-width:700px){.sm-wrap{align-items:center}.sm-p{border-radius:24px}}' +
    '.sm-h{display:flex;align-items:center;justify-content:space-between;margin:0 2px 12px}' +
    '.sm-h b{font-size:21px;font-weight:800;color:#14161a}' +
    '.sm-x{width:38px;height:38px;border-radius:12px;border:0;background:#f1f2f5;color:#14161a;font-size:22px;line-height:1;cursor:pointer}' +
    '.sm-i{display:flex;align-items:center;gap:13px;width:100%;padding:13px;margin:0 0 8px;border-radius:16px;border:1px solid #e6e8ee;background:#fff;color:#14161a;text-decoration:none;text-align:left;font:inherit;cursor:pointer;box-sizing:border-box}' +
    '.sm-i:hover{border-color:' + ACC + '}' +
    '.sm-i i{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:20px;background:#f3f4f7}' +
    '.sm-i b{display:block;font-size:15.5px;font-weight:700;color:inherit}' +
    '.sm-i small{display:block;font-size:13px;line-height:1.35;color:#6b7180;margin-top:2px}' +
    '.sm-i.buy{background:#14161a;border-color:#14161a;color:#fff}' +
    '.sm-i.buy i{background:' + ACC + '}' +
    '.sm-i.buy small{color:#b9bfcc}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function siteName() { return String(document.title || '').split(/[—|·–-]/)[0].trim() || location.hostname; }
  function aboutEl() { return document.getElementById('about') || document.getElementById('o-nas') || document.querySelector('[id*="about"]'); }
  function waLink() { var a = document.querySelector('a[href*="wa.me/"]:not([href*="' + DEV + '"])'); return a ? a.href.split('?')[0] : ''; }

  var wrap = document.createElement('div');
  wrap.className = 'sm-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Настройки');
  document.body.appendChild(wrap);

  function open() {
    var ab = aboutEl(), wa = waLink();
    var buy = 'https://wa.me/' + DEV + '?text=' + encodeURIComponent('Здравствуйте! Видел сайт «' + siteName() + '» — хочу похожий сайт для своего бизнеса.');
    wrap.innerHTML = '<div class="sm-p"><div class="sm-h"><b>Настройки</b><button class="sm-x" type="button" data-sm-x aria-label="Закрыть">×</button></div>' +
      (ab ? '<button class="sm-i" type="button" data-sm-go><i>ℹ️</i><span><b>О нас</b><small>Кто мы и чем занимаемся</small></span></button>' : '') +
      (wa ? '<a class="sm-i" href="' + esc(wa) + '" target="_blank" rel="noopener"><i>💬</i><span><b>Связаться</b><small>Написать нам в WhatsApp</small></span></a>' : '') +
      '<a class="sm-i buy" href="' + esc(buy) + '" target="_blank" rel="noopener"><i>🛒</i><span><b>Хотите похожий сайт для бизнеса?</b><small>Сделаем такой же для вас. Пишите: ' + DEV_SHOW + '</small></span></a>' +
      (ADMIN ? '<a class="sm-i" href="' + esc(ADMIN) + '"><i>🔐</i><span><b>Админка</b><small>Вход для администратора</small></span></a>' : '') +
      '</div>';
    wrap.classList.add('on'); document.documentElement.style.overflow = 'hidden';
  }
  function close() { wrap.classList.remove('on'); document.documentElement.style.overflow = ''; }
  wrap.addEventListener('click', function (e) {
    if (e.target === wrap || e.target.closest('[data-sm-x]')) return close();
    if (e.target.closest('[data-sm-go]')) { close(); var ab = aboutEl(); if (ab) setTimeout(function () { ab.scrollIntoView({ behavior: 'smooth' }); }, 150); }
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function initTriggers() {
  var triggers = document.querySelectorAll('[data-sm-open]');
    if (!triggers.length) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'sm-gear sm-fab'; b.setAttribute('aria-label', 'Настройки'); b.setAttribute('data-sm-open', '');
      document.body.appendChild(b); triggers = [b];
    }
    [].forEach.call(triggers, function (t) {
      if (!t.innerHTML.trim()) { t.classList.add('sm-gear'); t.innerHTML = GEAR + '<span>Настройки</span>'; }
    });
  }
  if (document.readyState === 'complete') initTriggers(); else addEventListener('load', function () { setTimeout(initTriggers, 50); });
  /* делегирование: работает и для кнопок, которые сайт перерисовывает сам */
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-sm-open]'); if (t) { e.preventDefault(); open(); } });
  window.SiteMakerSettings = { open: open, close: close };
})();
