/* Drop window in America/Chicago.
   A drop starts at local midnight and ends at local 23:59:59 the same civil day.
   The end label is built from starts_at and ends_at. It is never typed into the page.
   Offsets come from the zone. This file does not hardcode a UTC offset.
   No drop may start on a DST-change day. */
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

  function isDstChangeDay(y, mo, d) {
    var start = wallToDate(y, mo, d, 0, 0, 0);
    var end = wallToDate(y, mo, d, 23, 59, 59);
    if (!start || !end) return true;
    return offsetMinutes(start) !== offsetMinutes(end);
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

  function dropEndLabel(drop, now) {
    now = now || new Date();
    if (!drop || drop.starts_at == null || drop.ends_at == null) return "";
    var start = parseIso(drop.starts_at);
    var end = parseIso(drop.ends_at);
    if (!start || !end) return "";
    var sp = parts(start);
    var ep = parts(end);
    if (sp.hour !== 0 || sp.minute !== 0 || sp.second !== 0) return "";
    if (ep.hour !== 23 || ep.minute !== 59 || ep.second !== 59) return "";
    if (!sameDay(sp, ep)) return "";
    if (isDstChangeDay(sp.year, sp.month, sp.day)) return "";
    var time = clock(ep);
    if (sameDay(ep, parts(now))) return "Ends tonight " + time + " CT";
    return "Ends " + ep.weekday + ", " + monthName(end) + " " + ep.day + ", " + time + " CT";
  }

  global.TT = global.TT || {};
  global.TT.dropEndLabel = dropEndLabel;
  global.TT.isDstChangeDay = isDstChangeDay;
  global.TT.formatChicagoIso = formatChicagoIso;
  global.TT.chicagoParts = parts;
})(window);
