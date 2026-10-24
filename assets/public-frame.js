/* Public pages. Opens the phone menu. Does not load a drop, a price, or a timer. */
(function () {
  document.documentElement.classList.add("js");
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
})();
