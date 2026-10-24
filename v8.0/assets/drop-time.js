/* Drop state machine (spec v0.7 §3). America/Chicago only.
   Offsets come from the zone. This file does not hardcode a UTC offset.
   Labels and prices are generated from the drop record. Prices are never invented.
   status_override wins. The view is recomputed from the clock so it morphs at zero
   without a reload. A DST-change day produces no label. */
(function (global) {
  var ZONE = "America/Chicago";

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function parts(date) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short"
    });
    var map = {};
    fmt.formatToParts(date).forEach(function (part) {
      if (part.type !== "literal") map[part.type] = part.value;
    });
    if (map.hour === "24") map.hour = "00";
    return {
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: Number(map.hour),
      minute: Number(map.minute),
      second: Number(map.second),
      weekday: map.weekday
    };
  }

  function offsetMinutes(date) {
    var found = new Intl.DateTimeFormat("en-US", {
      timeZone: ZONE,
      timeZoneName: "longOffset"
    }).formatToParts(date).filter(function (part) {
      return part.type === "timeZoneName";
    })[0];
    var value = found ? found.value : "";
    var match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(value);
    if (!match) throw new Error("America/Chicago offset unavailable");
    var sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] || 0));
  }

  function wallToDate(y, mo, d, h, mi, s) {
    var utc = Date.UTC(y, mo - 1, d, h, mi, s);
    var i;
    for (i = 0; i < 4; i += 1) {
      var off = offsetMinutes(new Date(utc));
      var next = Date.UTC(y, mo - 1, d, h, mi, s) - off * 60 * 1000;
      if (next === utc) break;
      utc = next;
    }
    var date = new Date(utc);
    var got = parts(date);
    if (got.year !== y || got.month !== mo || got.day !== d || got.hour !== h || got.minute !== mi || got.second !== s) {
      return null;
    }
    return date;
  }

  function formatChicagoIso(y, mo, d, h, mi, s) {
    var date = wallToDate(y, mo, d, h, mi, s);
    if (!date) return null;
    var off = offsetMinutes(date);
    var sign = off < 0 ? "-" : "+";
    var abs = Math.abs(off);
    var p = parts(date);
    return p.year + "-" + pad(p.month) + "-" + pad(p.day) + "T" + pad(p.hour) + ":" + pad(p.minute) + ":" + pad(p.second) + sign + pad(Math.floor(abs / 60)) + ":" + pad(abs % 60);
  }

  function nextCalendarDay(y, mo, d) {
    var utc = new Date(Date.UTC(y, mo - 1, d));
    utc.setUTCDate(utc.getUTCDate() + 1);
    return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
  }

  function isDstChangeDay(y, mo, d) {
    var start = wallToDate(y, mo, d, 0, 0, 0);
    var next = nextCalendarDay(y, mo, d);
    var end = wallToDate(next.year, next.month, next.day, 0, 0, 0);
    if (!start || !end) return true;
    return end.getTime() - start.getTime() !== 86400000;
  }

  function parseIso(iso) {
    if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(iso)) return null;
    var date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    var match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
    var sign = match[1] === "-" ? -1 : 1;
    var stated = sign * (Number(match[2]) * 60 + Number(match[3]));
    if (stated !== offsetMinutes(date)) return null;
    return date;
  }

  function sameDay(a, b) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  }

  function clock(p) {
    var h = p.hour % 12;
    if (h === 0) h = 12;
    var ap = p.hour >= 12 ? "PM" : "AM";
    return h + ":" + pad(p.minute) + " " + ap;
  }

  function monthName(date) {
    return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, month: "short" }).format(date);
  }

  function absolute(date) {
    var p = parts(date);
    return p.weekday + ", " + monthName(date) + " " + p.day + ", " + clock(p);
  }

  function endPhrase(prefix, end, now) {
    var ep = parts(end);
    var time = clock(ep);
    if (sameDay(ep, parts(now))) {
      if (prefix === "Ends") return "Ends tonight " + time + " CT";
      return prefix + " tonight " + time + " CT";
    }
    return prefix + " " + ep.weekday + ", " + monthName(end) + " " + ep.day + ", " + time + " CT";
  }

  function priceOf(value) {
    if (typeof value !== "number" || !isFinite(value)) return null;
    return value;
  }

  function formatPrice(value) {
    if (value == null) return "";
    return "$" + value.toFixed(2);
  }

  function countdownText(deadlineMs, nowMs) {
    if (deadlineMs == null) return "";
    var left = deadlineMs - nowMs;
    if (left < 0) left = 0;
    var total = Math.floor(left / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  function emptyView() {
    return { state: "", label: "", price: null, priceText: "", countdown: "", countdownTo: null };
  }

  function localDayOk(start, end) {
    var sp = parts(start);
    var ep = parts(end);
    if (sp.hour !== 0 || sp.minute !== 0 || sp.second !== 0) return false;
    if (ep.hour !== 23 || ep.minute !== 59 || ep.second !== 59) return false;
    if (!sameDay(sp, ep)) return false;
    if (isDstChangeDay(sp.year, sp.month, sp.day)) return false;
    if (end.getTime() + 1000 - start.getTime() !== 86400000) return false;
    return true;
  }

  function dropView(drop, now) {
    now = now || new Date();
    if (!drop) return emptyView();
    if (drop.status_override === "sold_out") {
      return { state: "sold_out", label: "Sold out", price: null, priceText: "", countdown: "", countdownTo: null };
    }
    if (drop.status_override === "pulled") {
      return { state: "pulled", label: "Unavailable", price: null, priceText: "", countdown: "", countdownTo: null };
    }
    if (drop.status_override != null) return emptyView();
    var start = parseIso(drop.starts_at);
    var end = parseIso(drop.ends_at);
    var lcStart = parseIso(drop.last_chance_starts_at);
    var lcEnd = parseIso(drop.last_chance_ends_at);
    if (!start || !end || !lcStart || !lcEnd) return emptyView();
    if (!localDayOk(start, end) || !localDayOk(lcStart, lcEnd)) return emptyView();
    if (end.getTime() + 1000 !== lcStart.getTime()) return emptyView();
    var nowMs = now.getTime();
    var state;
    var label;
    var price;
    var countdownTo = null;
    if (nowMs < start.getTime()) {
      state = "upcoming";
      label = "Starts " + absolute(start) + " CT";
      price = priceOf(drop.live_price);
    } else if (nowMs < end.getTime() + 1000) {
      state = "live";
      label = endPhrase("Ends", end, now);
      price = priceOf(drop.live_price);
      countdownTo = end.getTime() + 1000;
    } else if (nowMs < lcEnd.getTime() + 1000) {
      state = "last_chance";
      label = endPhrase("Last chance · ends", lcEnd, now);
      price = priceOf(drop.last_chance_price);
      countdownTo = lcEnd.getTime() + 1000;
    } else {
      state = "vault";
      label = "In the Vault";
      price = priceOf(drop.vault_price);
    }
    return {
      state: state,
      label: label,
      price: price,
      priceText: formatPrice(price),
      countdown: countdownText(countdownTo, nowMs),
      countdownTo: countdownTo
    };
  }

  function watchDrop(drop, render, nowFn, intervalMs) {
    function tick() {
      var clockNow = typeof nowFn === "function" ? nowFn() : new Date();
      render(dropView(drop, clockNow));
    }
    tick();
    var timer = setInterval(tick, intervalMs == null ? 1000 : intervalMs);
    return function stop() { clearInterval(timer); };
  }

  function dropEndLabel(drop, now) {
    return dropView(drop, now).label;
  }

  global.TT = global.TT || {};
  global.TT.dropView = dropView;
  global.TT.watchDrop = watchDrop;
  global.TT.dropEndLabel = dropEndLabel;
  global.TT.isDstChangeDay = isDstChangeDay;
  global.TT.formatChicagoIso = formatChicagoIso;
  global.TT.chicagoParts = parts;
})(window);
