/* Public pages. Opens the phone menu over the page. Does not load a drop, a price, or a timer. */
(function () {
  document.documentElement.classList.add("js");
  var btn = document.querySelector(".menu");
  var menu = document.getElementById("site-menu");
  if (!btn || !menu) return;
  var closeBtn = menu.querySelector(".nav-close");

  function items() {
    return Array.prototype.slice.call(menu.querySelectorAll("a, button"));
  }

  function setOpen(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
    if (open) {
      menu.classList.add("is-open");
      document.documentElement.classList.add("is-menu-open");
      menu.setAttribute("aria-modal", "true");
    } else {
      menu.classList.remove("is-open");
      document.documentElement.classList.remove("is-menu-open");
      menu.removeAttribute("aria-modal");
    }
  }

  function closeAndReturn() {
    if (btn.getAttribute("aria-expanded") !== "true") return;
    setOpen(false);
    btn.focus();
  }

  setOpen(false);

  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") !== "true";
    setOpen(open);
    if (open) {
      var target = closeBtn || menu.querySelector("a");
      if (target) target.focus();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeAndReturn);

  menu.addEventListener("click", function (event) {
    if (event.target === menu) closeAndReturn();
  });

  document.addEventListener("keydown", function (event) {
    if (btn.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndReturn();
      return;
    }
    if (event.key !== "Tab") return;
    var list = items();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
