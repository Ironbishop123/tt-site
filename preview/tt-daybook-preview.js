/* Tempered Tees, The Daybook 1.5.1, PREVIEW SHOWING build (Claude, 2026-11-22). Look only: no cart, no checkout, no request saving.
   Made from tt-daybook.js 1.5.1 by build_preview.py (exact-text changes). The page's data comes from preview-settings.js. */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var BAG = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  // colour dots in the pick step (Arthur's Nov 5 colour map). A colour with no value shows its name only.
  var DOTS = { black: '#141313', royal: '#175ac7', ash: '#f3f3f3' };
  // 1.0.6: the three launch colours always show on the Acquire page, even when one is unavailable (Arthur, Nov 18, item 14)
  var LOCKED = ['Black', 'Royal', 'Ash'];
  var MAIL = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/></svg>';
  var SLASH = '<svg class="ttd-slash" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#e0412f" stroke-width="2.2"/><path d="M5.3 18.7L18.7 5.3" stroke="#e0412f" stroke-width="2.2"/></svg>';
  // Kit signup form (brief: LIVE, recorded 2026-10-30). The House posts an email to it, like Kit's own forms.
  var KIT = 'https://app.kit.com/forms/10117707/subscriptions';
  // 1.2.0: the social accounts, shown in the Follow sheet
  var SOCIAL = { tiktok: 'https://www.tiktok.com/@temperedtees', instagram: 'https://www.instagram.com/temperedtees/', handle: 'temperedtees' };
  var OUT = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5"/></svg>';
  var CAL = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(cents) { var d = cents / 100; return '$' + (d % 1 ? d.toFixed(2) : String(d)); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  // Central time parts for "now", used for the day's close and for naming past days
  function central() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) { var n = new Date(); p = { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate(), hour: n.getHours(), minute: n.getMinutes(), second: n.getSeconds() }; }
    return { y: +p.year, m: +p.month, d: +p.day, left: 86400 - ((+p.hour % 24) * 3600 + (+p.minute) * 60 + (+p.second)) };
  }
  function dayNumber(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / 86400000); }
  function relName(iso) {
    var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!a) return 'Earlier';
    var c = central(), diff = dayNumber(c.y, c.m, c.d) - dayNumber(+a[1], +a[2], +a[3]);
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(+a[1], +a[2] - 1, +a[3])).getUTCDay()] + ' ' + (+a[3]);
    return MONTHS[+a[2] - 1].slice(0, 3) + ' ' + (+a[3]);
  }
  function isoNum(iso) { var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return a ? dayNumber(+a[1], +a[2], +a[3]) : null; }
  function todayNum() { var c = central(); return dayNumber(c.y, c.m, c.d); }
  function longDate(iso) { var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return a ? MONTHS[+a[2] - 1] + ' ' + (+a[3]) + ', ' + a[1] : ''; }
  function shortDate(iso) { var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return a ? MONTHS[+a[2] - 1].slice(0, 3) + ' ' + (+a[3]) : ''; }
  function keep(url, isWork, cfg) {
    if (!url || /^https?:/.test(url) && url.indexOf(location.origin) !== 0) return url;
    var hash = '', i = url.indexOf('#'); if (i >= 0) { hash = url.slice(i); url = url.slice(0, i); }
    var add = [], pv = /[?&]preview_theme_id=([^&#]+)/.exec(location.search);
    if (pv && url.indexOf('preview_theme_id=') < 0) add.push('preview_theme_id=' + pv[1]);
    if (isWork && cfg.view && url.indexOf('view=') < 0) add.push('view=' + encodeURIComponent(cfg.view));
    if (add.length) url += (url.indexOf('?') < 0 ? '?' : '&') + add.join('&');
    return url + hash;
  }
  // two strong colours from an image, for the room's light
  var palCache = {};
  function palette(src) {
    if (!src) return Promise.resolve(null);
    if (palCache[src]) return palCache[src];
    palCache[src] = new Promise(function (res) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        try {
          var w = 24, h = 32, c = document.createElement('canvas'); c.width = w; c.height = h;
          var x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
          var d = x.getImageData(0, 0, w, h).data, bins = {};
          for (var i = 0; i < d.length; i += 4) {
            var r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx - mn;
            if (mx < 60 || sat < 36) continue;
            var k = (r >> 6) + '-' + (g >> 6) + '-' + (b >> 6), o = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0, s: 0 });
            o.n++; o.r += r; o.g += g; o.b += b; o.s += sat;
          }
          var list = Object.keys(bins).map(function (k) { var o = bins[k]; return { w: o.n * (o.s / o.n), c: [Math.round(o.r / o.n), Math.round(o.g / o.n), Math.round(o.b / o.n)] }; })
            .sort(function (a, b) { return b.w - a.w; });
          res(list.length ? [list[0].c, (list[1] || list[0]).c] : null);
        } catch (e) { res(null); }
      };
      im.onerror = function () { res(null); };
      im.src = src;
    });
    return palCache[src];
  }
  function glowCss(p) {
    if (!p) return 'radial-gradient(110% 50% at 50% 26%, rgba(201,163,90,0.10), transparent 62%)';
    return 'radial-gradient(120% 55% at 50% 26%, rgba(' + p[0].join(',') + ',0.34), transparent 62%), radial-gradient(90% 45% at 85% 80%, rgba(' + p[1].join(',') + ',0.24), transparent 66%)';
  }

  function Daybook(root) {
    var raw = root.querySelector('[data-ttd-data]'); if (!raw) return;
    var D; try { D = JSON.parse(raw.textContent); } catch (e) { return; }
    var cfg = D.cfg || {}, today = D.today, workPage = D.work, archive = (D.archive || []).slice();
    var counts = {}, lastNew = null;
    // 1.0.7: ttd-req2 holds only the requests the Register saved. The old ttd-req ticks were never sent anywhere, so they are not read.
    var mine = store('ttd-req2') || {};
    var HAVE = false, FT = '', FT_AT = 0, reqIds = {};   // HAVE: the Register answered with real counts. FT: its form token.
    function reqOn() { return !!cfg.register && HAVE; }   // numbers, bars and the real send turn on by themselves once the Register answers
    // 1.0.6: the request number is a setting (CP-05), 10 for now. The Register's own number wins when it sends one.
    var THR = Math.max(1, Math.round(+cfg.threshold) || 10);
    var LIVE = !!cfg.regLive && !!cfg.register;   // the off switch for items 19 and 20: off until Arthur's Register is live
    var notified = store('ttd-notified') || {};   // which works this device asked to hear about. Never the email address.
    var viewed = store('ttd-viewed') || []; if (!Array.isArray(viewed)) viewed = [];
    var f0 = store('ttd-arch-filters') || {};
    var st = { day: 0, sort: 'close', month: '', year: null, artist: '', shown: 24, sheet: null, pick: false, sel: {}, opener: null, from: '', fReq: !!f0.req, fSeen: !!f0.seen };
    var isWork = !!workPage, workIsToday = isWork && today && workPage.h === today.h;
    var homeUrl = keep(cfg.home || '/', false, cfg);
    // ---- 1.2.0: Privacy, Terms, Contact and Follow are sheets too, with the same motion as The Archive (Paul, Nov 20).
    // The section prints the policy texts and Shopify's contact form once. A sheet with no content keeps its old plain link.
    var KIDS = { privacy: 1, terms: 1, contact: 1, follow: 1 };   // sheets that belong to The House
    var polTpl = {}; Array.prototype.forEach.call(root.querySelectorAll('template[data-ttd-policy]'), function (t) { polTpl[t.getAttribute('data-ttd-policy')] = t; });
    var contactSrc = root.querySelector('[data-ttd-contact]'), contactForm = contactSrc && contactSrc.querySelector('form');
    var HAS = { privacy: !isWork && !!polTpl.privacy, terms: !isWork && !!polTpl.terms, contact: !isWork && !!contactForm, follow: false };
    var OLD = { privacy: cfg.privacy, terms: cfg.terms, contact: cfg.contact, follow: SOCIAL.instagram };
    // a link that opens a sheet. Without the script, or with a new-tab click, it is still a normal link.
    function door(name, label, plain) {
      var u = plain || OLD[name]; if (!u) return '';
      return '<a href="' + esc(u) + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
    }

    function newest(a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : (+b.id || 0) - (+a.id || 0); }
    // 1.0.7: the number is the Register's own, and nothing else. This device's tap is never added on top.
    function countOf(w) { var c = counts[w.h]; return Math.min(THR, (c && +c.count) || 0); }
    // RG-1.5 return_status: none, queued, held, pending, booked. Shown only with the Register switch on.
    function statusOf(w) { var c = LIVE && w && counts[w.h]; return (c && c.return_status) || ''; }
    function thrWord(cap) { var w = THR === 10 ? 'ten' : String(THR); return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w; }
    // the "Coming back on" badge (item 20): only with the Register live, and only until the return day ends
    function backOf(w) {
      if (!LIVE || !w) return ''; var c = counts[w.h], d = c && (c.back || c.coming_back_on), n = isoNum(d);
      return n != null && n >= todayNum() ? d : '';
    }
    // short = on a small card: "Back Dec 4". The work's own page says it in full: "Coming back on December 4, 2026".
    function badge(w, short) {
      var d = backOf(w), s = statusOf(w);
      // 1.0.7: a return with no public date yet. pending = a date is reserved. held = the requests are under review.
      if (!d && s === 'pending') return '<span class="ttd-badge">' + (short ? 'Back soon' : 'Return date coming soon') + '</span>';
      if (!d && s === 'held' && !short) return '<span class="ttd-note">Requests for this work are under review.</span>';
      if (!d) return '';
      var txt = isoNum(d) === todayNum() ? 'Back today' : short ? 'Back ' + shortDate(d) : 'Coming back on ' + longDate(d);
      return '<span class="ttd-badge"' + (short && isoNum(d) !== todayNum() ? ' aria-label="Coming back on ' + esc(longDate(d)) + '"' : '') + '>' + esc(txt) + '</span>';
    }
    function seenWork(h) {
      if (!h) return; viewed = viewed.filter(function (x) { return x && x.h !== h; }); viewed.unshift({ h: h, at: Date.now() }); viewed = viewed.slice(0, 60); store('ttd-viewed', viewed);
    }
    function art(w, cls) { return w.img ? '<img src="' + esc(w.img) + '" alt="' + esc(w.t) + (w.a ? ' by ' + esc(w.a) : '') + '"' + (cls || '') + '>' : '<span class="ttd-noimg"></span>'; }
    function meta(w, extra) { return [w.y, extra].filter(Boolean).map(esc).join(' · '); }
    // the artist's name opens The Archive on that artist (Paul, 1.0.4). Plain text when The Archive has nothing by them.
    function hasWorks(name) { return isWork ? !workIsToday : archive.some(function (x) { return x.a === name; }); }
    function nameHtml(name) {
      return hasWorks(name) ? '<button type="button" class="ttd-name" data-by="' + esc(name) + '" aria-label="' + esc(name) + ', see their works in The Archive">' + esc(name) + '</button>' : '<span>' + esc(name) + '</span>';
    }
    function byline(w) { return w.a ? '<p class="ttd-by">by ' + nameHtml(w.a) + '</p>' : ''; }
    // 1.4.0: the Tomorrow page. Paul types tomorrow's artist in the theme editor. Blank, or the same name as today's artist
    // (a setting nobody changed after midnight), shows the covered frame and the line only, as before.
    function same(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
    var tmArtist = String(cfg.tmArtist || '').trim();
    if (tmArtist && today && same(tmArtist, today.a)) tmArtist = '';
    var tmAbout = tmArtist ? String(cfg.tmAbout || '').trim() : '';
    var tmLink = tmArtist && /^https:\/\/[^\s"'<>]+$/i.test(String(cfg.tmLink || '').trim()) ? String(cfg.tmLink).trim() : '';
    // 1.4.1: the calendar link is gone (Paul, Nov 21, 3:02 AM). In its place, the clock: the time left until 12:00 AM Central, large, in the middle
    // of the covered frame. It is the one thing to look at on this page (Paul, 3:05 AM). It shows only when tomorrow's artist is typed.
    var TM_DAY = todayNum() + 1;   // the Central day this Tomorrow page is for
    function two(n) { return (n < 10 ? '0' : '') + n; }
    function tmClockHtml() {
      return '<div class="ttd-tm-clock" data-tm-clock role="timer"><p class="ttd-cap ttd-tm-k">Unveils in</p>' +
        '<p class="ttd-tm-digits" aria-hidden="true"><span data-tm-h>00</span><i>:</i><span data-tm-m>00</span><i>:</i><span data-tm-s>00</span></p>' +
        '<span class="ttd-tm-beat" aria-hidden="true"></span><p class="ttd-tm-at">12:00 AM Central</p></div>';
    }
    function tmTick() {
      var n = root.querySelector('[data-tm-clock]'); if (!n) return;
      var c = central();
      if (dayNumber(c.y, c.m, c.d) >= TM_DAY) {   // midnight has passed on a page left open: the work is on show now
        if (!n.classList.contains('is-up')) {
          n.classList.add('is-up'); n.classList.remove('is-tock'); n.removeAttribute('role'); n.removeAttribute('aria-label');
          n.innerHTML = '<p class="ttd-cap ttd-tm-k">The cover is off</p><a class="ttd-ghost ttd-tm-go" href="' + esc(homeUrl) + '">See today\'s work</a>';
        }
        return;
      }
      var left = Math.max(0, c.left), h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
      var set = function (k, v) { var x = n.querySelector('[data-tm-' + k + ']'); if (x && x.textContent !== v) x.textContent = v; };
      set('h', two(h)); set('m', two(m)); set('s', two(s));
      var lab = 'Tomorrow\'s work unveils in ' + h + (h === 1 ? ' hour ' : ' hours ') + m + (m === 1 ? ' minute' : ' minutes');
      if (n.getAttribute('aria-label') !== lab) n.setAttribute('aria-label', lab);
      n.classList.toggle('is-tock', s % 2 === 1);   // the beat: a small gold weight swings once a second
    }
    function tomorrowPage() {
      var h = '<p class="ttd-cap ttd-cap-top">Tomorrow</p><div class="ttd-frame"><div class="ttd-cloth ttd-covered" role="img" aria-label="Tomorrow\'s work, under cover"></div>' + (tmArtist ? tmClockHtml() : '') + '</div>' +
        '<div class="ttd-col ttd-label"><p class="ttd-cap ttd-cap-col">Tomorrow</p>' + (cfg.tomorrow ? '<p class="ttd-ital">' + esc(cfg.tomorrow) + '</p>' : '');
      if (!tmArtist) return h + '</div>';
      return h + '</div>' +
        '<div class="ttd-col ttd-artist ttd-tm-artist"><p class="ttd-cap">Tomorrow\'s artist</p><h3>' + nameHtml(tmArtist) + '</h3>' +
        (tmAbout ? '<p class="ttd-meta ttd-statement">' + esc(tmAbout) + '</p>' : '') +
        (tmLink ? '<p class="ttd-tm-more"><a href="' + esc(tmLink) + '" target="_blank" rel="noopener noreferrer">See more from this artist<span class="ttd-tm-vh"> (opens a new tab)</span></a></p>' : '') + '</div>';
    }
    function artistCard(w) {
      if (!w.a && !w.s) return '';
      return '<div class="ttd-col ttd-artist"><p class="ttd-cap">The artist</p>' + (w.a ? '<h3>' + nameHtml(w.a) + '</h3>' : '') + (w.s ? '<p class="ttd-meta ttd-statement">' + esc(w.s) + '</p>' : '') + '</div>';
    }
    function segs(w) {
      var n = countOf(w), h = '<div class="ttd-segs" role="img" aria-label="' + n + ' of ' + THR + ' requests">';
      for (var i = 0; i < THR; i++) h += '<i class="' + (i < n ? 'is-on' : '') + (lastNew === w.h && i === n - 1 ? ' is-new' : '') + '"></i>';
      return h + '</div>';
    }
    // the request block. 'bar' = the fixed bar at the foot of a past day (counter left, button right)
    // 1.0.7: no number and no bars until the Register answers. "0 of 10" would claim a count that is not happening.
    function reqNum(w) { return reqOn() ? segs(w) + '<p class="ttd-p">' + countOf(w) + ' of ' + THR + ' requests</p>' : '<p class="ttd-p">Requests open soon.</p>'; }
    function reqBtn(w) {
      var on = reqOn(), s = statusOf(w), full = countOf(w) >= THR, off = on && (!!mine[w.h] || full || !!backOf(w) || s === 'pending');
      var label = !on ? 'Request a Showing' : backOf(w) ? 'Return date set' : s === 'pending' ? 'Return date coming soon' : mine[w.h] ? 'Your request is in' : full && s === 'queued' ? 'In line for a Return Showing' : 'Request a Showing';
      return '<button type="button" class="ttd-gold' + (off ? '' : ' ttd-sheen') + '" data-req="' + esc(w.h) + '"' + (off ? ' disabled' : '') + '>' + label + '</button>';
    }
    function reqBar(w) { return '<div class="ttd-reqc"><p class="ttd-p">Requests open with the first works.</p></div><button type="button" class="ttd-gold ttd-sheen" data-acquire="' + esc(w.h) + '">Opens soon</button>'; }
    function archiveBody(w) { return reqBar(w) + '<p class="ttd-fine">' + thrWord(true) + ' requests give a work a return date.</p>'; }
    function archivePage(w, cap) {
      return '<p class="ttd-cap ttd-cap-top">' + esc(cap) + '</p><div class="ttd-frame' + (w.img ? '' : ' is-empty') + '">' + art(w) + '</div>' +
        '<div class="ttd-col ttd-label"><p class="ttd-cap ttd-cap-col">' + esc(cap) + '</p><h2 class="ttd-title">' + esc(w.t) + '</h2>' + byline(w) +
        (cfg.lotClose ? '<p class="ttd-res">Lot closed</p> ' : '') + '<p class="ttd-res">Preview · In reserve</p><div data-badge="' + esc(w.h) + '">' + badge(w) + '</div>' +
        '<p class="ttd-fine">View only. ' + thrWord(true) + ' requests give it a return date.</p>' + notifyHtml(w) + '</div>' +
        artistCard(w) +
        '<div class="ttd-buy ttd-reqbar" data-count="' + esc(w.h) + '" data-mode="bar">' + reqBar(w) + '</div>';
    }
    // ---- 1.0.6: Notify (CP-01). Its own control, apart from Request. Hidden until the Register is live and a Notify address is set.
    var nId = 0;
    function notifyHtml(w) {
      if (!LIVE || !cfg.notify) return '';
      if (notified[w.h]) return '<div class="ttd-notify is-done" data-notify-box="' + esc(w.h) + '"><p class="ttd-fine">' + MAIL + '<span>We will email you when this work comes back.</span></p></div>';
      var id = 'ttd-n' + (++nId);
      return '<div class="ttd-notify" data-notify-box="' + esc(w.h) + '"><label class="ttd-notify-t"><input type="checkbox" data-notify-on="' + esc(w.h) + '" aria-controls="' + id + '">' + MAIL + '<span>Email me when this work comes back</span></label>' +
        '<form class="ttd-notify-f" id="' + id + '" data-notify-form="' + esc(w.h) + '" novalidate hidden><div class="ttd-kit-row"><label class="ttd-sr" for="' + id + 'e">Email</label>' +
        '<input id="' + id + 'e" type="email" name="email" required autocomplete="email" placeholder="Your email"><button type="submit" class="ttd-ghost">Notify me</button></div>' +
        '<p class="ttd-fine">One email when it gets a return date. One more the day before. Then you come off this list. ' + door('privacy', 'Privacy') + '</p>' +
        '<p class="ttd-err" role="alert" hidden></p></form></div>';
    }
    // ---- 1.0.6: Art you just missed (item 11): the works shown yesterday and the day before. Dates come from each work's
    // publish date for now (Paul, Nov 18). The Drops calendar replaces them once it is wired (CP-15).
    function missedList() {
      var t = todayNum(), out = [];
      [1, 2].forEach(function (k) { archive.filter(function (w) { return isoNum(w.d) === t - k; }).sort(newest).slice(0, 2).forEach(function (w) { out.push({ w: w, k: k }); }); });
      return out;
    }
    function missedHtml(where) {
      var l = missedList(); if (!l.length) return '';
      return '<div class="ttd-missed ttd-missed-' + where + '"><p class="ttd-cap">Earlier in the preview</p><div class="ttd-missed-row">' + l.map(function (o) {
        var w = o.w, a = /^(\d{4})-(\d{2})-(\d{2})/.exec(w.d), wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(+a[1], +a[2] - 1, +a[3])).getUTCDay()];
        return '<a class="ttd-mcard" href="' + esc(keep(w.u, true, cfg)) + '" data-work="' + esc(w.h) + '">' + art(w, ' loading="lazy" decoding="async"') +
          '<span class="ttd-mtx"><span class="ttd-mdate">' + (o.k === 1 ? 'Yesterday' : wd) + ' · ' + esc(shortDate(w.d)) + '</span><span class="ttd-tt">' + esc(w.t) + '</span>' +
          (w.a ? '<span class="ttd-ma">' + esc(w.a) + '</span>' : '') + '<span data-badge="' + esc(w.h) + '" data-short>' + badge(w, true) + '</span></span></a>';
      }).join('') + '</div></div>';
    }
    function todayPage(w) {
      var cap = 'Today · Preview';
      var seen = store('ttd-unveil') === w.h; store('ttd-unveil', w.h);
      return '<p class="ttd-cap ttd-cap-top">' + cap + '</p><div class="ttd-frame' + (w.img ? '' : ' is-empty') + '">' + art(w) +
        (seen || REDUCED ? '' : '<div class="ttd-cloth" data-unveil aria-hidden="true"></div>') + '</div>' +
        '<div class="ttd-col ttd-label"><p class="ttd-cap ttd-cap-col">' + cap + '</p><h1 class="ttd-title">' + esc(w.t) + '</h1>' + byline(w) +
        '<p class="ttd-ital">One day only. Back by request.</p><p class="ttd-res ttd-pv-tag">Preview</p>' +
        '<p class="ttd-fine ttd-pv-note">A preview of Tempered Tees. Public-domain art stands in until the first works open.</p></div>' +
        artistCard(w) + missedHtml('today') +
        '<div class="ttd-buy"><div><p class="ttd-price ttd-pv-price">Not for sale yet</p><p class="ttd-clock" data-clock></p></div>' +
        '<button type="button" class="ttd-gold ttd-sheen" data-acquire="' + esc(w.h) + '">Opens soon</button></div>';
    }

    // ---- the days ----
    var pages = [];
    if (isWork) {
      pages.push(workIsToday ? { kind: 'today', w: today, name: 'Today' } : { kind: 'past', w: workPage, name: 'The Archive' });
    } else {
      var seenDay = {}, lastDays = [];
      archive.slice().sort(newest).forEach(function (w) { if (!seenDay[w.d] && lastDays.length < 3) { seenDay[w.d] = 1; lastDays.push(w); } });
      lastDays.reverse().forEach(function (w) { pages.push({ kind: 'past', w: w, name: relName(w.d) }); });
      pages.push(today ? { kind: 'today', w: today, name: 'Today' } : { kind: 'soon', name: 'Today' });
      pages.push({ kind: 'next', name: 'Tomorrow' });
      st.day = pages.length - 2;
    }
    function pageHtml(p) {
      if (p.kind === 'today') return todayPage(p.w);
      if (p.kind === 'past') return archivePage(p.w, 'The Archive');   // 1.0.8 (item 19): no date here until a real "shown on" date exists
      if (p.kind === 'next') return tomorrowPage();   // 1.4.0
      return '<div class="ttd-col ttd-soon"><p class="ttd-big" style="text-align:center">First works coming soon.</p></div>';
    }
    function tab(label, key, cur) {
      if (isWork) return '<a class="ttd-tab" href="' + esc(key === 'today' ? homeUrl : keep((cfg.home || '/') + '#' + key, false, cfg)) + '">' + label + '</a>';
      return '<button type="button" class="ttd-tab" data-tab="' + key + '"' + (cur ? ' aria-current="true"' : '') + '>' + label + '</button>';
    }
    var tabsHtml = tab('Today', 'today', true) + tab('The Archive', 'archive') + tab('The House', 'house') + tab('Artists', 'artists');
    var loginAttr = cfg.login ? 'href="' + esc(cfg.login) + '"' : 'href="#artist-login" data-login';
    var shell =
      '<div class="ttd-glow" data-glow></div><div class="ttd-glow" data-glow></div><div class="ttd-smoke" aria-hidden="true"></div>' +
      '<header class="ttd-head"><a class="ttd-brand" href="' + esc(homeUrl) + '" aria-label="Tempered Tees, today\'s work"><img src="' + esc(cfg.mark) + '" alt="" width="34" height="34"><span>TEMPERED TEES</span></a>' +
      '<nav class="ttd-nav" aria-label="Sections">' + tabsHtml + '</nav>' +
      '<div class="ttd-head-r">' +
      // 1.3.0: the cart button opens the Cart sheet. On a work page, which has no sheets, it goes to the Daybook page and opens it there.
      '<button type="button" class="ttd-ghost ttd-pv-mail" data-acquire aria-label="Get the opening email">' + MAIL + '</button></div></header>' +
      (isWork
        ? '<nav class="ttd-strip" aria-label="Back"><a class="ttd-ghost" href="' + esc(homeUrl) + '">‹ Today</a><a class="ttd-ghost" href="' + esc(keep((cfg.home || '/') + '#archive', false, cfg)) + '">The Archive</a><button type="button" class="ttd-ghost ttd-x" data-close-work>Close</button></nav>'
        : '<nav class="ttd-strip" aria-label="Days">' + pages.map(function (p, i) { return '<button type="button" class="ttd-day" data-day="' + i + '">' + esc(p.name) + '</button>'; }).join('') +
          '<button type="button" class="ttd-ghost ttd-cal" data-tab="archive" aria-label="All days in The Archive">' + CAL + '</button></nav>') +
      '<main class="ttd-wrap"><div class="ttd-track">' + pages.map(function (p, i) {
        return '<section class="ttd-page' + (p.kind === 'today' || p.kind === 'past' ? ' has-buy' : '') + '" data-page="' + i + '" aria-label="' + esc(p.name) + '"><div class="ttd-scroll">' + pageHtml(p) + '</div></section>';
      }).join('') + '</div></main>' +
      '<nav class="ttd-tabs" aria-label="Sections">' + tabsHtml + '</nav>' +
      '<input type="text" name="website" class="ttd-hp" data-hp tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="ttd-shade" data-shade="sheet" aria-hidden="true"><div class="ttd-glow is-on"></div><div class="ttd-smoke"></div></div>' +
      '<section class="ttd-sheet" data-sheet="archive" role="dialog" aria-modal="true" aria-label="The Archive" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="house" role="dialog" aria-modal="true" aria-label="The House" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="artists" role="dialog" aria-modal="true" aria-label="Artists" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="privacy" role="dialog" aria-modal="true" aria-label="Privacy policy" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="terms" role="dialog" aria-modal="true" aria-label="Terms of service" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="contact" role="dialog" aria-modal="true" aria-label="Contact" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="follow" role="dialog" aria-modal="true" aria-label="Follow" tabindex="-1"></section>' +
      '<section class="ttd-sheet" data-sheet="cart" role="dialog" aria-modal="true" aria-label="Cart" tabindex="-1"></section>' +
      '<div class="ttd-shade" data-shade="acq" aria-hidden="true"><div class="ttd-glow is-on"></div><div class="ttd-smoke"></div></div>' +
      '<section class="ttd-acq" role="dialog" aria-modal="true" aria-label="Acquire this work" tabindex="-1"></section>';
    var fb = root.querySelector('.ttd-fallback');
    var holder = document.createElement('div'); holder.style.display = 'contents'; holder.innerHTML = shell; root.appendChild(holder);
    root.classList.add('is-live'); if (fb) fb.setAttribute('hidden', '');
    if (root.parentNode !== document.body) { /* stay in place: the section is the page */ }

    var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var track = $('.ttd-track'), glows = $$('[data-glow]'), glowOn = 0;

    function setGlow(w) {
      palette(w && w.img).then(function (p) {
        var next = glows[1 - glowOn]; next.style.background = glowCss(p);
        next.classList.add('is-on'); glows[glowOn].classList.remove('is-on'); glowOn = 1 - glowOn;
      });
    }
    function goDay(i, quiet) {
      st.day = Math.max(0, Math.min(pages.length - 1, i));
      track.style.transform = 'translateX(' + (-100 * st.day) + '%)';
      $$('.ttd-page').forEach(function (p, k) { if (k === st.day) p.removeAttribute('inert'); else p.setAttribute('inert', ''); });
      $$('.ttd-day').forEach(function (b, k) { b.setAttribute('aria-current', k === st.day ? 'true' : 'false'); });
      setGlow(pages[st.day].w);
      if (pages[st.day].kind === 'past' && !isWork) seenWork(pages[st.day].w.h);
      if (!quiet) { closeSheets(); mark(); }
    }

    // ---- the closing line, and "Lot closed" (1.0.9) ----
    // Switch off (the default): a fixed line. Nothing stops sales at midnight yet, so the page does not count down.
    // Switch on ("Sales stop at 11:59 PM Central"): a countdown. Once the Central day this page opened on is over, the clock reads
    // "Lot closed" and Acquire turns off. Turn it on only after the real end-of-day switch is tested.
    var LOT = !!cfg.lotClose, DAY0 = (function () { var c = central(); return dayNumber(c.y, c.m, c.d); })();
    function lotClosed() { if (!LOT) return false; var c = central(); return dayNumber(c.y, c.m, c.d) > DAY0; }
    function tick() {
      var t, shut = lotClosed();
      if (!LOT) t = 'On preview until 11:59 PM Central.';
      else if (shut) t = 'Lot closed';
      else { var left = central().left, h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60), sec = left % 60; t = 'Closes in ' + h + 'h ' + (m < 10 ? '0' : '') + m + 'm ' + (sec < 10 ? '0' : '') + sec + 's'; }
      $$('[data-clock]').forEach(function (n) { if (n.textContent !== t) n.textContent = t; });
      if (shut) {
        $$('[data-acquire]').forEach(function (n) { if (!n.disabled) { n.disabled = true; n.classList.remove('ttd-sheen'); n.textContent = 'Lot closed'; } });
        if (st.pick) closePick();
      }
    }
    tick(); if (LOT) setInterval(tick, 1000);
    if (tmArtist) {   // 1.4.1: the Tomorrow clock
      tmTick(); setInterval(tmTick, 1000);
      // a new artist's card has no button or link, so on a small screen a keyboard could not scroll to it. The page itself takes the focus.
      var tmScroll = root.querySelector('[data-tm-clock]'); tmScroll = tmScroll && tmScroll.closest('.ttd-scroll'); if (tmScroll) tmScroll.setAttribute('tabindex', '0');
    }

    // ---- sheets ----
    var behind = function () { return $$('.ttd-head, .ttd-strip, .ttd-wrap, .ttd-tabs'); };
    function openSheet(name, opener) {
      $$('.ttd-sheet').forEach(function (s) { if (s.dataset.sheet !== name) s.classList.remove('is-open'); });
      var sh = $('.ttd-sheet[data-sheet="' + name + '"]'); if (!sh || name === 'cart') return;
      if (name === 'archive') renderArchive(); if (name === 'house') renderHouse(); if (name === 'artists') renderArtists();
      if (KIDS[name]) { if (!HAS[name]) return; if (name === 'contact') renderContact(); else if (name === 'follow') renderFollow(); else renderPolicy(name); sh.scrollTop = 0; }
      else if (name === 'cart') { renderCart(); sh.scrollTop = 0; } else st.from = '';
      sh.classList.add('is-open'); root.classList.add('has-sheet'); st.sheet = name; if (opener) st.opener = opener;
      $$('.ttd-wrap, .ttd-strip').forEach(function (n) { n.setAttribute('inert', ''); });
      var tabNow = KIDS[name] ? 'house' : name;   // Privacy, Terms, Contact and Follow belong to The House
      $$('.ttd-tab').forEach(function (b) { if (b.dataset.tab) b.setAttribute('aria-current', b.dataset.tab === tabNow ? 'true' : 'false'); });
      var c = sh.querySelector('[data-close-sheet]'); (c || sh).focus({ preventScroll: true });
    }
    function closeSheets() {
      $$('.ttd-sheet').forEach(function (s) { s.classList.remove('is-open'); }); root.classList.remove('has-sheet'); st.sheet = null; st.from = '';
      $$('.ttd-wrap, .ttd-strip').forEach(function (n) { n.removeAttribute('inert'); });
      $$('.ttd-tab').forEach(function (b) { if (b.dataset.tab) b.setAttribute('aria-current', b.dataset.tab === 'today' ? 'true' : 'false'); });
      if (st.opener && document.contains(st.opener)) { try { st.opener.focus({ preventScroll: true }); } catch (e) {} } st.opener = null;
    }
    function head(title, back) { return '<div class="ttd-sheet-head"><h2 class="ttd-h2">' + title + '</h2><button type="button" class="ttd-ghost" data-close-sheet="' + (back || '') + '">' + (back ? 'Back' : 'Close') + '</button></div>'; }

    // 1.0.5: the Year choice. null = the opening year (this year, or the newest year with works). '' = all years.
    function defYear() {
      var ys = {}; archive.forEach(function (w) { if (w.d) ys[w.d.slice(0, 4)] = 1; });
      var cy = String(central().y); return ys[cy] ? cy : (Object.keys(ys).sort().pop() || '');
    }
    function yearNow() { return st.year == null ? defYear() : st.year; }
    function atStart() { return st.sort === 'close' && !st.month && !st.artist && yearNow() === defYear() && !st.fReq && !st.fSeen; }
    // 1.0.6: "Your requests" and "Recently viewed" (item 21). They narrow the list and keep its sort. Both can be on.
    // Kept on this device only: the saved requests (ttd-req2), a random visitor id (ttd-visitor), the works opened (ttd-viewed) and the two switches (ttd-arch-filters).
    function saveFilters() { store('ttd-arch-filters', { req: !!st.fReq, seen: !!st.fSeen }); }
    function seenMap() { var m = {}; viewed.forEach(function (x) { if (x && x.h) m[x.h] = 1; }); return m; }
    function filtered() {
      var yr = yearNow(), sm = st.fSeen ? seenMap() : null;
      var list = archive.filter(function (w) { return (!yr || (w.d || '').slice(0, 4) === yr) && (!st.month || (w.d || '').slice(0, 7) === st.month) && (!st.artist || w.a === st.artist) &&
        (!st.fReq || mine[w.h]) && (!sm || sm[w.h]); });
      var hasCounts = list.some(function (w) { return countOf(w) > 0; });
      list.sort(function (a, b) {
        if (st.sort === 'close' && hasCounts && reqOn()) { var d = countOf(b) - countOf(a); if (d) return d; }
        return st.sort === 'old' ? newest(b, a) : newest(a, b);
      });
      return list;
    }
    function tileHtml(w) {
      var n = countOf(w), on = reqOn();
      return '<a class="ttd-tile" href="' + esc(keep(w.u, true, cfg)) + '" data-work="' + esc(w.h) + '">' + art(w, ' loading="lazy" decoding="async"') +
        (on ? '<span class="ttd-bar"><b style="width:' + Math.round(n / THR * 100) + '%"></b></span>' : '') + '<span class="ttd-tt">' + esc(w.t) + '</span>' + (on ? '<span class="ttd-tc">' + n + ' of ' + THR + '</span>' : '') + '<span class="ttd-res">Preview · In reserve</span>' +
        '<span data-badge="' + esc(w.h) + '" data-short>' + badge(w, true) + '</span></a>';
    }
    function renderArchive() {
      var sh = $('.ttd-sheet[data-sheet="archive"]');
      if (!archive.length) { sh.innerHTML = head('The Archive') + '<p class="ttd-big">First works coming soon.</p>'; return; }
      var months = {}, artists = {}, years = {}, yr = yearNow();
      if (st.month && yr && st.month.slice(0, 4) !== yr) st.month = '';
      archive.forEach(function (w) { if (w.d) { years[w.d.slice(0, 4)] = 1; if (!yr || w.d.slice(0, 4) === yr) months[w.d.slice(0, 7)] = 1; } if (w.a) artists[w.a] = 1; });
      var yOpts = Object.keys(years).sort().reverse().map(function (k) { return '<option value="' + k + '"' + (yr === k ? ' selected' : '') + '>' + k + '</option>'; }).join('');
      var mOpts = Object.keys(months).sort().reverse().map(function (k) { return '<option value="' + k + '"' + (st.month === k ? ' selected' : '') + '>' + MONTHS[+k.slice(5) - 1] + (yr ? '' : ' ' + k.slice(0, 4)) + '</option>'; }).join('');
      var aOpts = Object.keys(artists).sort().map(function (k) { return '<option value="' + esc(k) + '"' + (st.artist === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('');
      var list = filtered(), shown = list.slice(0, st.shown);
      // 1.0.7: "Closest to N requests" shows only with real counts. Without them the list is Newest first.
      var sorts = [['close', 'Closest to ' + THR + ' requests'], ['new', 'Newest'], ['old', 'Oldest']], sortNow = st.sort;
      if (!reqOn()) { sorts.shift(); if (sortNow === 'close') sortNow = 'new'; }
      var CHK = '<svg class="ttd-chk" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
      var empty = !list.length ? '<p class="ttd-meta ttd-empty">' + (st.fReq && !Object.keys(mine).length ? 'You have not requested a showing yet.' : st.fSeen && !viewed.length ? 'You have not opened a work yet.' : 'No works match these choices.') + '</p>' : '';
      sh.innerHTML = head('The Archive') + (atStart() ? missedHtml('archive') : '') +
        '<p class="ttd-meta" role="status">' + list.length + (list.length === 1 ? ' work' : ' works') + ' · view only</p>' +
        '<div class="ttd-tools"><div class="ttd-controls" role="group" aria-label="Sort">' + sorts.map(function (o) { return '<button type="button" class="ttd-chip" data-sort="' + o[0] + '" aria-pressed="' + (sortNow === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>' +
        '<div class="ttd-selects"><label>Year<select data-year>' + yOpts + '<option value=""' + (yr ? '' : ' selected') + '>All years</option></select></label><label>Month<select data-month><option value="">All months</option>' + mOpts + '</select></label>' +
        '<label>Artist<select data-artist><option value="">All artists</option>' + aOpts + '</select></label>' +
        '<button type="button" class="ttd-ghost ttd-reset" data-reset' + (atStart() ? ' disabled' : '') + '>Reset</button></div>' +
        '<div class="ttd-mine" role="group" aria-label="Show only"><span class="ttd-mine-l">Show only</span>' +
        '<button type="button" class="ttd-chip ttd-filt" data-filt="seen" aria-pressed="' + st.fSeen + '">' + CHK + 'Recently viewed</button></div></div>' +
        empty + '<div class="ttd-grid">' + shown.map(tileHtml).join('') + '</div>' +
        '<p class="ttd-meta" style="text-align:center">Showing ' + shown.length + ' of ' + list.length + '</p>' +
        (shown.length < list.length ? '<button type="button" class="ttd-ghost ttd-more" data-more>Show 24 more</button>' : '');
    }
    // keep The Archive as it was: sort, filters, how many shown, and where the tapped tile sat on screen
    var backTo = null;
    function saveArchive(h) {
      var sh = $('.ttd-sheet[data-sheet="archive"]'), tile = h && $('.ttd-tile[data-work="' + h + '"]');
      var off = sh && tile ? tile.getBoundingClientRect().top - sh.getBoundingClientRect().top : 0;
      try { sessionStorage.setItem('ttd-arch', JSON.stringify({ sort: st.sort, month: st.month, year: st.year, artist: st.artist, shown: st.shown, h: h, off: off })); } catch (x) {}
    }
    function placeBack() {
      if (!backTo || st.sheet !== 'archive') return;
      var sh = $('.ttd-sheet[data-sheet="archive"]'), tile = backTo.h && $('.ttd-tile[data-work="' + backTo.h + '"]'); if (!tile) return;
      sh.scrollTop += tile.getBoundingClientRect().top - sh.getBoundingClientRect().top - (+backTo.off || 0);
      tile.focus({ preventScroll: true });
    }
    function restoreArchive() {
      var a = null; try { a = JSON.parse(sessionStorage.getItem('ttd-arch') || 'null'); sessionStorage.removeItem('ttd-arch'); } catch (x) {}
      if (a) { st.sort = a.sort || 'close'; st.month = a.month || ''; st.year = a.year == null ? null : a.year; st.artist = a.artist || ''; st.shown = Math.max(24, +a.shown || 24); }
      openSheet('archive');
      if (a && a.h) { backTo = a; placeBack(); setTimeout(function () { backTo = null; }, 6000); }
    }
    // The House (1.0.4, approved by Paul): how a day works, printing, the Kit signup. Facts from Arthur's brief only.
    function steps(list) { return '<ol class="ttd-steps">' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'; }
    // 1.5.0: the price line reads today's work, so it follows the store. With no work today it keeps the launch line.
    function priceLine() {
      if (!T || !T.vars || !T.vars.length) return '$26 in sizes S to XL.';
      var min = Math.min.apply(null, T.vars.map(function (x) { return x.p; }));
      if (si < 0) return money(min) + '.';
      var all = uniq(si), base = all.filter(function (s) { return T.vars.some(function (x) { return x.o[si] === s && x.p === min; }); });
      var span = function (l) { return l.length > 1 ? 'sizes ' + l[0] + ' to ' + l[l.length - 1] : 'size ' + l[0]; };
      if (base.length === all.length) return money(min) + ' in ' + span(all) + '.';
      return money(min) + ' in ' + span(base) + '. Sizes up to ' + all[all.length - 1] + ' cost a little more.';
    }
    function renderHouse() {
      $('.ttd-sheet[data-sheet="house"]').innerHTML = head('The House') +
        '<p class="ttd-big">' + esc(cfg.aboutHead || 'One day only. Back by request.') + '</p>' +
        (cfg.aboutBody ? '<p class="ttd-meta" style="max-width:60ch;white-space:pre-line">' + esc(cfg.aboutBody) + '</p>' : '') +
        '<div class="ttd-block"><p class="ttd-cap">How a day works</p>' + steps([
          'One artist\'s work at a time, on show for one day: 12:00 AM to 11:59 PM Central.',
          'On its day, you can acquire the work on a shirt.',
          'When the day ends, the work moves to The Archive. View only, no price.',
          thrWord(true) + ' requests give a work a return date, for a Return Showing.']) + '</div>' +
        '<div class="ttd-block"><p class="ttd-cap">Printing</p><p class="ttd-p">Printed to order on a heavy cotton tee, in Black, Royal and Ash.</p></div>' +
        '<div class="ttd-block"><p class="ttd-cap">This preview</p><p class="ttd-p">Nothing is for sale yet. The works shown are public-domain art from museum collections. They stand in until the first artists\' works open.</p></div>' +
        signupForm('ttd-kit-email', 'First works coming soon.') +
        '<div class="ttd-foot"><p>' + door('contact', 'Contact') + ' · <a href="' + esc(cfg.submit) + '">Submit your art</a></p>' +
        '<p>' + door('follow', 'Instagram', SOCIAL.instagram) + ' · ' + door('follow', 'TikTok', SOCIAL.tiktok) + ' @' + SOCIAL.handle + '</p></div>';
    }
    // ---- 1.3.0: the cart is a sheet (Paul, Nov 20). The lines, photos, prices and the checkout button are the cart page's own:
    // the script reads /cart once and shows the part marked data-ttd-cart-body. Minus, plus and Remove use Shopify's /cart/change.js,
    // then read /cart again. Checkout stays Shopify's own form. If /cart cannot be read, the visitor goes to the cart page.
    var cartHtml = null, cartBusy = null, cartUrl = keep(cfg.cartUrl || '/cart', false, cfg), EMPTY = '<p class="ttd-meta">Your cart is empty.</p>';
    function cartCount(n) {
      cfg.cart = n; $$('.ttd-head-r a').forEach(function (a) { a.setAttribute('aria-label', 'Cart, ' + n + ' items'); var sp = a.querySelector('span'); if (sp) sp.textContent = n; });
    }
    function loadCart() {
      return Promise.reject(new Error('preview'));   // preview: there is no cart
      if (cartBusy) return cartBusy;
      cartBusy = fetch(cartUrl, { credentials: 'same-origin', headers: { 'Accept': 'text/html' } }).then(function (r) { if (!r.ok) throw new Error('no'); return r.text(); }).then(function (html) {
        var b = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-ttd-cart-body]'); if (!b) throw new Error('no');
        cartHtml = b.innerHTML; var n = parseInt(b.getAttribute('data-count'), 10); if (isFinite(n)) cartCount(n); cartBusy = null; return cartHtml;
      }, function (e) { cartBusy = null; throw e; });
      return cartBusy;
    }
    function cartBody() { return cartHtml != null ? cartHtml : (+cfg.cart > 0 ? '<p class="ttd-meta" role="status">Reading your cart.</p>' : EMPTY); }
    function renderCart() {
      var sh = $('.ttd-sheet[data-sheet="cart"]');
      sh.innerHTML = head('Cart', st.from && st.from !== 'cart' ? st.from : '') + '<div class="ttd-cartsheet" data-cart-body>' + cartBody() + '</div>';
      if (cartHtml == null && +cfg.cart > 0) loadCart().then(function () { var c = sh.querySelector('[data-cart-body]'); if (c) c.innerHTML = cartBody(); }, function () { location.href = cartUrl; });
    }
    function changeLine(t) {
      return;   // preview: there is no cart
      var box = t.closest('[data-cart-body]'), lab = t.getAttribute('aria-label'); box.setAttribute('aria-busy', 'true');
      fetch('/cart/change.js', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ id: t.dataset.line, quantity: +t.dataset.qty }) })
        .then(function (r) { if (!r.ok) throw new Error('no'); cartHtml = null; return loadCart(); })
        .then(function () {
          box.innerHTML = cartBody(); box.removeAttribute('aria-busy');
          // the same control keeps the focus (One more, One fewer). After Remove, the next line's first control, or the sheet's button.
          var again = Array.prototype.filter.call(box.querySelectorAll('[data-line]'), function (x) { return x.getAttribute('aria-label') === lab; })[0] || box.querySelector('[data-line]') || $('.ttd-sheet[data-sheet="cart"] [data-close-sheet]'); if (again) again.focus({ preventScroll: true });
        }, function () { location.href = cartUrl; });
    }
    // ---- 1.2.0: the four House sheets. Each opens from the footer of The House with the same slide as The Archive.
    // Opened from The House, the button says Back and returns there. Opened any other way, it says Close.
    function kidHead(title) { return head(title, st.from === 'house' ? 'house' : ''); }
    // Privacy and Terms: Shopify's own policy text, read from the section. Nothing is fetched.
    function renderPolicy(name) {
      var sh = $('.ttd-sheet[data-sheet="' + name + '"]'), t = polTpl[name], title = t.getAttribute('data-title') || (name === 'privacy' ? 'Privacy policy' : 'Terms of service');
      sh.innerHTML = kidHead(esc(title)) + '<p class="ttd-cap">The House · Policies</p><div class="ttd-doc" data-doc></div>' +
        '<div class="ttd-foot"><p>' + (name === 'privacy' ? door('terms', 'Terms') : door('privacy', 'Privacy')) + ' · ' + door('contact', 'Contact') + '</p></div>';
      var doc = sh.querySelector('[data-doc]'); doc.appendChild(t.content.cloneNode(true));
      // links inside the policy: Contact opens its sheet; a link to another site opens a new tab
      Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
        var u = a.getAttribute('href') || '';
        if (HAS.contact && /\/pages\/contact\/?(\?|#|$)/.test(u)) a.setAttribute('data-open', 'contact');
        else if (/^https?:/.test(u) && u.indexOf(location.origin) !== 0) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      });
    }
    // Contact: Shopify's own form, moved into the sheet. Shopify sends the message and reloads this page.
    var posted = !!(contactSrc && contactSrc.querySelector('[data-ttd-posted]')), formErr = !!(contactSrc && contactSrc.querySelector('[data-ttd-form-err]'));
    function renderContact() {
      var sh = $('.ttd-sheet[data-sheet="contact"]'), f = contactForm;
      if (f && f.parentNode) f.parentNode.removeChild(f);   // keep the one real form, with what the visitor typed; the sheet is drawn again around it
      sh.innerHTML = kidHead('Contact') + '<p class="ttd-big">Write to us.</p>' +
        (posted ? '' : '<p class="ttd-meta">Ask about an order, a work, or your art.</p>') +
        '<div class="ttd-contact" data-contact-slot></div>' +
        '<div class="ttd-foot"><p>' + door('privacy', 'Privacy') + ' · ' + door('terms', 'Terms') + '</p></div>';
      if (f) sh.querySelector('[data-contact-slot]').appendChild(f);
    }
    // Follow: Instagram and TikTok in the Daybook's own look. Each panel holds that site's own preview card, in a frame.
    // No TikTok or Instagram script runs in this page: each card stays inside its own frame. The frames load only when this
    // sheet first opens. If a card does not load, the panel still has its name and its Follow button.
    // Tried on the real store on Nov 20, 2026: both cards load. Instagram's card tells the page its height. TikTok's has a set height in the stylesheet.
    var followDrawn = false, CARDS = { tiktok: { src: 'https://www.tiktok.com/embed/@' + SOCIAL.handle, host: /(^|\.)tiktok\.com$/ }, instagram: { src: SOCIAL.instagram + 'embed/', host: /(^|\.)instagram\.com$/ } };
    function renderFollow() {
      var sh = $('.ttd-sheet[data-sheet="follow"]');
      if (followDrawn) { var b = sh.querySelector('[data-close-sheet]'); if (b) { b.setAttribute('data-close-sheet', st.from === 'house' ? 'house' : ''); b.textContent = st.from === 'house' ? 'Back' : 'Close'; } return; }
      followDrawn = true;
      function panel(key, name, url) {
        return '<div class="ttd-fpanel" data-follow="' + key + '"><div class="ttd-fhead"><div><p class="ttd-cap">' + name + '</p><p class="ttd-fname">@' + SOCIAL.handle + '</p></div>' +
          '<a class="ttd-gold" href="' + url + '" target="_blank" rel="noopener" aria-label="Follow on ' + name + ', opens in a new tab">Follow ' + OUT + '</a></div>' +
          '<div class="ttd-fcard"><iframe data-card="' + key + '" src="' + CARDS[key].src + '" title="The latest from @' + SOCIAL.handle + ' on ' + name + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media"></iframe></div></div>';
      }
      sh.innerHTML = kidHead('Follow') + '<p class="ttd-big">Follow the house.</p>' +
        '<p class="ttd-meta">Tempered Tees on TikTok and Instagram.</p>' +
        '<div class="ttd-follow">' + panel('tiktok', 'TikTok', SOCIAL.tiktok) + panel('instagram', 'Instagram', SOCIAL.instagram) + '</div>' +
        '<p class="ttd-fine">The previews come from TikTok and Instagram. They load only when you open this sheet. ' + door('privacy', 'Privacy') + '</p>';
      // each card says how tall it is. Only a number from the card's own site and its own frame is used.
      window.addEventListener('message', function (e) {
        var host = ''; try { host = new URL(e.origin).hostname; } catch (x) { return; }
        Array.prototype.forEach.call(sh.querySelectorAll('iframe[data-card]'), function (f) {
          if (f.contentWindow !== e.source || !CARDS[f.getAttribute('data-card')].host.test(host)) return;
          var d = e.data; try { if (typeof d === 'string') d = JSON.parse(d); } catch (x) { return; }
          var hgt = d && (typeof d.height === 'number' ? d.height : d.details && d.details.height);
          if (typeof hgt === 'number' && hgt >= 120 && hgt <= 1600) f.style.height = Math.round(hgt) + 'px';
        });
      });
    }
    // artists already in The Archive, newest first; each name opens The Archive on them
    function artistRow() {
      var seen = {}, names = [];
      archive.slice().sort(newest).forEach(function (w) { if (w.a && !seen[w.a] && names.length < 12) { seen[w.a] = 1; names.push(w.a); } });
      if (!names.length) return '';
      return '<div class="ttd-block"><p class="ttd-cap">In this preview (public-domain art)</p><div class="ttd-controls">' +
        names.map(function (n) { return '<button type="button" class="ttd-chip" data-by="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div></div>';
    }
    // 1.1.0: the main Submit your art door carries the Acquire shimmer (Paul, Nov 19, 11:47 PM).
    // Artists: two doors. Submit your art first and biggest; Artist login below (Paul, Nov 17: the header button is retired)
    // 1.0.6: the login door opens a short note with its own Submit button until Arthur's portal has an address (item 10).
    // The payoff for the artist when buyers ask for a work back (item 8). The two email lines show only once the Register is live.
    // Top-selling artists at the foot (item 9): hidden until Paul turns it on after real sales.
    function renderArtists() {
      var noLogin = !cfg.login;
      var back = LIVE && cfg.notify ? [
          'Buyers in The Archive can request a Return Showing of your work. They can also ask for an email when it comes back.',
          thrWord(true) + ' requests give your work a return date. Everyone who asked gets an email right away.',
          'They get one more email the day before your Return Showing.',
          'Your work sells again for one more day, 12:00 AM to 11:59 PM Central.']
        : ['Buyers in The Archive can request a Return Showing of your work.',
          thrWord(true) + ' requests give your work a return date.',
          'Your work sells again for one more day, 12:00 AM to 11:59 PM Central.'];
      var top = (cfg.top || []).filter(Boolean).slice(0, 6);
      $('.ttd-sheet[data-sheet="artists"]').innerHTML = head('Artists') +
        '<p class="ttd-big">Earn money for your art. Worn on the street.</p>' +
        '<p class="ttd-meta">US artists 18+. Original work you own. No AI art.</p>' +
        (cfg.founding ? '<p class="ttd-p ttd-pv-found">' + esc(cfg.founding) + '</p>' : '') +
        '<div class="ttd-doors">' + '<a class="ttd-gold ttd-sheen ttd-door-main" href="' + esc(cfg.submit) + '">Submit your art</a>' +
        '<div class="ttd-door"><a class="ttd-ghost" ' + loginAttr + (noLogin ? ' aria-expanded="false" aria-controls="ttd-login-note"' : '') + '>Artist login</a>' +
        (noLogin ? '<div class="ttd-login-note" id="ttd-login-note" hidden><p class="ttd-p">Artist login opens soon.</p><p class="ttd-meta">New here? Start with your art.</p>' +
          '<a class="ttd-gold" href="' + esc(cfg.submit) + '">Submit your art</a></div>' : '') + '</div></div>' +
        '<div class="ttd-block"><p class="ttd-cap">How it works</p>' + steps([
          'Submit your art on our form.',
          'We review every submission by hand.',
          'Approved work gets its own day on display, 12:00 AM to 11:59 PM Central.',
          'Then it joins The Archive. ' + thrWord(true) + ' requests give it a return date.']) + '</div>' +
        '<div class="ttd-block"><p class="ttd-cap">When buyers ask for it back</p>' + steps(back) + '</div>' +
        artistRow() +
        (top.length ? '<div class="ttd-block ttd-top"><p class="ttd-cap">Top-selling artists</p><div class="ttd-controls">' + top.map(function (n) {
          return hasWorks(n) ? '<button type="button" class="ttd-chip" data-by="' + esc(n) + '">' + esc(n) + '</button>' : '<span class="ttd-chip ttd-chip-plain">' + esc(n) + '</span>'; }).join('') + '</div></div>' : '');
    }
    // ---- 1.0.5: Back steps. Every sheet, every Archive choice and the pick step is one step in the browser's history,
    // so Back returns to the screen the visitor just left (Paul, Nov 18).
    function snap() { return { ttd: 1, day: st.day, sheet: st.sheet, from: st.from || '', pick: !!st.pick, doc: st.pick ? (st.doc || '') : '', sort: st.sort, month: st.month, year: st.year, artist: st.artist, shown: st.shown, fReq: !!st.fReq, fSeen: !!st.fSeen }; }
    function addr() { return location.pathname + location.search + (st.sheet ? '#' + st.sheet : ''); }
    function mark() { try { history.replaceState(snap(), '', addr()); } catch (x) {} }
    function step() {
      var a = snap(), b = null; try { b = history.state; } catch (x) {}
      if (b && b.ttd) { var c = {}; for (var k in a) c[k] = b[k]; a.shown = c.shown = 0; if (JSON.stringify(a) === JSON.stringify(c)) return mark(); }
      try { history.pushState(snap(), '', addr()); } catch (x) {}
    }
    function apply(s) {
      s = s && s.ttd ? s : { sheet: null };
      if (!isWork) {
        if (s.day != null && +s.day !== st.day && pages[+s.day]) goDay(+s.day, true);
        st.sort = s.sort || 'close'; st.month = s.month || ''; st.year = s.year == null ? null : s.year; st.artist = s.artist || ''; st.shown = Math.max(24, +s.shown || 24);
        if (s.fReq != null) { st.fReq = !!s.fReq; st.fSeen = !!s.fSeen; saveFilters(); }
        if (s.sheet) { st.from = (KIDS[s.sheet] || s.sheet === 'cart') ? (s.from || '') : ''; openSheet(s.sheet); } else if (st.sheet) closeSheets();
      }
      if (s.pick && !st.pick) openPick(); else if (!s.pick && st.pick) closePick();
      if (st.pick && (s.doc || '') !== (st.doc || '')) { if (s.doc && polTpl[s.doc]) openPol(s.doc); else closePol(); }
    }
    window.addEventListener('popstate', function (e) { apply(e.state); });
    function refreshCounts() {
      $$('[data-count]').forEach(function (n) {
        var h = n.dataset.count, w = archive.filter(function (x) { return x.h === h; })[0] || (workPage && workPage.h === h ? workPage : null);
        if (w) n.innerHTML = n.dataset.mode === 'bar' ? reqBar(w) : archiveBody(w);
      });
      $$('[data-badge]').forEach(function (n) {
        var h = n.dataset.badge, w = archive.filter(function (x) { return x.h === h; })[0] || (workPage && workPage.h === h ? workPage : null);
        if (w) n.innerHTML = badge(w, n.hasAttribute('data-short'));
      });
      if (st.sheet === 'archive') { renderArchive(); placeBack(); }
    }

    // ---- the Acquire page (1.0.6, Arthur's item 14): one full page. A large shirt photo with the art, the colours, the sizes,
    // then a button straight to Shopify checkout. No side panel. It replaces the 1.0.5 pick step.
    var pick = $('.ttd-acq'), T = today;
    var ci = -1, si = -1;
    if (T) (T.opts || []).forEach(function (n, i) { if (/colou?r/i.test(n)) ci = i; else if (/size/i.test(n)) si = i; });
    function uniq(i) { var out = []; T.vars.forEach(function (v) { if (out.indexOf(v.o[i]) < 0) out.push(v.o[i]); }); return out; }
    // a product with no Colour option (TEST01) is the colour in its photo's name, Black when the name says none
    var fixedC = null;
    if (T && ci < 0) { var fm = /(black|royal|ash)/i.exec(T.mock || ''); fixedC = fm ? fm[1].charAt(0).toUpperCase() + fm[1].slice(1).toLowerCase() : 'Black'; }
    // Black, Royal and Ash always show, in that order. Any other colour the product has follows. A colour is available
    // when at least one of its sizes can be bought.
    function colours() {
      if (!T) return [];
      var have = ci >= 0 ? uniq(ci) : [fixedC], low = function (x) { return String(x).toLowerCase(); };
      var list = LOCKED.map(function (c) { var m = have.filter(function (x) { return low(x) === low(c); })[0]; return { name: m || c, real: !!m }; });
      have.forEach(function (x) { if (!LOCKED.some(function (c) { return low(c) === low(x); })) list.push({ name: x, real: true }); });
      list.forEach(function (o) { o.ok = o.real && (ci < 0 ? T.vars.some(function (v) { return v.ok; }) : T.vars.some(function (v) { return v.o[ci] === o.name && v.ok; })); });
      return list;
    }
    function chosen() {
      return T.vars.filter(function (v) { return (ci < 0 || v.o[ci] === st.sel.c) && (si < 0 || v.o[si] === st.sel.s); })[0] || null;
    }
    // the photo: the chosen size's own photo, then the colour's front photo, then any photo of that colour, then the front photo
    function photoFor(v) {
      var cv = T.vars.filter(function (x) { return ci < 0 || x.o[ci] === st.sel.c; });
      return (v && v.img) || (ci >= 0 && T.cimg && T.cimg[st.sel.c]) || (cv.filter(function (x) { return x.img; })[0] || {}).img || T.mock;
    }
    // 1.5.0: the size chart. One row a line in the setting: size, width, length. Only sizes this work has are shown.
    function chartRows() {
      if (!cfg.chart || si < 0) return [];
      var have = uniq(si).map(function (s) { return String(s).toLowerCase(); });
      return String(cfg.chart).split(/\n+/).map(function (l) { return l.split(/[,\t]+/).map(function (x) { return x.trim(); }); })
        .filter(function (r) { return r.length >= 3 && r[0] && have.indexOf(r[0].toLowerCase()) >= 0; });
    }
    // 1.5.1: a policy opened from the Acquire page shows inside it. Back returns to the shirt, with the colour and size kept. Nothing is fetched.
    function renderPol() {
      var t = polTpl[st.doc], title = t.getAttribute('data-title') || (st.doc === 'refund' ? 'Refund policy' : 'Shipping policy');
      pick.innerHTML = '<div class="ttd-acq-bar"><button type="button" class="ttd-ghost" data-pol-back>‹ Back</button><p class="ttd-cap">' + esc(title) + '</p>' +
        '<button type="button" class="ttd-ghost ttd-x" data-close-pick aria-label="Close">Close</button></div><div class="ttd-acq-pol"><div class="ttd-doc" data-doc></div></div>';
      var doc = pick.querySelector('[data-doc]'); doc.appendChild(t.content.cloneNode(true));
      Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) { var u = a.getAttribute('href') || ''; if (/^https?:/.test(u) && u.indexOf(location.origin) !== 0) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } });
    }
    function openPol(name) { if (!polTpl[name]) return; st.polTop = pick.scrollTop; st.doc = name; renderPick(); pick.scrollTop = 0; pick.querySelector('[data-pol-back]').focus({ preventScroll: true }); }
    function closePol() { var was = st.doc; if (!was) return; st.doc = ''; renderPick(); pick.scrollTop = st.polTop || 0; var l = pick.querySelector('[data-pol="' + was + '"]'); if (l) l.focus({ preventScroll: true }); }
    function signupForm(id, cap) {
      var u = cfg.signup || '';
      return '<form class="ttd-block ttd-kit"' + (u ? ' action="' + esc(u) + '" method="post" target="_blank"' : ' data-nosend') + '><p class="ttd-cap">' + cap + '</p>' +
        '<div class="ttd-kit-row"><label class="ttd-sr" for="' + id + '">Email</label><input id="' + id + '" type="email" name="email_address" required autocomplete="email" placeholder="Your email">' +
        '<button type="submit" class="ttd-ghost"' + (u ? '' : ' disabled') + '>Tell me when the first work opens</button></div>' +
        '<p class="ttd-fine">' + (u ? 'We\'ll only email you about the launch. Unsubscribe anytime.' : 'Signup opens soon.') + '</p></form>';
    }
    function renderPick() {
      var w = st.pw || workPage || today;
      pick.innerHTML = '<div class="ttd-acq-bar"><button type="button" class="ttd-ghost" data-close-pick>‹ Back to the art</button><p class="ttd-cap">Opens soon</p>' +
        '<button type="button" class="ttd-ghost ttd-x" data-close-pick aria-label="Close">Close</button></div>' +
        '<div class="ttd-acq-body ttd-pv-body"><div class="ttd-acq-photo ttd-pv-art">' + (w && w.img ? '<img src="' + esc(w.img) + '" alt="' + esc(w.t) + (w.a ? ' by ' + esc(w.a) : '') + '">' : '<span class="ttd-noimg"></span>') + '</div>' +
        '<div class="ttd-acq-opts"><div class="ttd-acq-head">' + (w ? '<h2 class="ttd-title">' + esc(w.t) + '</h2>' + (w.a ? '<p class="ttd-by"><span>by ' + esc(w.a) + '</span></p>' : '') : '') +
        '<p class="ttd-res">Preview</p></div>' +
        '<p class="ttd-big ttd-pv-big">Nothing is for sale yet.</p>' +
        '<p class="ttd-p">Tempered Tees opens soon. Each day, one artist\'s work goes on show. On its day, you can acquire it on a shirt.</p>' +
        '<p class="ttd-p">This work is public-domain art. It stands in until the first works open.</p>' +
        signupForm('ttd-pv-email', 'Get the opening email') + '</div></div>';
    }
    function renderPickOld(err) {
      if (st.doc && polTpl[st.doc]) return renderPol();
      var v = (si < 0 || st.sel.s) ? chosen() : null, photo = photoFor(v), cl = colours();
      var min = Math.min.apply(null, T.vars.map(function (x) { return x.p; }));
      var go = v && v.ok;
      var h = '<div class="ttd-acq-bar"><button type="button" class="ttd-ghost" data-close-pick>‹ Back to the art</button><p class="ttd-cap">Acquire this work</p>' +
        '<button type="button" class="ttd-ghost ttd-x" data-close-pick aria-label="Close">Close</button></div>' +
        '<div class="ttd-acq-body"><div class="ttd-acq-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="The shirt with ' + esc(T.t) + (st.sel.c ? ', in ' + esc(st.sel.c) : '') + '">' : '<span class="ttd-noimg"></span>') + '</div>' +
        '<div class="ttd-acq-opts"><div class="ttd-acq-head"><h2 class="ttd-title">' + esc(T.t) + '</h2>' + (T.a ? '<p class="ttd-by"><span>by ' + esc(T.a) + '</span></p>' : '') +
        '<p class="ttd-price" aria-live="polite">' + money(v ? v.p : min) + '</p><p class="ttd-fine">Printed to order. Shipping is shown at checkout. <a href="' + esc(cfg.shipping || '/policies/shipping-policy') + '"' + (polTpl.shipping ? ' data-pol="shipping"' : '') + '>Shipping policy</a>' + (cfg.refund ? ' · <a href="' + esc(cfg.refund) + '"' + (polTpl.refund ? ' data-pol="refund"' : '') + '>Returns</a>' : '') + '</p>' +
        (cfg.fit || cfg.delivery ? '<p class="ttd-fine ttd-fit">' + esc([cfg.fit, cfg.delivery].filter(Boolean).join(' ')) + '</p>' : '') + '</div>';
      h += '<div class="ttd-acq-g"><p class="ttd-cap">Color' + (st.sel.c ? ': <span class="ttd-cv">' + esc(st.sel.c) + '</span>' : '') + '</p><div class="ttd-swatches" role="group" aria-label="Color">' + cl.map(function (o) {
        var dot = '<span class="ttd-sdot" style="background:' + (DOTS[String(o.name).toLowerCase()] || '#6b645a') + '" aria-hidden="true"></span>';
        if (!o.ok) return '<span class="ttd-sw is-off" role="button" aria-disabled="true" aria-label="' + esc(o.name) + ', unavailable"><span class="ttd-sring">' + dot + SLASH + '</span><span class="ttd-sn">' + esc(o.name) + '</span></span>';
        return '<button type="button" class="ttd-sw" data-c="' + esc(o.name) + '" aria-pressed="' + (st.sel.c === o.name) + '"' + (ci < 0 ? ' aria-label="' + esc(o.name) + ', the only colour for this work"' : '') + '><span class="ttd-sring">' + dot + '</span><span class="ttd-sn">' + esc(o.name) + '</span></button>';
      }).join('') + '</div></div>';
      var rows = chartRows();
      if (si >= 0) h += '<div class="ttd-acq-g"><div class="ttd-size-h"><p class="ttd-cap">Size</p>' + (rows.length ? '<button type="button" class="ttd-chart-btn" data-chart aria-expanded="' + !!st.chart + '" aria-controls="ttd-chart">Size chart</button>' : '') + '</div>' +
        '<div class="ttd-opts" role="group" aria-label="Size">' + uniq(si).map(function (s) {
        var m = T.vars.filter(function (x) { return x.o[si] === s && (ci < 0 || x.o[ci] === st.sel.c); })[0], ok = m && m.ok, up = m ? m.p - min : 0;
        return '<button type="button" class="ttd-opt" data-s="' + esc(s) + '" aria-pressed="' + (st.sel.s === s) + '"' + (ok ? '' : ' disabled') + '>' + esc(s) + (up > 0 ? ' +' + money(up) : '') + '</button>'; }).join('') + '</div>' +
        (rows.length ? '<div class="ttd-chart" id="ttd-chart"' + (st.chart ? '' : ' hidden') + '><table><caption>The shirt laid flat, in inches. A shirt can differ by up to 1.5 inches.</caption><thead><tr><th scope="col">Size</th><th scope="col">Width</th><th scope="col">Length</th></tr></thead><tbody>' +
          rows.map(function (r) { return '<tr' + (st.sel.s === r[0] ? ' class="is-sel"' : '') + '><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') + '</div>';
      h += (err ? '<p class="ttd-err" role="alert">' + esc(err) + '</p>' : '') +
        '<div class="ttd-acq-go"><button type="button" class="ttd-gold' + (go ? ' ttd-sheen' : '') + '" data-checkout' + (go ? '' : ' disabled') + '>' + (v ? (v.ok ? 'Checkout · ' + money(v.p) : 'Not available in this size') : 'Choose a size') + '</button>' +
        '<button type="button" class="ttd-ghost" data-add' + (go ? '' : ' disabled') + '>Add to cart</button></div></div></div>';
      pick.innerHTML = h;
    }
    function openPick(opener) {
      var ph = opener && opener.getAttribute ? opener.getAttribute('data-acquire') : '';
      st.pw = (ph && ((today && today.h === ph && today) || findWork(ph))) || workPage || today || archive[0] || null;
      st.doc = ''; renderPick(); pick.classList.add('is-open'); root.classList.add('is-acq'); st.pick = true; st.pickOpener = opener;
      $$('.ttd-strip, .ttd-wrap, .ttd-tabs').forEach(function (n) { n.setAttribute('inert', ''); });
      pick.scrollTop = 0; pick.querySelector('[data-close-pick]').focus({ preventScroll: true });
    }
    function openPickOld(opener) {
      if (!T || !T.vars.length) return;
      if (!st.sel.c) { var ok = colours().filter(function (o) { return o.ok; })[0]; st.sel.c = ok ? ok.name : (ci >= 0 ? T.vars[0].o[ci] : fixedC); }
      if (lotClosed()) return;
      st.doc = ''; renderPick(); pick.classList.add('is-open'); root.classList.add('is-acq'); st.pick = true; st.pickOpener = opener;
      // 1.5.1: the header stays in view and in use above the Acquire page, as it does above a sheet (Paul, Nov 21)
      $$('.ttd-strip, .ttd-wrap, .ttd-tabs').forEach(function (n) { n.setAttribute('inert', ''); });
      pick.scrollTop = 0; pick.querySelector('[data-close-pick]').focus({ preventScroll: true });
    }
    function closePick() {
      pick.classList.remove('is-open'); root.classList.remove('is-acq'); st.pick = false; st.doc = '';
      $$('.ttd-head, .ttd-tabs').forEach(function (n) { n.removeAttribute('inert'); });
      if (!st.sheet) $$('.ttd-wrap, .ttd-strip').forEach(function (n) { n.removeAttribute('inert'); });
      if (st.pickOpener && document.contains(st.pickOpener)) st.pickOpener.focus({ preventScroll: true });
    }
    // Checkout adds the shirt to the cart, then goes straight to Shopify's own checkout (/checkout). Add to cart goes to /cart.
    function addToCart(btn, toCheckout) {
      return;   // preview: nothing can be bought
      var v = chosen(); if (!v || !v.ok) return;
      $$('.ttd-acq-go button').forEach(function (b) { b.disabled = true; }); btn.textContent = toCheckout ? 'Going to checkout' : 'Adding';
      fetch('/cart/add.js', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'The shirt was not added. Please try again.'); return j; }); })
        .then(function () {
          if (toCheckout) { location.href = '/checkout'; return; }
          // 1.3.0: Add to cart closes the Acquire page and opens the Cart sheet. A work page has no sheets, so it goes to the Daybook page.
          if (isWork) { location.href = keep((cfg.home || '/') + '#cart', false, cfg); return; }
          cartHtml = null;
          return loadCart().then(function () { closePick(); st.from = ''; openSheet('cart'); step(); }, function () { location.href = cartUrl; });
        })
        .catch(function (e) { renderPick(e.message || 'The shirt was not added. Please try again.'); });
    }
    function findWork(h) { return archive.filter(function (x) { return x.h === h; })[0] || (workPage && workPage.h === h ? workPage : null); }
    function post(url, data) {
      var body = new URLSearchParams(); Object.keys(data).forEach(function (k) { body.append(k, data[k] == null ? '' : String(data[k])); });
      return fetch(url, { method: 'POST', body: body, credentials: 'omit' }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j || !j.ok) throw new Error('no'); return j; }); });
    }
    // ---- 1.0.7: Request a Showing, for Register RG-1.5. One tick, no email. The page never claims a count the Register did not save.
    // 1.0.8 (Arthur, Nov 19): the Register can hold its lock for 10 seconds before it saves, so the page waits 25 seconds, not 12.
    // FT_WAIT must stay just above the Register's MIN_SUBMIT_SECONDS (3 by default). If Arthur raises that setting, raise this too.
    var REQ_LIMIT = 25000, FT_WAIT = 3200;
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function rid() {
      var a = new Uint8Array(16); if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
      return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    }
    // a random id kept on this device. It lets the Register skip a repeat. It is not a name, an email or an address.
    function visitor() { var v = store('ttd-visitor'); if (typeof v !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(v)) { v = rid(); store('ttd-visitor', v); } return v; }
    // browser, language, time zone and screen size, hashed here. The Register hashes it again and keeps only that.
    function devClass() {
      try {
        var t = [navigator.userAgent, navigator.language, Intl.DateTimeFormat().resolvedOptions().timeZone, screen.width + 'x' + screen.height].join('|');
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(function (buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }).catch(function () { return ''; });
      } catch (e) { return Promise.resolve(''); }
    }
    function loadCounts() {
      return fetch(cfg.register + (cfg.register.indexOf('?') < 0 ? '?' : '&') + 'action=counts', { credentials: 'omit', redirect: 'follow' }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || j.ok !== true || !j.counts) throw new Error('no');
        counts = j.counts; HAVE = true; FT = typeof j.form_token === 'string' ? j.form_token : ''; FT_AT = Date.now();
        if (j.threshold) THR = Math.max(1, Math.round(+j.threshold) || THR);
        refreshCounts();
      });
    }
    // the form token is good from 3 seconds after the Register made it, for 24 hours. Too young: wait. Too old: fetch a new one.
    function token() {
      var age = Date.now() - FT_AT;
      if (FT && age < 23 * 3600000) return wait(Math.max(0, FT_WAIT - age)).then(function () { return FT; });
      return loadCounts().then(function () { return wait(FT_WAIT); }).then(function () { return FT; });
    }
    // JSON sent as text/plain: the browser then sends no pre-check, which Apps Script cannot answer. 25 seconds, then give up.
    function postJSON(url, data) {
      var ac = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ac) ac.abort(); }, REQ_LIMIT);
      return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data), credentials: 'omit', redirect: 'follow', signal: ac ? ac.signal : undefined })
        .then(function (r) { return r.json(); }).then(function (j) { clearTimeout(timer); return j; }, function (e) { clearTimeout(timer); throw e; });
    }
    function sendReq(h, btn, again) {
      var w = findWork(h), hp = $('[data-hp]'); btn.disabled = true; btn.classList.remove('ttd-sheen'); btn.textContent = 'Sending\u2026';
      reqIds[h] = reqIds[h] || rid();   // the same id again when the visitor retries by hand
      function fail(msg) { refreshCounts(); if (msg) toast(msg); }
      Promise.all([token(), devClass()]).then(function (a) {
        var c = counts[h] || {}, body = { action: 'request', work: h, ft: a[0], website: hp ? hp.value : '', visitor: visitor(), title: w ? w.t : '', artist: w ? w.a : '',
          requestId: reqIds[h], page: (location.origin + location.pathname).slice(0, 500), dc: a[1] };
        if (c.design_id) body.design_id = c.design_id;
        return postJSON(cfg.register, body);
      }).then(function (j) {
        if (j && j.ok === true) {
          mine[h] = 1; store('ttd-req2', mine); delete reqIds[h];
          var c = counts[h] || {}; if (j.count != null) c.count = +j.count; c.coming_back_on = j.coming_back_on || null; if (j.return_status) c.return_status = j.return_status; if (j.design_id) c.design_id = j.design_id; counts[h] = c;
          if (j.threshold) THR = Math.max(1, Math.round(+j.threshold) || THR);
          lastNew = h; refreshCounts(); setTimeout(function () { lastNew = null; }, 1000); return;
        }
        var e = (j && j.error) || '';
        if (e === 'too_fast' && !again) return wait(FT_WAIT).then(function () { sendReq(h, btn, true); });   // one quiet retry, then the visitor decides
        if (e === 'form_expired' || e === 'invalid_form') { FT = ''; loadCounts().catch(function () {}); return fail('This page sat open too long. Please tap again.'); }
        if (e === 'too_fast') return fail('That was quick. Please tap again in a moment.');
        if (e === 'busy') return fail('The Register is busy. Please try again in a few seconds.');
        if (e === 'rejected') return fail('');
        fail('Your request was not saved. Please try again later.');
      }).catch(function () { fail('Your request was not saved. Please try again.'); });
    }
    // Notify (CP-01, CP-09): the address goes to the Notify list only. It is never kept on this device or in the page.
    function sendNotify(f) {
      var h = f.dataset.notifyForm, inp = f.querySelector('input[type=email]'), er = f.querySelector('.ttd-err'), v = (inp.value || '').trim(), w = findWork(h);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { er.textContent = 'Please type a full email address.'; er.removeAttribute('hidden'); inp.focus(); return; }
      er.setAttribute('hidden', ''); var b = f.querySelector('button'); b.disabled = true; b.textContent = 'Sending';
      post(cfg.notify, { action: 'notify', work: h, title: w ? w.t : '', artist: w ? w.a : '', email: v, consent: 'design_notify', consent_version: 'notify-2026-11-19', page: location.origin + location.pathname })
        .then(function () {
          notified[h] = 1; store('ttd-notified', notified); inp.value = '';
          var box = f.closest('.ttd-notify'); box.outerHTML = notifyHtml(w || { h: h });
          var done = $('[data-notify-box="' + h + '"]'); if (done) { done.setAttribute('tabindex', '-1'); done.focus({ preventScroll: true }); }
        })
        .catch(function () { b.disabled = false; b.textContent = 'Notify me'; er.textContent = 'That did not go through. Please try again.'; er.removeAttribute('hidden'); });
    }
    function toast(msg) {
      var t = document.createElement('div'); t.className = 'ttd-toast'; t.setAttribute('role', 'status'); t.textContent = msg; root.appendChild(t);
      setTimeout(function () { t.remove(); }, 4000);
    }

    // ---- events ----
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-day],[data-tab],[data-close-sheet],[data-sort],[data-more],[data-work],[data-req],[data-acquire],[data-close-pick],[data-c],[data-s],[data-add],[data-chart],[data-pol],[data-pol-back],[data-checkout],[data-login],[data-by],[data-reset],[data-close-work],[data-filt],[data-open],[data-open-cart],[data-line]');
      if (!t || !root.contains(t)) return;
      if (t.dataset.day != null) return goDay(+t.dataset.day);
      // 1.5.1: a policy link on the Acquire page opens the policy in place. A new-tab click stays a plain link.
      if (t.dataset.pol) { if (!polTpl[t.dataset.pol] || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; e.preventDefault(); openPol(t.dataset.pol); return step(); }
      if (t.hasAttribute('data-pol-back')) { closePol(); return step(); }
      // 1.5.1: the header is in use above the Acquire page. A tab or the cart button closes Acquire first.
      if (st.pick && (t.dataset.tab || t.hasAttribute('data-open-cart')) && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button)) closePick();
      if (t.dataset.tab) { if (t.dataset.tab === 'today') { closeSheets(); goDay(pages.length - 2, true); return step(); } openSheet(t.dataset.tab, t); return step(); }
      // 1.2.0: a footer link opens its sheet. A new-tab click (Ctrl, Cmd, Shift or the middle button) stays a plain link.
      if (t.dataset.open) {
        if (!HAS[t.dataset.open] || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault();
        st.from = t.closest('.ttd-sheet[data-sheet="house"]') ? 'house' : (st.sheet && KIDS[st.sheet] ? st.from : '');
        openSheet(t.dataset.open, st.sheet ? null : t); return step();
      }
      // 1.3.0: the cart button opens the Cart sheet over whatever is showing. Its Back button returns to the sheet it covered.
      if (t.hasAttribute('data-open-cart')) {
        if (isWork || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault(); if (st.sheet === 'cart') return;
        st.from = st.sheet || ''; openSheet('cart', st.sheet ? null : t); return step();
      }
      if (t.dataset.line != null) { if (!t.closest('.ttd-sheet[data-sheet="cart"]')) return; e.preventDefault(); return changeLine(t); }
      if (t.hasAttribute('data-close-sheet')) { var to = t.getAttribute('data-close-sheet'); if (to && to !== 'cart' && $('.ttd-sheet[data-sheet="' + to + '"]')) { st.from = ''; openSheet(to); return step(); } closeSheets(); return step(); }
      if (t.hasAttribute('data-close-work')) {
        // Close on a work page (1.0.5): back to where the visitor came from; from a direct link, to Today
        var came = null; try { came = sessionStorage.getItem('ttd-came'); } catch (x) {}
        if (came === workPage.h && history.length > 1 && (document.referrer || '').indexOf(location.origin) === 0) history.back(); else location.href = homeUrl;
        return;
      }
      if (t.dataset.sort) { st.sort = t.dataset.sort; st.shown = 24; renderArchive(); step(); var b = $('[data-sort="' + st.sort + '"]'); if (b) b.focus(); return; }
      if (t.hasAttribute('data-reset')) { st.sort = 'close'; st.month = ''; st.artist = ''; st.year = null; st.shown = 24; st.fReq = false; st.fSeen = false; saveFilters(); renderArchive(); step(); var yb = $('[data-year]'); if (yb) yb.focus(); return; }
      if (t.dataset.filt) { var fk = t.dataset.filt === 'req' ? 'fReq' : 'fSeen'; st[fk] = !st[fk]; st.shown = 24; saveFilters(); renderArchive(); step(); var fb2 = $('[data-filt="' + t.dataset.filt + '"]'); if (fb2) fb2.focus(); return; }
      if (t.hasAttribute('data-more')) { var n = st.shown; st.shown += 24; renderArchive(); mark(); var nt = $$('.ttd-tile')[n]; if (nt) nt.focus({ preventScroll: true }); return; }
      // a tile goes to the work page (Paul, 1.0.4: one view of a work). The Archive is kept, so Back returns to the same spot.
      if (t.dataset.work) { if (t.closest('.ttd-sheet[data-sheet="archive"]')) saveArchive(t.dataset.work); try { sessionStorage.setItem('ttd-came', t.dataset.work); } catch (x) {} mark(); return; }
      if (t.dataset.req) {
        var h = t.dataset.req;
        // 1.0.7: with no Register address, a tap saves nothing and says so. No number changes.
        if (!cfg.register) return toast('Requests open soon. This one was not saved.');
        if (mine[h] && reqOn()) return;
        return sendReq(h, t);
      }
      if (t.hasAttribute('data-acquire')) { openPick(t); return step(); }
      if (t.hasAttribute('data-close-pick')) { closePick(); return step(); }
      if (t.dataset.c != null) { st.sel.c = t.dataset.c; var cur = chosen(); if (st.sel.s && (!cur || !cur.ok)) st.sel.s = null; renderPick(); var c = pick.querySelector('[data-c][aria-pressed="true"]'); if (c) c.focus(); return; }
      if (t.dataset.s != null) { st.sel.s = t.dataset.s; renderPick(); var s = pick.querySelector('[data-add]'); if (s) s.focus(); return; }
      if (t.hasAttribute('data-chart')) { st.chart = !st.chart; renderPick(); var cb = pick.querySelector('[data-chart]'); if (cb) cb.focus(); return; }
      if (t.hasAttribute('data-add')) return addToCart(t, false);
      if (t.hasAttribute('data-checkout')) return addToCart(t, true);
      if (t.hasAttribute('data-login')) {
        e.preventDefault(); var note = $('#ttd-login-note'); if (!note) return toast('Artist login opens soon.');
        var open = note.hasAttribute('hidden'); if (open) note.removeAttribute('hidden'); else note.setAttribute('hidden', '');
        t.setAttribute('aria-expanded', open ? 'true' : 'false'); return;
      }
      if (t.dataset.by) {
        if (isWork) { try { sessionStorage.setItem('ttd-arch', JSON.stringify({ sort: 'close', month: '', year: '', artist: t.dataset.by, shown: 24, top: 0 })); } catch (x) {} location.href = keep((cfg.home || '/') + '#archive', false, cfg); return; }
        st.artist = t.dataset.by; st.month = ''; st.year = ''; st.shown = 24; openSheet('archive', t); return step();
      }
    });
    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-notify-on]')) {
        var nf = e.target.closest('.ttd-notify').querySelector('form');
        if (e.target.checked) { nf.removeAttribute('hidden'); nf.querySelector('input').focus(); } else nf.setAttribute('hidden', '');
        return;
      }
      if (e.target.matches('[data-year]')) { st.year = e.target.value; st.shown = 24; renderArchive(); step(); $('[data-year]').focus(); }
      if (e.target.matches('[data-month]')) { st.month = e.target.value; st.shown = 24; renderArchive(); step(); $('[data-month]').focus(); }
      if (e.target.matches('[data-artist]')) { st.artist = e.target.value; st.shown = 24; renderArchive(); step(); $('[data-artist]').focus(); }
    });
    root.addEventListener('submit', function (e) {
      if (e.target.closest('[data-nosend]')) { e.preventDefault(); return; }   // preview: a signup form with no address sends nothing
      var f = e.target.closest('[data-notify-form]'); if (!f) return;
      e.preventDefault(); sendNotify(f);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (st.pick && st.doc) { closePol(); step(); } else if (st.pick) { closePick(); step(); } else if (st.sheet) { closeSheets(); step(); }
    });
    // swipe between days
    if (!isWork) {
      var sx = 0, sy = 0, wrap = $('.ttd-wrap');
      wrap.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      wrap.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 60 && Math.abs(dy) < 50) goDay(st.day + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }

    // the unveiling: the cover lifts once, then leaves the page
    $$('[data-unveil]').forEach(function (c) {
      setTimeout(function () { c.classList.add('is-lift'); }, 500);
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 2200);
    });
    // ---- start ----
    track.style.transition = 'none'; goDay(st.day, true); void track.offsetWidth; track.style.transition = '';
    var hash = (location.hash || '').slice(1);
    if (hash === 'submit') hash = 'artists';
    var hs0 = null; try { hs0 = history.state; } catch (x) {}
    if (hs0 && hs0.ttd) {   // this step was seen before (Back from a work page or the cart): show it as it was
      apply(hs0);
      if (!isWork && st.sheet === 'archive') { var a0 = null; try { a0 = JSON.parse(sessionStorage.getItem('ttd-arch') || 'null'); sessionStorage.removeItem('ttd-arch'); } catch (x) {}
        if (a0 && a0.h) { backTo = a0; placeBack(); setTimeout(function () { backTo = null; }, 6000); } }
    }
    else if (!isWork && hash === 'archive') restoreArchive();
    else if (!isWork && (hash === 'house' || hash === 'artists')) openSheet(hash);
    else if (!isWork && KIDS[hash]) { if (HAS[hash]) openSheet(hash); else if (OLD[hash] && hash !== 'follow') { location.replace(keep(OLD[hash], false, cfg)); return; } }
    // 1.2.0: after a contact send, Shopify reloads this page. The Contact sheet opens again with the thank-you line, or with the error.
    if (!isWork && HAS.contact && (posted || formErr) && !(hs0 && hs0.ttd)) {
      openSheet('contact');
      var note = root.querySelector('[data-ttd-posted], [data-ttd-form-err]'); if (note) note.focus({ preventScroll: true });
      try { var q = location.search.replace(/([?&])contact_posted=[^&]*&?/, '$1').replace(/[?&]$/, ''); history.replaceState(null, '', location.pathname + q + '#contact'); } catch (x) {}
    }
    mark();
    // the smoke rests while the tab is hidden, to save battery
    document.addEventListener('visibilitychange', function () { root.classList.toggle('is-idle', document.hidden); });
    if (isWork && !workIsToday) seenWork(workPage.h);   // 1.0.6: "Recently viewed" in The Archive
    if (cfg.register) loadCounts().catch(function () {});   // a failed answer shows no number at all
    if (!isWork && +cfg.cart > 0 && cartHtml == null) loadCart().catch(function () {});   // 1.3.0: a cart with shirts is read early, so the sheet opens full
    // more than 250 archived works: read the next pages of this same page
    if (D.more && !isWork) (function next(n) {
      var u = location.pathname + (location.search ? location.search + '&' : '?') + 'page=' + n + '&section_id=' + encodeURIComponent(root.dataset.sid);
      fetch(u, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        var m = /<script type="application\/json" data-ttd-data>([\s\S]*?)<\/script>/.exec(html); if (!m) return;
        var j = JSON.parse(m[1]); archive = archive.concat(j.archive || []);
        if (st.sheet === 'archive') { renderArchive(); placeBack(); }
        if (j.more && n < 20) next(n + 1);
      }).catch(function () {});
    })(2);
  }

  // the Daybook cart page: remove a line, change a quantity, then reload. Checkout stays native.
  function Cart(root) {
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-line],[data-login]'); if (!t) return;
      if (t.hasAttribute('data-login')) { e.preventDefault(); var n = root.querySelector('.ttd-toast'); if (n) n.hidden = false; return; }
      e.preventDefault(); root.setAttribute('aria-busy', 'true');
      fetch('/cart/change.js', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ id: t.dataset.line, quantity: +t.dataset.qty }) })
        .then(function () { location.reload(); }, function () { location.reload(); });
    });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ttd-cart]'), function (r) { if (!r.__ttd) { r.__ttd = 1; Cart(r); } }); Array.prototype.forEach.call(document.querySelectorAll('[data-ttd]'), function (r) { if (!r.__ttd) { r.__ttd = 1; try { Daybook(r); } catch (e) { if (window.console) console.error('Daybook', e); } } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
