/* Artist profile renderer.
   Theme strings use textContent. Theme SVGs and rasters use img or a validated CSS url.
   An allowlist sanitizer runs at hand-load time. This file does not inline artist SVG. */
(function (global) {
  var ASSET = /^assets\/themes\/[a-z0-9-]{3,40}\/[A-Za-z0-9_-]{1,48}\.(svg|png|webp)$/;
  var HEX = /^#[0-9A-Fa-f]{6}$/;
  var HOSTS = {
    "instagram.com": 1, "tiktok.com": 1, "x.com": 1, "threads.net": 1, "bsky.app": 1,
    "youtube.com": 1, "behance.net": 1, "artstation.com": 1, "dribbble.com": 1,
    "etsy.com": 1, "ko-fi.com": 1, "patreon.com": 1, "linktr.ee": 1, "example.com": 1
  };
  var ICONS = {
    about: "assets/icons/about.svg",
    links: "assets/icons/links.svg",
    commissions: "assets/icons/commissions.svg",
    process_gallery: "assets/icons/process.svg"
  };
  var PANEL_HEIGHTS = { 80: 1, 160: 1, 240: 1, 320: 1 };
  var CAPS = { name: 60, bio: 600, title: 40, text: 300, alt: 120, label: 40 };
  var COLOR_KEY = /^--color-(bg|surface|text|text-muted|accent|accent-contrast|line|link)$/;
  var EL_KEY = /^--el-(core|hot|mid|cool|smoke)$/;
  function siteUrl(path) {
    var base = document.documentElement.getAttribute("data-site-base") || "";
    return base + path;
  }

  function themeUrl(src) {
    var base = document.documentElement.getAttribute("data-theme-base") || "";
    return base + src;
  }

  function clip(value, max) {
    var s = value == null ? "" : String(value);
    return s.length > max ? s.slice(0, max) : s;
  }

  function text(node, value) {
    if (global.TT && TT.renderThemeText) TT.renderThemeText(node, value);
    else if (node) node.textContent = value == null ? "" : String(value);
  }

  function lin(channel) {
    var c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function lum(hex) {
    var h = hex.slice(1);
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function contrast(a, b) {
    var la = lum(a);
    var lb = lum(b);
    var hi = Math.max(la, lb);
    var lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  function asset(src, exts) {
    if (typeof src !== "string" || !ASSET.test(src) || src.indexOf("..") !== -1) return "";
    var ext = src.slice(src.lastIndexOf(".") + 1);
    if (exts && exts.indexOf(ext) === -1) return "";
    return src;
  }

  function safeHref(url) {
    if (typeof url !== "string" || url.length > 200) return "";
    var parsed;
    try { parsed = new URL(url); } catch (err) { return ""; }
    if (parsed.protocol !== "https:") return "";
    if (parsed.username || parsed.password || parsed.port) return "";
    var host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!HOSTS[host]) return "";
    return parsed.href;
  }

  function applyTokens(tokens) {
    if (!tokens || typeof tokens !== "object") {
      document.documentElement.style.removeProperty("--theme-accent");
      return;
    }
    var accent = tokens["--color-accent"];
    var onAccent = tokens["--color-accent-contrast"];
    if (typeof accent === "string" && typeof onAccent === "string" && HEX.test(accent) && HEX.test(onAccent)) {
      if (contrast(onAccent, accent) < 4.5) {
        document.documentElement.style.removeProperty("--theme-accent");
        return;
      }
    }
    var themeAccent = "";
    Object.keys(tokens).forEach(function (key) {
      if (key === "--color-focus" || key === "--el-speed" || key === "--el-intensity") return;
      var value = tokens[key];
      if ((COLOR_KEY.test(key) || EL_KEY.test(key)) && typeof value === "string" && HEX.test(value)) {
        document.documentElement.style.setProperty(key, value);
        if (key === "--color-accent") themeAccent = value;
      } else if (key === "--font-display" && (value === "Space Grotesk" || value === "Inter")) {
        document.documentElement.style.setProperty(key, '"' + value + '", system-ui, sans-serif');
      }
    });
    if (themeAccent) document.documentElement.style.setProperty("--theme-accent", themeAccent);
    else document.documentElement.style.removeProperty("--theme-accent");
  }

  function strokeNode() {
    var tpl = document.getElementById("panel-stroke");
    if (!tpl || !tpl.content) return document.createElement("span");
    return tpl.content.cloneNode(true);
  }

  function addLink(parent, link) {
    if (!link) return;
    var href = safeHref(link.url);
    if (!href) return;
    var a = document.createElement("a");
    text(a, clip(link.label || "", CAPS.label));
    a.setAttribute("href", href);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    parent.appendChild(a);
  }

  function addImage(parent, image) {
    if (!image) return;
    var src = asset(image.src, ["png", "webp"]);
    if (!src || !PANEL_HEIGHTS[image.height]) return;
    var img = document.createElement("img");
    img.className = "wip";
    img.setAttribute("src", themeUrl(src));
    img.setAttribute("alt", clip(image.alt, CAPS.alt));
    img.setAttribute("width", "320");
    img.setAttribute("height", String(image.height));
    parent.appendChild(img);
  }

  function panelElement(panel) {
    var el = document.createElement("div");
    el.className = "panel";
    if (ICONS[panel.type]) el.setAttribute("data-type", panel.type);
    el.appendChild(strokeNode());
    var icon = document.createElement("img");
    icon.className = "icon";
    icon.setAttribute("src", siteUrl(ICONS[panel.type] || "assets/icons/about.svg"));
    icon.setAttribute("alt", "");
    el.appendChild(icon);
    var body = document.createElement("div");
    body.className = "pb";
    var title = document.createElement("h3");
    text(title, clip(panel.title || "", CAPS.title));
    body.appendChild(title);
    if (panel.text) {
      var copy = document.createElement("p");
      text(copy, clip(panel.text, CAPS.text));
      body.appendChild(copy);
    }
    addLink(body, panel.link);
    addImage(body, panel.image);
    el.appendChild(body);
    return el;
  }

  function renderProfile(root, theme) {
    if (!root || !theme) return;
    applyTokens(theme.tokens);
    var artist = theme.artist || {};
    var profile = theme.profile || {};
    var name = root.querySelector("[data-field=name]");
    var bio = root.querySelector("[data-field=bio]");
    if (name) text(name, clip(artist.name || "", CAPS.name));
    if (bio) text(bio, clip(artist.bio || "", CAPS.bio));

    var banner = root.querySelector("[data-slot=banner]");
    if (banner) {
      while (banner.firstChild) banner.removeChild(banner.firstChild);
      var slots = theme.slots && theme.slots.profile ? theme.slots.profile : {};
      var texture = slots.background_texture;
      var textureSrc = texture ? asset(texture.src, ["png", "webp"]) : "";
      if (textureSrc) {
        var overlay = document.createElement("img");
        overlay.className = "texture";
        overlay.setAttribute("src", themeUrl(textureSrc));
        overlay.setAttribute("alt", "");
        banner.appendChild(overlay);
      }
      var bannerSrc = profile.banner ? asset(profile.banner.src, ["png", "webp"]) : "";
      if (bannerSrc) {
        var pic = document.createElement("img");
        pic.className = "banner-art";
        pic.setAttribute("src", themeUrl(bannerSrc));
        pic.setAttribute("alt", clip(profile.banner.alt, CAPS.alt));
        banner.appendChild(pic);
      }
    }

    var avatar = root.querySelector("[data-slot=avatar-frame]");
    if (avatar) {
      while (avatar.firstChild) avatar.removeChild(avatar.firstChild);
      var frameSrc = profile.avatar_frame ? asset(profile.avatar_frame.src, ["svg", "png"]) : "";
      if (frameSrc) {
        var frame = document.createElement("img");
        frame.setAttribute("src", themeUrl(frameSrc));
        frame.setAttribute("alt", "");
        avatar.appendChild(frame);
      }
    }

    var panels = root.querySelector("[data-slot=panels]");
    var featuredTitle = root.querySelector("[data-field=featured-title]");
    var made = [];
    if (panels) {
      while (panels.firstChild) panels.removeChild(panels.firstChild);
      (profile.panels || []).forEach(function (panel) {
        if (!panel || !ICONS[panel.type]) {
          if (panel && panel.type === "featured_designs" && featuredTitle) text(featuredTitle, clip(panel.title || "", CAPS.title));
          return;
        }
        var node = panelElement(panel);
        panels.appendChild(node);
        made.push(node);
      });
    }
    if (global.TT && TT.revealPanels) TT.revealPanels(made);
  }

  var SITE_PROFILE = {
    artist: {
      name: "Artist name",
      bio: "Illustrator based in the US. Pencil, ink, one spot of colour."
    },
    profile: {
      banner: {
        src: "assets/themes/site-profile/banner_default_A_2400x600.webp",
        alt: "Default artist banner"
      },
      avatar_frame: { src: "assets/themes/site-profile/avatar_frame.svg" },
      panels: [
        { type: "about", title: "About", text: "Illustrator based in the US. Pencil, ink, one spot of colour." },
        { type: "links", title: "Links", text: "Portfolio and social links go here when the artist adds them." },
        { type: "commissions", title: "Commissions", text: "Open for 2 slots a month." },
        { type: "process_gallery", title: "Process", text: "Pencil sketch, inked, scanned, then coloured flat for DTG." },
        { type: "featured_designs", title: "Ember Crest" }
      ]
    }
  };

  function boot() {
    var root = document.querySelector("[data-layout=profile]");
    if (!root) return;
    var themeUrlAttr = document.documentElement.getAttribute("data-demo-theme");
    if (!themeUrlAttr) {
      renderProfile(root, SITE_PROFILE);
      document.documentElement.dataset.profile = "site";
      return;
    }
    fetch(themeUrlAttr).then(function (response) {
      if (!response.ok) throw new Error("theme");
      return response.json();
    }).then(function (theme) {
      renderProfile(root, theme);
      document.documentElement.dataset.profile = "ready";
    }).catch(function () {
      document.documentElement.dataset.profile = "error";
    });
  }

  global.TT = global.TT || {};
  global.TT.renderProfile = renderProfile;
  global.TT.themeCaps = CAPS;
  boot();
})(window);
