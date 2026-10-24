import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire("/tmp/pw/package.json");
const { chromium } = require("playwright-core");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = process.env.SHOT_DIR || "/opt/cursor/artifacts/phase1";
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  ["home", "index.html"],
  ["product", "product.html"],
  ["vault", "vault.html"],
  ["artist", "artist.html"],
  ["about", "about.html"],
];
const widths = [1440, 1024, 390];
const base = process.env.BASE || "http://127.0.0.1:8765/v8.0/";
const payload = '<img src=x onerror=alert(1)>';

function lin(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const report = { pages: [], keyboard: {}, h1: {}, contrast: {}, reducedMotion: {}, failures: [] };

function fail(msg) {
  report.failures.push(msg);
  console.error("FAIL", msg);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function open(width, file, reduced, url) {
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 900 }, deviceScaleFactor: 1 });
  if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
  const external = [];
  const bad = [];
  const consoleErrors = [];
  page.on("request", (req) => {
    const host = new URL(req.url()).hostname;
    if (host !== "127.0.0.1" && host !== "localhost") external.push(req.url());
  });
  page.on("response", (res) => {
    if (res.status() >= 400) bad.push(res.status() + " " + res.url());
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(url || base + file, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.frame === "ready");
  const demoProfile = Boolean(url && url.includes("/_demo/"));
  if (demoProfile) {
    await page.waitForFunction(() => document.documentElement.dataset.profile === "ready");
    await page.evaluate(async () => {
      const panels = [...document.querySelectorAll(".panel")];
      for (const panel of panels) {
        panel.scrollIntoView({ block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForFunction(() => {
      const panels = [...document.querySelectorAll(".panel")];
      if (panels.length !== 4) return false;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
      return panels.every((panel) => Number(panel.style.getPropertyValue("--r")) >= 0.99);
    });
  }
  await page.evaluate(() => document.fonts.ready);
  return { page, external, bad, consoleErrors };
}

for (const [name, file] of pages) {
  for (const width of widths) {
    const session = await open(width, file);
    const label = await session.page.locator("[data-drop-label]").count()
      ? await session.page.locator("[data-drop-label]").first().textContent()
      : null;
    const overflow = await session.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    const shot = path.join(outDir, `${name}_${width}.png`);
    await session.page.screenshot({ path: shot, fullPage: true });
    const row = {
      name, width, file, label, overflow,
      external: session.external, bad: session.bad, consoleErrors: session.consoleErrors,
      shot,
    };
    report.pages.push(row);
    if (session.external.length) fail(`${name} ${width} external requests: ${session.external.join(", ")}`);
    if (session.bad.length) fail(`${name} ${width} bad responses: ${session.bad.join(", ")}`);
    if (session.consoleErrors.length) fail(`${name} ${width} console: ${session.consoleErrors.join(" | ")}`);
    if (overflow) fail(`${name} ${width} horizontal overflow`);
    const price = await session.page.locator("[data-drop-price]").count()
      ? await session.page.locator("[data-drop-price]").first().textContent()
      : null;
    row.price = price;
    if ((name === "home" || name === "product") && label !== "Starts Sat, Dec 12, 12:00 AM CT") {
      fail(`${name} ${width} drop label ${JSON.stringify(label)}`);
    }
    if (label && /tonight|Last chance/i.test(label)) fail(`${name} ${width} claims a live window ${JSON.stringify(label)}`);
    if (price) fail(`${name} ${width} showed a price ${JSON.stringify(price)}`);
    await session.page.close();
  }
}

{
  const session = await open(390, "index.html");
  await session.page.locator(".menu").click();
  await session.page.screenshot({ path: path.join(outDir, "home_390_menu.png"), fullPage: true });
  const expanded = await session.page.locator(".menu").getAttribute("aria-expanded");
  if (expanded !== "true") fail("menu button aria-expanded was not true");
  await session.page.close();
}

async function tabNames(page, count) {
  const names = [];
  for (let i = 0; i < count; i += 1) {
    await page.keyboard.press("Tab");
    names.push(await page.evaluate(() => {
      const el = document.activeElement;
      const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
      return text.slice(0, 80);
    }));
  }
  return names;
}

{
  const session = await open(1440, "index.html");
  const names = await tabNames(session.page, 6);
  report.keyboard.desktop = names;
  const expected = ["Skip to content", "TEMPERED TEES", "Today's Drop", "Vault", "Artists", "Cart"];
  if (names.join(" > ") !== expected.join(" > ")) fail(`desktop tab order ${names.join(" > ")}`);
  const menuVisible = await session.page.locator(".menu").isVisible();
  if (menuVisible) fail("menu button visible at 1440");
  await session.page.close();
}

{
  const session = await open(390, "index.html");
  const names = await tabNames(session.page, 4);
  report.keyboard.phone = names;
  const expected = ["Skip to content", "TEMPERED TEES", "Cart", "Menu"];
  if (names.join(" > ") !== expected.join(" > ")) fail(`phone tab order ${names.join(" > ")}`);
  await session.page.keyboard.press("Enter");
  const after = await session.page.evaluate(() => {
    const el = document.activeElement;
    return {
      text: (el.textContent || "").replace(/\s+/g, " ").trim(),
      expanded: document.querySelector(".menu").getAttribute("aria-expanded"),
    };
  });
  report.keyboard.phoneOpen = after;
  if (after.expanded !== "true" || after.text !== "Today's Drop") fail(`menu open focus ${JSON.stringify(after)}`);
  await session.page.keyboard.press("Tab");
  const next = await session.page.evaluate(() => document.activeElement.textContent.replace(/\s+/g, " ").trim());
  if (next !== "Vault") fail(`menu tab next was ${next}`);
  await session.page.keyboard.press("Escape");
  const closed = await session.page.evaluate(() => ({
    expanded: document.querySelector(".menu").getAttribute("aria-expanded"),
    label: document.activeElement.getAttribute("aria-label"),
  }));
  report.keyboard.phoneEscape = closed;
  if (closed.expanded !== "false" || closed.label !== "Menu") fail(`escape close ${JSON.stringify(closed)}`);
  await session.page.close();
}

{
  const session = await open(1440, "index.html");
  const h1 = await session.page.evaluate((payload) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    window.TT.renderThemeText(el, payload);
    const result = {
      text: el.textContent,
      images: el.querySelectorAll("img").length,
      onerrorNodes: el.querySelectorAll("[onerror]").length,
      childElements: el.childElementCount,
      escaped: el.innerHTML.includes("<img") ? false : el.innerHTML.includes("&lt;img"),
    };
    el.remove();
    return result;
  }, payload);
  report.h1 = h1;
  if (h1.text !== payload || h1.images !== 0 || h1.onerrorNodes !== 0 || h1.childElements !== 0 || !h1.escaped) {
    fail(`H1 payload rendered as HTML ${JSON.stringify(h1)}`);
  }
  await session.page.close();
}

{
  const session = await open(1440, "artist.html");
  const fallback = await session.page.evaluate(() => {
    const avatar = getComputedStyle(document.querySelector(".avatar")).backgroundColor;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--theme-accent").trim();
    const probe = document.createElement("div");
    probe.className = "panel";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "scr");
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    svg.appendChild(rect);
    probe.appendChild(svg);
    document.body.appendChild(probe);
    const stroke = getComputedStyle(rect).stroke;
    probe.remove();
    return {
      avatar,
      accent,
      stroke,
      bio: document.querySelector("[data-field=bio]").textContent,
      profile: document.documentElement.dataset.profile || "",
    };
  });
  report.reveal = { published: fallback };
  if (fallback.avatar !== "rgb(232, 100, 44)" || fallback.stroke !== "rgb(232, 100, 44)" || fallback.accent !== "") {
    fail(`reveal fallback was not red #E8642C ${JSON.stringify(fallback)}`);
  }
  if (fallback.bio !== "" || fallback.profile) fail(`published artist rendered a demo theme ${JSON.stringify(fallback)}`);
  await session.page.close();
}

const demoBase = "http://127.0.0.1:8765/_demo/artist.html";
for (const width of widths) {
  const session = await open(width, "artist.html", false, demoBase);
  const shot = path.join(outDir, `artist_demo_${width}.png`);
  await session.page.screenshot({ path: shot, fullPage: true });
  report.pages.push({
    name: "artist-demo",
    width,
    shot,
    external: session.external,
    bad: session.bad,
    consoleErrors: session.consoleErrors,
  });
  if (session.external.length) fail(`artist-demo ${width} external requests: ${session.external.join(", ")}`);
  if (session.bad.length) fail(`artist-demo ${width} bad responses: ${session.bad.join(", ")}`);
  if (session.consoleErrors.length) fail(`artist-demo ${width} console: ${session.consoleErrors.join(" | ")}`);
  const overflow = await session.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) fail(`artist-demo ${width} horizontal overflow`);
  await session.page.close();
}

{
  const session = await open(1440, "artist.html", false, demoBase);
  const gold = await session.page.evaluate(() => {
    const stroke = getComputedStyle(document.querySelector(".panel svg.scr rect")).stroke;
    const avatar = getComputedStyle(document.querySelector(".avatar")).backgroundColor;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--theme-accent").trim();
    const links = [...document.querySelectorAll(".panel a")].map((a) => ({
      href: a.getAttribute("href"),
      rel: a.getAttribute("rel"),
      target: a.getAttribute("target"),
    }));
    return {
      stroke,
      avatar,
      accent,
      links,
      bio: document.querySelector("[data-field=bio]").textContent,
      panels: document.querySelectorAll(".panel").length,
    };
  });
  report.reveal.demo = gold;
  if (gold.stroke !== "rgb(217, 180, 90)" || gold.avatar !== "rgb(217, 180, 90)" || gold.accent.toUpperCase() !== "#D9B45A") {
    fail(`reveal accent was not gold #D9B45A ${JSON.stringify(gold)}`);
  }
  if (gold.panels !== 4) fail(`demo panels ${gold.panels}`);
  if (!gold.links.length || gold.links.some((link) => link.rel !== "noopener noreferrer" || link.target !== "_blank" || !String(link.href).startsWith("https://"))) {
    fail(`artist link rel ${JSON.stringify(gold.links)}`);
  }
  if (gold.links.some((link) => /nofollow|ugc/.test(link.rel))) fail("nofollow or ugc was added");
  const bio = await session.page.evaluate((payload) => {
    const host = document.createElement("main");
    ["name", "bio"].forEach((field) => {
      const node = document.createElement(field === "name" ? "h1" : "p");
      node.setAttribute("data-field", field);
      host.appendChild(node);
    });
    ["banner", "avatar-frame", "panels"].forEach((slot) => {
      const node = document.createElement("div");
      node.setAttribute("data-slot", slot);
      host.appendChild(node);
    });
    const featured = document.createElement("h2");
    featured.setAttribute("data-field", "featured-title");
    host.appendChild(featured);
    window.TT.renderProfile(host, {
      artist: { name: payload, bio: payload, links: [] },
      tokens: {},
      profile: {
        panels: [
          { type: "about", title: payload, text: payload },
          { type: "featured_designs", title: payload },
        ],
      },
    });
    const bioNode = host.querySelector("[data-field=bio]");
    return {
      bio: bioNode.textContent,
      title: host.querySelector(".panel h3").textContent,
      name: host.querySelector("[data-field=name]").textContent,
      featured: host.querySelector("[data-field=featured-title]").textContent,
      onerrorNodes: host.querySelectorAll("[onerror]").length,
      bioElements: bioNode.childElementCount,
      liveBio: document.querySelector("[data-layout=profile] [data-field=bio]").textContent,
      liveChildren: document.querySelector("[data-layout=profile] [data-field=bio]").childElementCount,
    };
  }, payload);
  report.h1.bio = bio;
  if (bio.bio !== payload || bio.title !== payload || bio.name !== payload || bio.featured !== payload || bio.onerrorNodes !== 0 || bio.bioElements !== 0) {
    fail(`H1 bio payload did not stay literal ${JSON.stringify(bio)}`);
  }
  if (bio.liveBio !== "Placeholder bio for testing the theme loader. Not a real artist." || bio.liveChildren !== 0) {
    fail(`live bio was not plain text ${JSON.stringify(bio.liveBio)}`);
  }
  const capped = await session.page.evaluate(() => {
    const big = "B".repeat(20000);
    const host = document.createElement("main");
    host.setAttribute("data-layout", "profile");
    host.style.width = "320px";
    const bioNode = document.createElement("p");
    bioNode.setAttribute("data-field", "bio");
    host.appendChild(bioNode);
    const panels = document.createElement("div");
    panels.setAttribute("data-slot", "panels");
    host.appendChild(panels);
    document.body.appendChild(host);
    window.TT.renderProfile(host, {
      artist: { name: big, bio: big },
      tokens: {},
      profile: { panels: [{ type: "about", title: big, text: big }] },
    });
    const bioEl = host.querySelector("[data-field=bio]");
    const textEl = host.querySelector(".panel .pb p");
    const titleEl = host.querySelector(".panel h3");
    const result = {
      bio: bioEl.textContent.length,
      name: host.querySelector("[data-field=name]") ? host.querySelector("h1").textContent.length : 0,
      title: titleEl.textContent.length,
      text: textEl.textContent.length,
      children: bioEl.childElementCount,
      wrap: getComputedStyle(bioEl).overflowWrap,
      overflow: bioEl.scrollWidth > host.clientWidth + 1,
    };
    host.remove();
    return result;
  });
  report.h1.cap = capped;
  if (capped.bio !== 600 || capped.title !== 40 || capped.text !== 300 || capped.children !== 0 || capped.overflow) {
    fail(`20k bio was not clipped ${JSON.stringify(capped)}`);
  }
  if (capped.wrap !== "anywhere") fail(`bio overflow-wrap ${capped.wrap}`);
  const computed = await session.page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const muted = getComputedStyle(document.querySelector(".pf-sub"));
    const link = getComputedStyle(document.querySelector(".panel .pb a"));
    return {
      text: body.color,
      bg: body.backgroundColor,
      muted: muted.color,
      link: link.color,
    };
  });
  report.contrast.computed = computed;
  const pairs = [
    ["text/bg", computed.text, computed.bg],
    ["muted/bg", computed.muted, computed.bg],
    ["link/bg", computed.link, computed.bg],
  ];
  report.contrast.ratios = {};
  for (const [name, fg, bg] of pairs) {
    const ratio = contrast(fg, bg);
    report.contrast.ratios[name] = Number(ratio.toFixed(2));
    if (ratio < 4.5) fail(`computed contrast ${name} ${ratio.toFixed(2)}`);
  }
  await session.page.close();
}

{
  const session = await open(1440, "index.html", true);
  report.reducedMotion = await session.page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      dur: style.getPropertyValue("--dur").trim(),
      durFast: style.getPropertyValue("--dur-fast").trim(),
      durSlow: style.getPropertyValue("--dur-slow").trim(),
      speed: style.getPropertyValue("--el-speed").trim(),
    };
  });
  const motion = report.reducedMotion;
  if (motion.dur !== "0ms" || motion.durFast !== "0ms" || motion.durSlow !== "0ms" || motion.speed !== "0") {
    fail(`reduced motion tokens ${JSON.stringify(motion)}`);
  }
  if (session.consoleErrors.length) fail(`reduced motion console ${session.consoleErrors.join(" | ")}`);
  await session.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
const reportPath = path.join(outDir, "report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, failures: report.failures, keyboard: report.keyboard, h1: report.h1, contrast: report.contrast.ratios, reducedMotion: report.reducedMotion, shots: report.pages.map((p) => p.shot) }, null, 2));
process.exit(report.passed ? 0 : 1);
