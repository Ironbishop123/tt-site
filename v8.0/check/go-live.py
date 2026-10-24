#!/usr/bin/env python3
"""Go-live check for the v8.0 deploy folder.

Prints `GO-LIVE STATUS: PASS` when the automated checks pass.
Human signoff is reported separately and is not invented.
Drop instants are computed with zoneinfo America/Chicago. Offsets are not typed.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
CT = ZoneInfo("America/Chicago")
TOKENS_SHA256 = "7fca022245fc6687c827efa1a0386bf3f146f38a5b3a72c883ab9f2e2fefdcd0"
PLACEHOLDER_DAY = date(2026, 10, 24)
PAGES = ("index.html", "product.html", "vault.html", "artist.html", "about.html", "cart.html")
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


def iso(moment: datetime) -> str:
    return moment.isoformat()


def window_for(day: date) -> tuple[str, str]:
    start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=CT)
    end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=CT)
    return iso(start), iso(end)


def is_dst_change(day: date) -> bool:
    start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=CT)
    end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=CT)
    return start.utcoffset() != end.utcoffset()


def placeholder_record() -> dict:
    if is_dst_change(PLACEHOLDER_DAY):
        raise SystemExit("placeholder day is a DST-change day")
    starts, ends = window_for(PLACEHOLDER_DAY)
    return {
        "id": "placeholder",
        "artist_id": None,
        "design_ids": [],
        "starts_at": starts,
        "ends_at": ends,
        "status_override": None,
        "theme": None,
        "placeholder": True,
    }


def write_drops() -> None:
    payload = {"zone": "America/Chicago", "drops": [placeholder_record()]}
    path = ROOT / "data" / "drops.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def strip_js_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"(^|[^:])//.*?$", r"\1", text, flags=re.M)
    return text


def token_pairs() -> dict[str, str]:
    css = (ROOT / "assets" / "tokens.css").read_text(encoding="utf-8")
    found = dict(re.findall(r"(--color-[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})", css))
    return found


def main() -> int:
    if "--write-drops" in sys.argv:
        write_drops()
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
        if "Ends tonight" in text or "11:59" in text:
            failures.append(f"{name} types a drop label")
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
    if "PROV record" not in (ROOT / "assets" / "logo" / "L2_badge.svg").read_text(encoding="utf-8"):
        failures.append("L2 badge is missing the PROV TODO")

    for day, refused in ((date(2026, 11, 1), True), (date(2027, 3, 14), True), (date(2026, 12, 12), False), (PLACEHOLDER_DAY, False)):
        if is_dst_change(day) != refused:
            failures.append(f"DST check wrong for {day.isoformat()}")
    record = placeholder_record()
    drops_path = ROOT / "data" / "drops.json"
    if not drops_path.exists():
        failures.append("data/drops.json missing")
    else:
        saved = json.loads(drops_path.read_text(encoding="utf-8"))
        if saved.get("zone") != "America/Chicago" or saved.get("drops") != [record]:
            failures.append("drops.json does not match the Chicago window for the placeholder day")
        drop = saved["drops"][0]
        start = datetime.fromisoformat(drop["starts_at"])
        end = datetime.fromisoformat(drop["ends_at"])
        if (end - start).total_seconds() != 86399:
            failures.append("placeholder drop is not midnight through 23:59:59")
        if start.utcoffset() != start.astimezone(CT).utcoffset() or end.utcoffset() != end.astimezone(CT).utcoffset():
            failures.append("placeholder offset does not match America/Chicago")

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
    if failures:
        print("GO-LIVE STATUS: FAIL")
        for item in failures:
            print(" -", item)
        return 1
    print("GO-LIVE STATUS: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
