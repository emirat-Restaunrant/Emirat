/* Ресторан Emirat — слой данных.
   Данные сайта, заявки, фото и вход в админку хранятся на сервере sites-api (Cloudflare Worker + D1).
   Если сервер недоступен, сайт берёт данные из data/site.json (или последней сохранённой копии).
*/
window.Store = (function () {
  'use strict';

  var API = 'https://sites-api.tamerlankajrolla2.workers.dev', SITE = 'emirat';
  var LS_DATA = 'emirat_data', LS_TOK = 'emirat_token';

  function ls(k, v) {
    try {
      if (v === undefined) { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
      return v;
    } catch (e) { return null; }
  }
  var token = ls(LS_TOK) || null;
  function authed() { return !!(token && token.token && token.exp > Date.now()); }

  function req(path, opt) {
    opt = opt || {};
    var h = {};
    if (opt.type !== false) h['Content-Type'] = opt.type || 'application/json';
    if (opt.auth && authed()) h.Authorization = 'Bearer ' + token.token;
    var body = opt.body;
    if (body !== undefined && typeof body !== 'string' && !(body instanceof Blob)) body = JSON.stringify(body);
    return fetch(API + path + (path.indexOf('?') < 0 ? '?' : '&') + 'site=' + SITE, {
      method: opt.method || 'GET', headers: h, cache: 'no-store', body: body
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
        if (!r.ok) {
          var msg = (d && d.error) || ('HTTP ' + r.status);
          if (r.status === 401 && opt.auth) { logout(); msg = 'вход истёк, обновите страницу и войдите снова'; }
          if (r.status === 401 && !opt.auth) msg = 'неверный пароль';
          if (r.status === 413) msg = 'слишком большой файл';
          var e2 = new Error(msg); e2.status = r.status; throw e2;
        }
        return d;
      });
    });
  }

  function img(id) { return id ? (/^(https?:|data:|img\/)/.test(String(id)) ? String(id) : API + '/img?site=' + SITE + '&id=' + id) : ''; }

  function fromFile() {
    var p = location.pathname.replace(/[^/]*$/, '');
    return fetch(p + 'data/site.json?v=' + Date.now()).then(function (r) {
      if (!r.ok) throw new Error('site.json не найден');
      return r.json();
    });
  }

  function arr(x) { return Array.isArray(x) ? x : []; }
  function isObj(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function obj(x) { return isObj(x) ? x : {}; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var DEF_CATS = ['Холодные закуски', 'Салаты', 'Горячие блюда', 'Национальные блюда', 'Гарниры', 'Выпечка и десерты', 'Напитки'];
  var PER = ['fix', 'guest', 'pcs'];
  var DEF_MORE = [
    { n: 'Фаршированная горбуша', w: '1,5–2 кг', p: 20000 },
    { n: 'Курица по-грузински', w: '1–1,5 кг', p: 13000 },
    { n: 'Гусь, запечённый с яблоками и картофелем', w: '3–4,5 кг', p: 35000 },
    { n: 'Запечённая баранья ножка с хрустящей корочкой', w: '2–3,5 кг', p: 55000 },
    { n: 'Манты', w: '1 порция · 300 г', p: 3000 },
    { n: 'Судак в кисло-сладком соусе', w: '1,5–2 кг', p: 30000 }
  ];
  var DEF_MORE_NOTE = 'Блюда оплачиваются отдельно от корпоративного меню. Заказ у администратора ресторана.';
  /* новые разделы: блюда, банкетные меню, доп. услуги, объявление, вопросы.
     На сайте всё это выключено, пока администратор не включит переключатель в админке. */
  function normalizeExtra(d) {
    var ds = d.dishes = obj(d.dishes);
    ds.on = ds.on === true; ds.title = ds.title || 'Меню ресторана';
    ds.cats = arr(ds.cats).map(function (c) { return String(c == null ? '' : c); });
    if (!ds.cats.length) ds.cats = DEF_CATS.slice();
    ds.items = arr(ds.items).filter(isObj);
    ds.items.forEach(function (x) {
      x.id = x.id || uid(); x.n = x.n || ''; x.d = x.d || ''; x.w = x.w || ''; x.img = x.img || '';
      x.p = +x.p || 0; x.cat = x.cat == null ? ds.cats[0] : String(x.cat);
      x.hit = !!x.hit; x.off = !!x.off; x.add = !!x.add;
    });
    var bq = d.banquet = obj(d.banquet);
    bq.on = bq.on === true; bq.title = bq.title || 'Банкетное меню'; bq.lead = bq.lead || '';
    bq.packs = arr(bq.packs).filter(isObj);
    bq.packs.forEach(function (p) { p.id = p.id || uid(); p.n = p.n || ''; p.p = +p.p || 0; p.min = +p.min || 0; p.items = arr(p.items); p.note = p.note || ''; p.off = !!p.off; });
    var ex = d.extra = obj(d.extra); ex.on = ex.on === true;
    d.services = arr(d.services).filter(isObj);
    d.services.forEach(function (s) { s.id = s.id || uid(); s.n = s.n || ''; s.d = s.d || ''; s.p = +s.p || 0; if (PER.indexOf(s.per) < 0) s.per = 'fix'; s.off = !!s.off; });
    var nt = d.notice = obj(d.notice); nt.on = nt.on === true; nt.text = nt.text || ''; nt.link = nt.link || '';
    var fq = d.faq = obj(d.faq); fq.on = fq.on === true; fq.items = arr(fq.items).filter(isObj);
    fq.items.forEach(function (x) { x.q = x.q || ''; x.a = x.a || ''; });
  }
  function normalize(d) {
    d = d || {};
    var s = d.settings = d.settings || {};
    s.name = s.name || 'Ресторан Emirat';
    s.admin = s.admin || {}; s.phones = arr(s.phones);
    s.capacity = +s.capacity || 250; s.maxGuests = +s.maxGuests || 300;
    s.timeFrom = s.timeFrom || '10:00'; s.timeTo = s.timeTo || '22:00';
    s.credit = s.credit || {};
    var g = d.gift = d.gift || {}; g.on = g.on !== false; g.minGuests = +g.minGuests || 100; g.weekend = arr(g.weekend); g.noTypes = arr(g.noTypes);
    d.types = arr(d.types); if (!d.types.length) d.types = ['Той / свадьба', 'Юбилей', 'День рождения', 'Корпоратив', 'Другое'];
    var c = d.corp = d.corp || {}; c.on = c.on !== false; c.show = arr(c.show);
    c.variants = arr(c.variants).map(function (v) { v.price = +v.price || 0; v.snacks = arr(v.snacks); v.salads = arr(v.salads); v.hot = arr(v.hot); return v; });
    var mo = c.more = obj(c.more);
    if (!Array.isArray(mo.items)) mo.items = DEF_MORE.map(function (x) { return { n: x.n, w: x.w, p: x.p }; });
    mo.on = mo.on !== false; mo.title = mo.title || 'Дополнительные блюда';
    mo.note = typeof mo.note === 'string' ? mo.note : DEF_MORE_NOTE;
    mo.items = mo.items.filter(isObj).map(function (x) { return { n: String(x.n || ''), w: String(x.w || ''), p: +x.p || 0 }; });
    d.reviews = arr(d.reviews);
    d.photos = arr(d.photos).filter(function (p) { return p && p.img; });
    d.busy = arr(d.busy).filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x); });
    d.rev = +d.rev || 1;
    normalizeExtra(d);
    return d;
  }

  var cache = null;
  function load(force) {
    if (cache && !force) return Promise.resolve(cache);
    return req('/menu').then(function (r) {
      var d = r && r.data;
      if (d && d.settings) { ls(LS_DATA, d); return normalize(d); }
      return fromFile().then(normalize);
    }).catch(function () {
      var local = ls(LS_DATA);
      return local && local.settings ? normalize(local) : fromFile().then(normalize);
    }).then(function (d) { cache = d; return d; });
  }
  function save(d) {
    cache = normalize(d);
    return req('/menu', { method: 'PUT', auth: true, body: JSON.stringify(cache) }).then(function () { ls(LS_DATA, cache); return true; });
  }
  function reset() { return fromFile().then(normalize).then(function (d) { return save(d).then(function () { return cache; }); }); }

  function createOrder(o) { return req('/order', { method: 'POST', body: o }).then(function (r) { return r || true; }).catch(function () { return false; }); }
  function listOrders(limit) { return req('/orders?limit=' + (limit || 300), { auth: true }); }
  function tgInfo() { return req('/tg', { auth: true }); }
  function tgLink() { return req('/tg/link', { method: 'POST', auth: true, body: {} }); }
  function tgOff() { return req('/tg', { method: 'DELETE', auth: true }); }
  function setStatus(id, status) { return req('/order?id=' + encodeURIComponent(id), { method: 'PATCH', auth: true, body: { status: status } }); }

  function upload(blob) { return req('/img', { method: 'POST', auth: true, type: blob.type || 'image/jpeg', body: blob }).then(function (r) { return r.id; }); }
  function removeImg(id) { return req('/img?id=' + encodeURIComponent(id), { method: 'DELETE', auth: true }); }

  function login(pass) {
    return req('/login', { method: 'POST', body: { password: pass } }).then(function (d) {
      token = { token: d.token, exp: d.exp }; ls(LS_TOK, token); return token;
    });
  }
  function logout() { token = null; ls(LS_TOK, null); }
  function changePassword(pw) { return req('/password', { method: 'POST', auth: true, body: { password: pw } }); }

  return {
    load: load, save: save, reset: reset, fromFile: fromFile, normalize: normalize, img: img, uid: uid,
    createOrder: createOrder, listOrders: listOrders, setStatus: setStatus, tgInfo: tgInfo, tgLink: tgLink, tgOff: tgOff,
    upload: upload, removeImg: removeImg,
    login: login, logout: logout, authed: authed, changePassword: changePassword, api: API
  };
})();
