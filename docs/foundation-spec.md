# Tempered Tees site foundation spec (draft v0.5)
Forge, 2026-10-24 11:40 AM CT. v0.4 takes in Creative design-direction-v2 and Arthur's 11:30 AM rulings; v0.4.1 adds his 11:32 AM rulings H–J; v0.5 takes in Creative v2.1. The version history is in the _prev files.

**Ground rules.**
- **Hosting and tools:** static on GitHub Pages [G1]. Vanilla HTML, CSS and JS: no build step, no framework, no paid tools. No third-party requests, except that Shopify's scripts are allowed in the CSP **on selling pages only** (ruling A). Every other page keeps an all-`'self'` CSP.
- **Paul's earlier layout and placement asks are goals, not specs** (Arthur, 10-24). Nothing in the current pages is kept just because it exists.
- **Visual system:** Creative's design-direction-v2 owns it. This spec owns the structure that takes it in. No design-direction-v2 file exists in /workspace/venture yet (searched 11:15 AM CT).

## 1. One page frame
- **Shared shell:** every page (home, product, vault, artist, about) uses the same `frame.html` pattern. It contains:
  - `<header data-slot="nav">`
  - `<main data-layout="…">`
  - `<div data-slot="stage">`, the full-bleed area behind or under the content where forge elements mount
  - `<footer data-slot="legal">`
- **Layouts:** `data-layout` selects one of a few layouts defined in `layout.css`: `hero`, `product`, `grid`, `profile`, `prose`. Pages never write their own grid or spacing; they only fill slots.
- **One shared partial:** a single `frame.js` (no build) inserts nav and footer from `site.json`, so a link or footer change is made once.
- **About page (launch):** short. Brandy writes it, Creative styles it, Gatekeeper checks it.
- **Dependencies stay local:** pages keep working with JS off (content is in the HTML). Fonts are self-hosted; the splash already does this [G2].

## 2. One theme token file
- **Source of truth:** Creative's `creative/design-direction-v2.1/tokens/tt-theme.css` (v2.1; the only change from v2 is the @font-face asset path). This section **tracks Creative's latest version of that file**, which is still being revised (tokens and header) as of 10-24, 11:30 AM CT. Phase 1 copies it into the site as `assets/tokens.css`, with no renames. The names follow `--{group}-{role}[-{variant}]` (agreed with Creative).
- **Type:** 8 steps, `--text-step--1` to `--text-step-6`.
  - Reading steps are fixed: 13, 16, 20, 25 and 32 px.
  - The 3 largest are fluid `clamp()`: step-4 40–64 px, step-5 48–104 px, and step-6 56–160 px (the takeover artist name only).
  - Two fonts: Space Grotesk (display) and Inter (body). `--leading-*` and `--tracking-display` are also defined.
- **Grid:**
  - Under 768 px: 4 columns, 16 px gutter, 20 px margin.
  - From 768 px: 8 / 24 / 40.
  - From 1200 px: 12 / 32 / 64.
  - Container max 1312 px. Tokens: `--grid-cols`, `--gutter`, `--margin`, `--container`.
  - Also defined: `--space-1..9` (4–120 px), `--measure` 62ch and `--radius-1/2`.
- **Color:** **dark only** (`color-scheme: dark`), with no light/dark variants. The roles are bg, surface, text, text-muted, accent, accent-contrast, line, focus and link.
- **Motion:** `--dur-fast/dur/dur-slow` and `--ease-out/in-out`, all 0 ms under reduced motion.
  - Forge-element defaults (`--el-intensity` / `--el-speed`): **home .35 / .6, takeover .6 / .8, product 0**. Reduced motion means speed 0 and a still frame.
  - At most one element per page, never behind text or buttons (Creative Motion.md).
- **Artist-overridable tokens:**
  - every `--color-*` **except `--color-focus`**;
  - `--font-display`, from our site set (Space Grotesk, Inter) plus **22 curated OFL fonts** (Creative `design-direction-v2.1/Artist_Fonts.md`). The schema enum holds all 24.
    - The woff2 URLs in Artist_Fonts.md (jsDelivr/Fontsource) are **download sources only, never runtime references**. Each font is self-hosted with its OFL.txt next to it [G34].
    - Gatekeeper verifies every licence (ruling I).
    - Creative's usage rules apply: display steps 4–6 only; one font per artist; the name must fit in 2 lines at 390 px, or the takeover falls back to Space Grotesk.
  - all `--el-*`.
  - Everything else is locked: focus, body font, text steps, leading, spacing, grid, radius and motion durations/easings.
- **Header (all pages): layout H2** (Creative Logo_Header.md). The logo is on the left; Today's Drop, Vault, Artists and Cart are on the right. On phones it collapses to logo + Cart + menu. The header has no sound control (ruling H).
- **Logo:** the **L2 badge** (`logo/L2_badge.svg`, code-drawn and simplified from C_icon) is Creative's pick for the header, favicon and profile.
- **Sound (ruling H):** a small icon toggle inside the Quench hero only, off by default: a 40 px icon button with `aria-pressed`, bottom-left of the hero scene next to Replay (Creative v2.1). Creative updates their Motion.md rule 9 to match; Forge doesn't edit Creative's files.
- **Homepage hero:** concept **Quench (A)**, per Arthur. It needs no canvas; `<tt-fire>` is used only for the footer band in Phase 2 (Creative Alignment_Forge.md).

## 3. Drop-day takeover slot
- **What it is:** for 24 h the home `stage` and `hero` are filled from a drop record: `drops/<drop-id>.json`. It holds the artist display name, bio, links, design images, product ids and an optional `theme`.
- **Theme overrides:** an artist theme may override only an allowlisted subset of tokens (color, `--font-display`, `--el-*`) and choose forge elements. `--font-display` must come from our self-hosted OFL set plus a small curated list of free fonts (`assets/fonts/takeover/`, each with its licence file). Artists can't upload fonts. **Ruling D:** Creative proposes the curated list; Gatekeeper verifies each licence. Contrast is checked against WCAG AA when the theme loads; if it fails, the default theme is used.
- **Theme JSON schema:** `docs/themes/tt-theme.schema.json` (JSON Schema 2020-12) is the only copy; it isn't duplicated here. The sample is `docs/themes/demo-artist.json`. Artist theme sheets stay Phase 2 [G6].
  - `--font-display` is allowed only from an enum: `"Space Grotesk"` and `"Inter"` today, plus the 22 curated OFL fonts from Creative's Artist_Fonts.md, all self-hosted (rulings D and I). Gatekeeper still verifies the licences.
  - `--color-focus` and every locked token are rejected.
- **Window timing (Arthur 11:16):**
  - Drops go live automatically at **midnight CT** and run a **real 24 h**.
  - All times live in one file, `data/drops.json`, in the repo. Arthur sets them, Forge commits them, and Gatekeeper verifies each timer before the drop.
  - Pages switch state on the client by comparing `Date.now()` with the stored instants, so no deploy is needed at midnight.
  - **Ruling G:** Forge commits both the live and the ended version of each drop page ahead of time. Each shows the absolute start and end times, so crawlers and no-JS visitors see true times.
- **drops.json record:**
  - Fields: `{"id","artist_id","design_ids":[],"starts_at","ends_at","status_override":null|"sold_out"|"pulled","theme":"<theme id>|null"}`.
  - `starts_at` and `ends_at` are ISO 8601 with an explicit UTC offset. They're never local-time strings, and never derived from page load.
- **DST rule:** midnight CT is `-05:00` during CDT and `-06:00` during CST. Compute the offset with the America/Chicago zone rules. Never hand-type it.
  - Examples (checked with Python zoneinfo, 10-24): 2026-12-12 starts `2026-12-12T00:00:00-06:00` and ends `2026-12-13T00:00:00-06:00`.
  - A real 24 h that starts at the fall-back midnight (2026-11-01) ends at `2026-11-01T23:00:00-06:00`.
  - One that starts at the spring-forward midnight (2027-03-14) ends at `2027-03-15T01:00:00-05:00`.
  - **Ruling B:** no drop may start on a DST-change day (e.g. 2026-11-01, 2027-03-14). The scheduler and the check refuse those dates, so every drop is a real 24 h from midnight to midnight CT.
  - Gatekeeper's per-timer check (it can fail):
    - `ends_at − starts_at = 86400 s`;
    - `starts_at` and `ends_at` are both local 00:00 in America/Chicago;
    - the start date is not a DST-change day.

## 3a. Artist-customizable slots (off by default, unused at launch)
- **Where the slots are:** named slots on the **artist profile** page and the **product/selling** page:
  - `frame` (frame or border);
  - `background_texture`;
  - `accent_color`;
  - `header_art` (optional);
  - `motion_accent` (optional, one small element from the forge-elements engine, at intensity 0.5 or less).
- **Off by default:** if a slot is empty or the theme is absent, our default theme renders. There is no uploader UI; Forge hand-loads themes into `data/themes/` and `assets/themes/<id>/`.
- **Theme JSON:** it extends the takeover theme (§3) with a `slots` object holding `profile` and `selling`. Assets are artist-made SVG or PNG, from repo paths only, with per-slot size caps.
  - Schema: `docs/themes/tt-theme.schema.json` (JSON Schema 2020-12).
  - Sample: `docs/themes/demo-artist.json`. It has placeholder paths only and no artwork.
- **Drop day:** the same theme applies to the artist's selling page and the homepage takeover for that drop's 24 h.
- **Guardrails:**
  - **Safe zones:** slot assets render in layers that the layout clips away from the price, Add to Cart, the back control and legal text. Those elements sit above all slot layers and are never covered.
  - **Contrast:** checked automatically against WCAG ratios: 4.5:1 for body text and 3:1 for large text and UI, on every token pair the theme changes.
  - **Fallback:** the default theme loads if any asset fails validation, size, contrast or load.
  - **SVG:** validated and sanitized before commit: no `<script>`, no external refs (`href`/`xlink:href`/`url()` to anything but `#` ids), no `on*` handlers and no `<foreignObject>`. Rejected SVGs are not loaded.
- **Validation of the sample** (10-24, 11:28 AM CT): jsonschema 4.26.0 (venv), Draft 2020-12.
  - The schema passed `check_schema`, and `demo-artist.json` had **0 errors**.
  - A negative test (an external frame URL and a non-hex color) gave **2 errors**, as expected.

- **Channel-style artist profile (v0.3.2, off by default):** the theme JSON `profile` object holds:
  - `banner`: a wide banner slot;
  - `avatar_frame`: optional;
  - `panels`: an ordered list, 8 at most.
  - **Each panel has:**
    - `type`, one of `about`, `links`, `commissions`, `process_gallery` (work in progress) or `featured_designs`;
    - `title`, up to 40 characters;
    - `text`, optional, up to 300 characters;
    - `image`, optional, artist-made: a fixed width of 320 CSS px and a height of 80, 160, 240 or 320;
    - `link`, optional: https only, up to 200 characters, with `kind` set to shop, social, commissions or other.
  - **`featured_designs` is auto-filled from our catalog.** The schema forbids `items` and `link` on it, so artists can't inject products.
  - **Same rules as the other slots:** safe zones, SVG sanitizing, contrast check and default-theme fallback.
  - **Outbound links** render with `rel="noopener noreferrer"` Artist outside links open in a **new tab** (`target="_blank"`, `rel="noopener noreferrer"`). Our internal links stay in the same tab (Arthur, 11:30 AM).
- **Validation (11:30 AM CT):**
  - The sample gives 0 errors.
  - A broken copy gave 6 errors, as expected: a bad panel type (`twitch_chat`), 301-character text, a `javascript:` link, an injected `items` on featured_designs, and an external banner URL (which produced 2 errors).

- **v0.4 validation (11:40 AM CT, jsonschema 4.26.0):**
  - The sample gives 0 errors.
  - Each of these negative tests gave 1 error, as expected: a `--color-focus` override, an off-list font (`Comic Sans MS`), a locked `--space-4`, a bad panel type, 301-character text, and a `.webp` frame image.

- **v0.5 validation (11:45 AM CT):**
  - The sample gives 0 errors, and `--font-display: "Bebas Neue"` (curated) is accepted.
  - Rejected with 1 error each: Roboto Slab and Permanent Marker (Apache 2.0, dropped by Creative) and a `--color-focus` override.

## 4. Forge-element plug-in contract
- **What's being built:** fire is being built as a reusable `<tt-fire>` in cloud agent bc-9235242a (PR only, no merge) [G7]. Lava-over-rock, coals and embers follow on the same engine [G8].
- **Mount API:** each element is a custom element `<tt-{name}>`, or `TT.mount(name, el, opts)`, returning `{update(opts), pause(), resume(), destroy()}`. It owns one canvas inside its host and nothing else.
- **Inputs:** it reads the `--el-*` tokens from computed style on mount and on a `tt-theme-change` event. `opts`: `{intensity, speed, seed, region:"bottom"|"full"}`.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, it draws one still frame (or a static poster image of the same art) and runs no requestAnimationFrame loop.
- **Low-power fallback:** pause when `document.hidden` or when an IntersectionObserver says the element is off screen. Drop to a still if the frame budget is blown (e.g. more than 10 frames over 50 ms in the first 2 s), on `navigator.connection.saveData`, or when `deviceMemory <= 2`. These thresholds are proposals.
- **DPR caps:** canvas DPR is `min(devicePixelRatio, 2)` on desktop and 1.5 on coarse pointers. The splash embers already cap at 2 [G9].
- **Particle caps** scale with area, following today's 160 desktop / 40 phone embers [G9].
- **Budget:** each element is self-contained, under 30 KB gzip, with no network requests after load (proposed).

## 5. Store needs
- **Checkout (Arthur 11:16):** the site stays static on Pages, plus the Shopify Buy Button / Storefront API with Shopify-hosted checkout. Orders sync to Printful [G14]. A full Shopify theme is fallback only.
- **Shopify plan (checked 2026-10-24 11:25 AM CT):** the cheapest plan open to a new store is **Basic, $39/mo billed monthly or $29/mo billed yearly**. The pricing page also shows a promo: a 3-day trial, then $1/mo for 3 months. Sources: https://www.shopify.com/pricing (WebFetch); Basic lists "Build headless storefronts 1".
  - Buy Button: "The Buy Button sales channel is included in all Shopify subscription plans" (https://help.shopify.com/en/manual/online-sales-channels/buy-button).
  - The $5 Starter plan "isn't available to new stores" (https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan). A Shopify blog (May 2026) still says Starter is $5, which conflicts; the Help Center is newer and more specific.
  - **Ruling F:** Basic **billed monthly** ($39), not yearly, until sales prove it. Start only when the store is ready to sell, using the free trial first; the trial terms are re-verified at that time. Arthur asks; Paul's typed yes is required. $39/mo is about 26% of the $150/mo budget [G15].
  - **Ruling C:** the Storefront access token sits in the static page. Gatekeeper audits its scope before launch: read-only, least privilege.
- **Product view:** a big product view with tap or hover print zoom, served from a high-res mockup with `srcset`. At launch it uses **Printful mockups** (ruling E: Gatekeeper checks Printful's public-mockup terms before launch) of the actual print file. They are swapped for our own photos when the sample arrives. Never AI imagery (Paul's rule [G10]).
- **Blank:** Bella+Canvas 3001 only at launch [G11].
- **Print files:** transparent PNG only, with no background, **at least 4500×5400 px** (Arthur, 11:32 and 11:39 AM). The size and price table is rendered from one data file, not hand-typed.
- **Vault (Arthur 11:16):** a public archive of sold-out designs. Pages stay live and indexed. A design returns only by re-drop (fan stokes). "Never returns" is used only for designs the artist has retired: `retired:true` plus the date, in the design record.
- **Truthful timers:**
  - A timer is shown only if `ends_at` is in drops.json as committed and published. The end time comes from that file, never from page load time.
  - If `ends_at` is missing or in the past, there is no countdown: the page shows the actual state ("Sold out", "Ended").
  - The client clock is a known risk. Show the absolute end time ("Ends Sat Dec 12, 8:00 PM CT") alongside the countdown.
- **Checkout platform:** see open question 1. Pages stay static and link out.

## 6. Phased migration (each phase is a new version folder; frozen builds are never edited)
| Phase | Scope | Done when (check that can fail) |
|---|---|---|
| 0 | Creative design-direction-v2 lands; map its names to §2 | `grep -c` of every §2 token name in Creative's file = total; unmapped list is empty |
| 1 | tokens.css + frame + layout.css; rebuild splash v7.2.4 content as `home` on the frame (v8.0) | the go-live check on the new deploy folder reports `GO-LIVE STATUS … PASS` after signoff; `grep -E -- '--(ink\|straw\|heat\|hot)\b'` across assets = 0; 1440/1024/390 stills reviewed |
| 2 | `<tt-fire>` from bc-9235242a mounted in `stage`, replacing the `.fire` band | reduced-motion test shows 0 rAF calls; DPR test at dpr=3 shows canvas.width ≤ 2×CSS width; no 404s or outside requests |
| 3 | TT-SUB v1.7.4-review onto the same tokens.css and frame (new TT-SUB version; review intake logic untouched) | TT-SUB review_e2e suite passes (22/22 at v1.7.4 [G12]); `diff` of TT-SUB_Review_Intake.gs vs v1.7.4 is empty |
| 4 | product + vault + artist + about pages on the frame; product data + drops.json; truthful timer. Fan list + privacy page ship as their own release in this phase | a test drop JSON with `ends_at` in the past shows "Ended" and 0 countdown elements; one with no `ends_at` shows no timer |
| 5 | takeover slot + theme JSON (after the first drops) | a theme that fails AA contrast falls back to default (automated test); schema validation rejects unknown tokens |

## Open questions
- **Resolved:** 1–7 by Arthur (11:16 AM), A–G by Arthur (11:19 AM), and Creative's naming questions 8a–f via design-direction-v2/Answers_for_Forge.md (11:30 AM):
  - **(a)** names accepted;
  - **(b)** 8 steps, fixed reading sizes plus 3 fluid;
  - **(c)** grid 4/8/12;
  - **(d)** overridable token list as in §2;
  - **(e)** element defaults per page;
  - **(f)** dark only.
- **Resolved by Arthur (11:32 AM):**
  - **H.** No header sound. A small sound toggle sits inside the Quench hero only, off by default. Creative updates Motion.md rule 9.
  - **I.** Fonts are our OFL set plus about 20 curated OFL fonts, all self-hosted with no external font calls. Creative picks them; Gatekeeper verifies the licences.
  - **J.** Approved as written: panel types live under `profile`; `.webp` is allowed for raster images only; frames are either CSS or `.svg`/`.png`.
- **Still open:** none. The curated font list arrived in Creative v2.1 (22 fonts); Gatekeeper still verifies the licences.

## Needs Gatekeeper verify
- [G1] Both sites are on GitHub Pages (CURRENT.md Founder Facts).
- [G2] Splash fonts are self-hosted with no outside requests (my v7.2.4 server test, 10-23).
- [G3] TT-SUB v1.7.4 tokens.css zeroes durations under reduced motion.
- [G4] Splash token names (splash.css `:root`).
- [G5] TT-SUB `--tt-*` tokens from Design_System.md, v1 2026-10-16.
- [G6] Artist theme sheet parked to Phase 2 (sessions/2026-10-24.md 11:12).
- [G7] `<tt-fire>` in bc-9235242a, PR only (decisions.md 11:10).
- [G8] Element order is fire, then lava-over-rock, coals, embers (2026-10-24.md 11:12).
- [G9] Splash ember caps of 160/40 and DPR cap of 2 (splash.js lines 13–18).
- [G10] No AI imagery on public TT surfaces (CURRENT.md hard rules).
- [G11] Bella+Canvas 3001 only (CURRENT.md fulfillment line).
- [G12] review_e2e 22/22 at v1.7.4 (sessions/2026-10-23.md 17:56).
- [G13] Shopify is named in CURRENT.md (stress test line) and the research/tee/Shopify_Launch_Runbook reference.
- [G14] Shopify-hosted checkout synced with Printful (Arthur ruling 10-24 11:16; the Printful–Shopify integration is not verified here).
- [G15] Shopify Basic $39/mo monthly or $29/mo yearly; Buy Button on all plans; Starter closed to new stores (URLs in §5, checked 10-24).
- [G16] DST instants for America/Chicago (Python zoneinfo, 10-24): 2026-11-01 fall back, 2027-03-14 spring forward.
- [G17] Storefront token scope audit (ruling C): read-only, least privilege, before launch.
- [G18] Printful's public-mockup terms for the site and vault (ruling E), before launch.
- [G19] Licence of every curated takeover font (ruling D).
- [G20] The drop-date check refuses DST-change days and enforces 00:00–00:00 CT = 86400 s (ruling B). Test with 2026-11-01 and 2027-03-14, which must be refused.
- [G21] Shopify trial terms and Basic monthly price, re-checked on shopify.com when the store is ready (ruling F).
- [G22] The CSP on non-selling pages has no Shopify origins (ruling A).
- [G23] SVG validation and sanitizing (no scripts, no external refs, no event handlers, no foreignObject), with a test SVG for each banned feature that must be rejected.
- [G24] Slot safe zones: price, Add to Cart, the back control and legal text are never covered at 1440, 1024 and 390, with the demo theme filled with max-size placeholders.
- [G25] The contrast check fails a theme below WCAG 4.5:1 or 3:1, and the default theme loads instead.
- [G26] The theme schema rejects external or absolute asset URLs, and demo-artist.json validates (0 errors).
- [G27] Outbound links are https only; no `javascript:` or `data:` URLs (schema plus a render-time check).
- [G28] Every artist outside link has `target="_blank"` and `rel="noopener noreferrer"`; every internal link has no `target` (same tab).
- [G29] No tracking pixels or third-party image hosts: every panel, banner and avatar image is a repo path under assets/themes/.
- [G30] `featured_designs` is filled only from our catalog; a theme with `items` or `link` on it is rejected.
- [G31] Phase 0 grep: every §2 token name is present in Creative's tt-theme.css, and site `assets/tokens.css` is byte-identical to Creative's file at the version used.
- [G32] The schema accepts `--font-display` only from the enum, and rejects `--color-focus` and every locked token (negative tests on record in §3a).
- [G33] Print files are transparent PNGs, at least 4500×5400 px: PNG colour type 6 (RGBA), width ≥ 4500 and height ≥ 5400, every corner pixel at alpha 0, and transparent pixels make up a non-trivial share of the canvas. An opaque full-canvas background or an undersized file fails.
- [G34] No external font requests on any page (no fonts.googleapis.com or fonts.gstatic.com, etc.), and every curated font is OFL with its licence file self-hosted next to it.
- [G35] The 24-font schema enum matches Artist_Fonts.md (22) plus the site set (2) exactly; each self-hosted woff2 has its OFL.txt; no page references cdn.jsdelivr.net or any other font host at runtime.
