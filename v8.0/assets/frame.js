/* Shared frame. Nav and footer text come from assets/site.json.
   Drop labels come from data/drops.json through TT.dropEndLabel.
   DOM writes use textContent and createElement. Artist slots are not filled. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function currentFile() {
    var file = location.pathname.split("/").pop();
    return file || "index.html";
  }

  function link(item, file) {
    var a = document.createElement("a");
    a.href = item.href;
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
        cart.setAttribute("href", data.cart.href);
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

  function showDrop() {
    var nodes = document.querySelectorAll("[data-drop-label]");
    if (!nodes.length || !window.TT || !TT.dropEndLabel) return Promise.resolve();
    return fetch("data/drops.json").then(function (response) {
      if (!response.ok) throw new Error("drops");
      return response.json();
    }).then(function (data) {
      var drops = data && Array.isArray(data.drops) ? data.drops : [];
      var now = new Date();
      var label = "";
      var i;
      for (i = 0; i < drops.length; i += 1) {
        label = TT.dropEndLabel(drops[i], now);
        if (label) break;
      }
      nodes.forEach(function (node) {
        node.textContent = label || "";
      });
    }).catch(function () {
      nodes.forEach(function (node) {
        node.textContent = "";
      });
    });
  }

  wireMenu();
  var siteReady = fetch("assets/site.json").then(function (response) {
    if (!response.ok) throw new Error("site");
    return response.json();
  }).then(applySite).catch(function () {});
  Promise.all([siteReady, showDrop()]).then(function () {
    root.dataset.frame = "ready";
  });
})();
