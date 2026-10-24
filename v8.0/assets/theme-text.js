/* Artist and theme text is written with textContent only.
   Do not use innerHTML, insertAdjacentHTML, or HTML built from template strings.
   Artist SVGs render only via <img src>. An allowlist sanitizer runs at hand-load time.
   Phase 1 does not render artist-provided text, SVGs, or panels. Slots stay off. */
(function (global) {
  function renderThemeText(node, value) {
    if (!node || node.nodeType !== 1) return;
    node.textContent = value == null ? "" : String(value);
  }

  global.TT = global.TT || {};
  global.TT.renderThemeText = renderThemeText;
})(window);
