/* Leaves the launch form enabled when the action's form id is all digits.
   A non-numeric id is disabled and cannot submit. */
(function () {
  var form = document.querySelector("form.notify");
  if (!form) return;
  var action = form.getAttribute("action") || "";
  var match = action.match(/\/forms\/([^/]+)\/subscriptions\/?$/);
  var ready = !!(match && /^[0-9]+$/.test(match[1]));
  var box = form.querySelector("fieldset");
  var controls = form.querySelectorAll("input, button");
  var status = document.getElementById("notify-status");
  if (!ready) {
    if (box) box.disabled = true;
    for (var i = 0; i < controls.length; i++) controls[i].disabled = true;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
    return;
  }
  if (box) box.disabled = false;
  for (var j = 0; j < controls.length; j++) controls[j].disabled = false;
  if (status) status.textContent = "";
})();
