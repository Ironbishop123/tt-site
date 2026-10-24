/* Production copy of the profile panel reveal.
   The preview query parameter is omitted.
   Reduced motion leaves the panels drawn. */
(function (global) {
  function revealPanels(panels) {
    if (!panels || !panels.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var list = Array.prototype.slice.call(panels);
    list.forEach(function (panel) {
      panel.style.setProperty("--r", "0");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var panel = entry.target;
        var delay = list.indexOf(panel) % 4 * 120;
        var t0 = performance.now() + delay;
        var step = function (now) {
          var k = Math.max(0, Math.min(1, (now - t0) / 700));
          var eased = 1 - Math.pow(1 - k, 3);
          panel.style.setProperty("--r", String(eased));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });
    list.forEach(function (panel) { io.observe(panel); });
  }

  global.TT = global.TT || {};
  global.TT.revealPanels = revealPanels;
})(window);
