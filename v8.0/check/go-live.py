#!/usr/bin/env python3
"""Go-live check for the v8.0 deploy folder.

Prints `GO-LIVE STATUS: PASS` when the automated checks pass.
Human signoff is reported separately and is not invented.
Drop instants are computed with zoneinfo America/Chicago. Offsets are not typed.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
CT = ZoneInfo("America/Chicago")
TOKENS_SHA256 = "7fca022245fc6687c827efa1a0386bf3f146f38a5b3a72c883ab9f2e2fefdcd0"
PAGES = ("index.html", "product.html", "vault.html", "artist.html", "about.html", "cart.html")
DEMO_PAGE = REPO / "_demo" / "artist.html"
PUBLISHED_BAN = ("example.com", "demo-artist")
LAYOUTS = {
    "index.html": "hero",
    "product.html": "product",
    "vault.html": "grid",
    "artist.html": "profile",
    "about.html": "prose",
    "cart.html": "prose",
}
OLD_TOKEN = re.compile(r"--(ink|straw|heat|hot)\b")
IBF = re.compile(r"iron\s*bishop|\bIBF\b", re.I)
URL = re.compile(r"https?://", re.I)
FORBIDDEN_DOM = ("innerHTML", "insertAdjacentHTML", "document.write", "createContextualFragment", "DOMParser")
H2_NOTE = "Artist SVGs render only via <img src>. An allowlist sanitizer runs at hand-load time."


def lin(channel: int) -> float:
    c = channel / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def is_dst_change(day: date) -> bool:
    start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=CT)
    end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=CT)
    return start.utcoffset() != end.utcoffset()


def load_drops_check():
    path = REPO / "docs" / "tools" / "drops_check.py"
    spec = importlib.util.spec_from_file_location("drops_check", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("drops_check.py missing")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def strip_js_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"(^|[^:])//.*?$", r"\1", text, flags=re.M)
    return text


def token_pairs() -> dict[str, str]:
    css = (ROOT / "assets" / "tokens.css").read_text(encoding="utf-8")
    found = dict(re.findall(r"(--color-[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})", css))
    return found


def main() -> int:
    failures: list[str] = []

    tokens = ROOT / "assets" / "tokens.css"
    digest = hashlib.sha256(tokens.read_bytes()).hexdigest()
    if digest != TOKENS_SHA256:
        failures.append("tokens.css is not the Creative v2.2 file")

    asset_hits = []
    for path in (ROOT / "assets").rglob("*"):
        if path.is_file() and path.suffix in {".css", ".js", ".html", ".svg", ".json"}:
            for i, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                if OLD_TOKEN.search(line):
                    asset_hits.append(f"{path.relative_to(ROOT)}:{i}")
    if asset_hits:
        failures.append("old token names in v8.0/assets: " + ", ".join(asset_hits))

    runtime_suffixes = {".html", ".css", ".js", ".svg", ".json"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in runtime_suffixes:
            continue
        if "check" in path.parts:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if IBF.search(text):
            failures.append(f"IBF name in {path.relative_to(ROOT)}")
        scanned = text.replace('xmlns="http://www.w3.org/2000/svg"', "")
        if URL.search(scanned):
            failures.append(f"external URL in {path.relative_to(ROOT)}")

    for name in PAGES:
        page = ROOT / name
        if not page.exists():
            failures.append(f"missing {name}")
            continue
        text = page.read_text(encoding="utf-8")
        if 'data-slot="nav"' not in text or 'data-slot="stage"' not in text or 'data-slot="legal"' not in text:
            failures.append(f"{name} is missing a frame slot")
        if f'data-layout="{LAYOUTS[name]}"' not in text:
            failures.append(f"{name} layout is not {LAYOUTS[name]}")
        if "default-src 'self'" not in text or "shopify" in text.lower():
            failures.append(f"{name} CSP is not all-self")
        if "Ends tonight" in text or "11:59" in text or "Last chance" in text or "Forge on Fire" in text:
            failures.append(f"{name} types a drop label or a re-drop name")
        if '<meta name="robots" content="noindex,nofollow">' not in text:
            failures.append(f"{name} is missing noindex,nofollow until launch")
        for banned in PUBLISHED_BAN:
            if banned in text:
                failures.append(f"{name} is a published page and contains {banned}")
        if "fonts.googleapis" in text or "cdn." in text:
            failures.append(f"{name} references an external host")
        if re.search(r'(href|src)="/', text):
            failures.append(f"{name} uses a root-absolute path")

    artist = (ROOT / "artist.html").read_text(encoding="utf-8")
    for slot in ("banner", "avatar-frame", "panels", "stage"):
        if f'data-slot="{slot}"' not in artist:
            failures.append(f"artist page is missing {slot}")
    if "fire_band" in artist or 'class="fire"' in artist or "flame.svg" in artist:
        failures.append("artist page has a flame strip")
    if H2_NOTE not in artist:
        failures.append("artist page is missing the SVG hand-load note")
    if "Earns a royalty on each paid sale, under our artist agreement." not in artist:
        failures.append("royalty line is missing or not exact")
    artist_markup = re.sub(r"<!--.*?-->", "", artist, flags=re.S)
    if artist_markup.count("<img") != 1:
        failures.append("artist page should show only the header logo in the static HTML")
    if artist_markup.count("<svg") != 1 or 'id="panel-stroke"' not in artist:
        failures.append("artist page inline SVG must be only the site outline template")
    second = REPO / "docs" / "tools" / "svg_second_pass.py"
    svgs = sorted(str(p) for p in (ROOT / "assets").rglob("*.svg"))
    svgs += sorted(str(p) for p in (REPO / "_demo").rglob("*.svg"))
    if second.exists() and svgs:
        run = subprocess.run([sys.executable, str(second), *svgs], capture_output=True, text=True)
        if run.returncode != 0:
            failures.append("svg second pass failed: " + (run.stdout or run.stderr).strip())

    js_blob = "\n".join(strip_js_comments(p.read_text(encoding="utf-8")) for p in (ROOT / "assets").glob("*.js"))
    for token in FORBIDDEN_DOM:
        if token in js_blob:
            failures.append(f"frame script uses {token}")
    if "textContent" not in (ROOT / "assets" / "theme-text.js").read_text(encoding="utf-8"):
        failures.append("theme text renderer does not use textContent")
    if H2_NOTE not in (ROOT / "assets" / "theme-text.js").read_text(encoding="utf-8"):
        failures.append("theme text renderer is missing the SVG hand-load note")
    badge = (ROOT / "assets" / "logo" / "L2_badge.svg").read_text(encoding="utf-8")
    if re.search(r"todo", badge, re.I):
        failures.append("L2 badge still has a TODO")
    sources = (REPO / "ASSET_SOURCES.md").read_text(encoding="utf-8")
    if "C_icon.svg" not in sources or "non-AI" not in sources or "Asset_Provenance.md" not in sources:
        failures.append("ASSET_SOURCES.md is missing the L2 source")

    for day, refused in (
        (date(2026, 11, 1), True),
        (date(2027, 3, 14), True),
        (date(2027, 11, 7), True),
        (date(2026, 12, 12), False),
        (date(2026, 10, 24), False),
    ):
        if is_dst_change(day) != refused:
            failures.append(f"DST check wrong for {day.isoformat()}")
    drops_path = ROOT / "data" / "drops.json"
    if not drops_path.exists():
        failures.append("data/drops.json missing")
    else:
        saved = json.loads(drops_path.read_text(encoding="utf-8"))
        drops = saved.get("drops")
        if not isinstance(drops, list) or len(drops) != 1:
            failures.append("drops.json must hold one placeholder drop")
        else:
            drop = drops[0]
            start = datetime.fromisoformat(drop["starts_at"])
            end = datetime.fromisoformat(drop["ends_at"])
            if (end + timedelta(seconds=1) - start).total_seconds() != 86400:
                failures.append("placeholder LIVE day is not 86400 s in UTC")
            today = datetime.now(CT).date()
            if start.astimezone(CT).date() == today:
                failures.append("placeholder drop falls on today and can claim Ends tonight")
            if any(drop.get(key) is not None for key in ("live_price", "vault_price")):
                failures.append("placeholder prices must stay null until a real drop is published")
            if any(key.startswith("last_chance") for key in drop):
                failures.append("placeholder drop has a last-chance field while the flag is off")
            features = json.loads((REPO / "docs" / "data" / "features.json").read_text(encoding="utf-8"))
            if features.get("last_chance") is not False:
                failures.append("features.json last_chance must be off")
            checker = load_drops_check()
            flag = checker.load_features(str(REPO / "docs" / "data" / "features.json"))
            if flag.get("last_chance"):
                failures.append("drops_check loaded last_chance as on")
            errors = checker.check(drop, publish=False, features=flag)
            if errors:
                failures.append("drops_check.py: " + "; ".join(errors))
            if not checker.check(drop, publish=True, features=flag):
                failures.append("drops_check.py --publish did not block null prices")
            banned = dict(drop)
            banned["status_override"] = "last_chance"
            if not checker.check(banned, publish=False, features=flag):
                failures.append("drops_check did not reject status_override last_chance")
            cli = subprocess.run([sys.executable, str(REPO / "docs" / "tools" / "drops_check.py"), str(drops_path)], capture_output=True, text=True)
            if cli.returncode != 0:
                failures.append("drops_check.py CLI failed: " + (cli.stdout or cli.stderr).strip())

    colors = token_pairs()
    pairs = [
        ("text", "bg", 4.5),
        ("text", "surface", 4.5),
        ("text-muted", "bg", 4.5),
        ("text-muted", "surface", 4.5),
        ("accent-contrast", "accent", 4.5),
        ("link", "bg", 4.5),
        ("focus", "bg", 3.0),
    ]
    contrast_lines = []
    for fg, bg, minimum in pairs:
        ratio = contrast(colors[f"--color-{fg}"], colors[f"--color-{bg}"])
        contrast_lines.append(f"{fg} on {bg}: {ratio:.2f}:1")
        if ratio < minimum:
            failures.append(f"contrast {fg} on {bg} is {ratio:.2f}, need {minimum}")

    if not DEMO_PAGE.exists() or "noindex" not in DEMO_PAGE.read_text(encoding="utf-8"):
        failures.append("demo artist page is missing or is not noindex")
    if DEMO_PAGE.exists() and "v8.0" in DEMO_PAGE.parts:
        failures.append("demo artist page is inside the deploy folder")
    if any(path.name == "demo-artist" for path in ROOT.rglob("*")):
        failures.append("demo-artist assets are inside the v8.0 deploy folder")
    for banned_name in ("tee_1800.webp", "crumpled_02_2x.webp", "crumpled_03_2x.webp", "print.svg"):
        hits = [str(path.relative_to(REPO)) for path in REPO.rglob(banned_name)]
        if hits:
            failures.append(f"{banned_name} is in the tree ({', '.join(hits)}); Paul's photos and the placeholder print stay out of the deploy")
    states = subprocess.run(["node", str(ROOT / "check" / "drop-states.mjs")], capture_output=True, text=True)
    print(states.stdout.strip())
    if states.returncode != 0:
        failures.append("drop state machine tests failed")
        if states.stderr.strip():
            print(states.stderr.strip())
    if "checkout-match: PENDING" not in states.stdout:
        failures.append("G20 checkout-match pending note is missing")
    sanitize = subprocess.run(["node", str(REPO / "docs" / "tools" / "test_sanitize.mjs")], capture_output=True, text=True)
    print(sanitize.stdout.strip())
    if sanitize.returncode != 0:
        failures.append("svg sanitizer test failed: " + (sanitize.stderr or sanitize.stdout).strip())
    if "nofollow" in (ROOT / "assets" / "profile.js").read_text(encoding="utf-8") or "ugc" in (ROOT / "assets" / "profile.js").read_text(encoding="utf-8"):
        failures.append("artist links must not add nofollow or ugc")

    frozen = REPO / "assets" / "splash.css"
    frozen_hits = len(OLD_TOKEN.findall(frozen.read_text(encoding="utf-8"))) if frozen.exists() else 0

    print("deploy: v8.0")
    print("token sha256:", digest)
    print("old token names in v8.0/assets:", len(asset_hits))
    print("frozen splash.css old token names (not part of this deploy):", frozen_hits)
    print("contrast:")
    for line in contrast_lines:
        print(" ", line)
    print("signoff: NOT RECORDED")
    print('GO_LIVE checklist: remove <meta name="robots" content="noindex,nofollow"> from every v8.0 page at launch.')
    if failures:
        print("GO-LIVE STATUS: FAIL")
        for item in failures:
            print(" -", item)
        return 1
    print("GO-LIVE STATUS: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
