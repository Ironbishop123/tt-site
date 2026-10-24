/* Shared frame. Nav and footer text come from assets/site.json.
   One drop per screen. Label, countdown, and price come from data/drops.json
   through TT.dropView and refresh every second so the state morphs at zero.
   DOM writes use textContent and createElement. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var siteBase = root.getAttribute("data-site-base") || "";

  function siteUrl(path) {
    return siteBase + path;
  }

  function pageHref(href) {
    if (!siteBase || !href || /^(https?:|\/|\.\.)/.test(href)) return href;
    return siteBase + href;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function currentFile() {
    var file = location.pathname.split("/").pop();
    return file || "index.html";
  }

  function link(item, file) {
    var a = document.createElement("a");
    a.href = pageHref(item.href);
    a.textContent = item.label;
    if (item.href === file) a.setAttribute("aria-current", "page");
    return a;
  }

  function applySite(data) {
    var file = currentFile();
    var header = document.querySelector("[data-slot=nav]");
    if (header && data) {
      var brand = header.querySelector(".brand span");
      if (brand && data.brand) brand.textContent = data.brand;
      var list = header.querySelector(".nav-links ul");
      if (list && Array.isArray(data.nav)) {
        clear(list);
        data.nav.forEach(function (item) {
          var li = document.createElement("li");
          li.appendChild(link(item, file));
          list.appendChild(li);
        });
      }
      var cart = header.querySelector(".cart");
      if (cart && data.cart) {
        cart.setAttribute("href", pageHref(data.cart.href));
        cart.textContent = data.cart.label;
      }
    }
    var lines = document.querySelector("[data-slot=legal] .legal-lines");
    if (lines && data && Array.isArray(data.legal)) {
      clear(lines);
      data.legal.forEach(function (line) {
        var span = document.createElement("span");
        span.textContent = line;
        lines.appendChild(span);
      });
    }
    var foot = document.querySelector("[data-slot=legal] .footer-nav");
    if (foot && data && Array.isArray(data.footerNav)) {
      clear(foot);
      data.footerNav.forEach(function (item) {
        foot.appendChild(link(item, file));
      });
    }
  }

  function wireMenu() {
    var btn = document.querySelector(".menu");
    var menu = document.getElementById("site-menu");
    if (!btn || !menu) return;

    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
      if (open) menu.classList.add("is-open");
      else menu.classList.remove("is-open");
    }

    setOpen(false);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      setOpen(open);
      if (open) {
        var first = menu.querySelector("a");
        if (first) first.focus();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        btn.focus();
      }
    });
  }

  function paintDrop(view) {
    document.querySelectorAll("[data-drop-label]").forEach(function (node) {
      node.textContent = view.label || "";
      if (view.state) node.setAttribute("data-state", view.state);
      else node.removeAttribute("data-state");
    });
    document.querySelectorAll("[data-drop-countdown]").forEach(function (node) {
      node.textContent = view.countdown || "";
    });
    document.querySelectorAll("[data-drop-price]").forEach(function (node) {
      node.textContent = view.priceText || "";
      if (view.price == null) node.removeAttribute("data-price");
      else node.setAttribute("data-price", String(view.price));
    });
  }

  function showDrop() {
    var nodes = document.querySelectorAll("[data-drop-label], [data-drop-price], [data-drop-countdown]");
    if (!nodes.length || !window.TT || !TT.watchDrop) return Promise.resolve();
    return fetch(siteUrl("data/drops.json")).then(function (response) {
      if (!response.ok) throw new Error("drops");
      return response.json();
    }).then(function (data) {
      var drops = data && Array.isArray(data.drops) ? data.drops : [];
      var drop = drops[0];
      if (!drop) {
        paintDrop({ label: "", countdown: "", priceText: "", price: null, state: "" });
        return;
      }
      TT.watchDrop(drop, paintDrop);
    }).catch(function () {
      paintDrop({ label: "", countdown: "", priceText: "", price: null, state: "" });
    });
  }

  wireMenu();
  var siteReady = fetch(siteUrl("assets/site.json")).then(function (response) {
    if (!response.ok) throw new Error("site");
    return response.json();
  }).then(applySite).catch(function () {});
  Promise.all([siteReady, showDrop()]).then(function () {
    root.dataset.frame = "ready";
  });
})();
