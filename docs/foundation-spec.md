# Tempered Tees site foundation spec (draft v0.2)
Forge, 2026-10-24 11:30 AM CT (v0.2 adds Arthur's 11:16 AM rulings on open questions 1-7). This is a spec only; there is no code yet. Later it goes in Ironbishop123/tt-site at docs/foundation-spec.md. Claims tagged [G#] are in the Gatekeeper list at the end.

**Ground rules.**
- **Hosting and tools:** static on GitHub Pages [G1]. Vanilla HTML, CSS and JS: no build step, no framework, no paid tools. No third-party requests except the Shopify script on pages that sell (see §5 and open question A).
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
- **One file:** `assets/tokens.css` is the only place values live. Components only read `var(--…)`. A theme (default or artist) is a set of overrides of these names.
- **Neutral, semantic names (draft):**
  - Color: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-contrast`, `--color-line`, `--color-focus`, `--color-link`.
  - Type: `--font-display`, `--font-body`, `--text-step--1 … --text-step-6` (a fluid scale), `--leading-tight`, `--leading-body`.
  - Spacing: `--space-1 … --space-9`, `--gutter`, `--measure`.
  - Motion: `--dur-fast`, `--dur`, `--dur-slow`, `--ease-out`, `--ease-in-out`. All durations become 0 under `prefers-reduced-motion`; TT-SUB tokens.css already does this [G3].
  - Element palette (fed to forge elements): `--el-core`, `--el-hot`, `--el-mid`, `--el-cool`, `--el-smoke`, `--el-intensity` (0–1), `--el-speed` (0–2).
- **Today's state:**
  - The splash uses ad-hoc names (`--ink`, `--straw`, `--heat`, `--hot`, …) [G4].
  - TT-SUB has `--tt-*` tokens from Design_System.md (2026-10-16) [G5].
  - Both are mapped into the new names in phase 1. Their current values are a starting point, not a requirement.

### Token naming: to align with Creative design-direction-v2 (draft)
- **Goal:** Creative's file maps 1:1 onto the names above, with no renames inside components.
- **Proposed rules:**
  - lowercase `--{group}-{role}[-{variant}]`;
  - groups are `color`, `font`, `text`, `leading`, `space`, `radius`, `shadow`, `dur`, `ease` and `el`;
  - roles are semantic (bg, accent), never hue names (straw, orange).
- **Extras:** if Creative ships extra groups (e.g. grid columns, `--radius-*`, `--shadow-*`), they are added to tokens.css under the same rules.

## 3. Drop-day takeover slot
- **What it is:** for 24 h the home `stage` and `hero` are filled from a drop record: `drops/<drop-id>.json`. It holds the artist display name, bio, links, design images, product ids and an optional `theme`.
- **Theme overrides:** an artist theme may override only an allowlisted subset of tokens (color, `--font-display`, `--el-*`) and choose forge elements. `--font-display` must come from our self-hosted OFL set plus a small curated list of free fonts (`assets/fonts/takeover/`, each with its licence file). Artists can't upload fonts. Contrast is checked against WCAG AA when the theme loads; if it fails, the default theme is used.
- **Draft theme JSON schema** (Phase 2; Arthur parked artist theme sheets until after the first drops [G6]):
```json
{"$schema":"https://json-schema.org/draft/2020-12/schema","title":"tt-theme","type":"object",
 "required":["id","version","tokens"],"additionalProperties":false,
 "properties":{
  "id":{"type":"string","pattern":"^[a-z0-9-]{3,40}$"},
  "version":{"type":"integer","minimum":1},
  "artist":{"type":"object","properties":{"name":{"type":"string","maxLength":60},"bio":{"type":"string","maxLength":600},
    "links":{"type":"array","maxItems":5,"items":{"type":"string","format":"uri","pattern":"^https://"}}}},
  "tokens":{"type":"object","additionalProperties":false,"patternProperties":{
    "^--color-(bg|surface|text|text-muted|accent|accent-contrast|line|link)$":{"type":"string","pattern":"^#[0-9A-Fa-f]{6}$"},
    "^--el-(core|hot|mid|cool|smoke)$":{"type":"string","pattern":"^#[0-9A-Fa-f]{6}$"},
    "^--el-(intensity|speed)$":{"type":"number","minimum":0,"maximum":2}}},
  "font_display":{"enum":["SpaceGrotesk","Inter"],"$comment":"plus the curated free-font list once Creative picks it"},
  "elements":{"type":"array","maxItems":3,"items":{"enum":["fire","lava-rock","coals","embers"]}}}}
```
- **Window timing (Arthur 11:16):**
  - Drops go live automatically at **midnight CT** and run a **real 24 h**.
  - All times live in one file, `data/drops.json`, in the repo. Arthur sets them, Forge commits them, and Gatekeeper verifies each timer before the drop.
  - Pages switch state on the client by comparing `Date.now()` with the stored instants, so no deploy is needed at midnight.
  - Recommended crawler/no-JS fallback (not yet ruled): Forge commits the "live" and "ended" HTML states ahead of time, and a static fallback shows the absolute times.
- **drops.json record:**
  - Fields: `{"id","artist_id","design_ids":[],"starts_at","ends_at","status_override":null|"sold_out"|"pulled","theme":"<theme id>|null"}`.
  - `starts_at` and `ends_at` are ISO 8601 with an explicit UTC offset. They're never local-time strings, and never derived from page load.
- **DST rule:** midnight CT is `-05:00` during CDT and `-06:00` during CST. Compute the offset with the America/Chicago zone rules. Never hand-type it.
  - Examples (checked with Python zoneinfo, 10-24): 2026-12-12 starts `2026-12-12T00:00:00-06:00` and ends `2026-12-13T00:00:00-06:00`.
  - A real 24 h that starts at the fall-back midnight (2026-11-01) ends at `2026-11-01T23:00:00-06:00`.
  - One that starts at the spring-forward midnight (2027-03-14) ends at `2027-03-15T01:00:00-05:00`. See open question B.
  - Gatekeeper's per-timer check: `ends_at − starts_at = 86400 s`, and `starts_at` equals local 00:00 in America/Chicago.

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
  - **Spend needs Paul's typed yes (November).** $39/mo is about 26% of the $150/mo budget [G15].
- **Product view:** a big product view with tap or hover print zoom, served from a high-res mockup with `srcset`. At launch it uses **Printful mockups** of the actual print file. They are swapped for our own photos when the sample arrives. Never AI imagery (Paul's rule [G10]).
- **Blank:** Bella+Canvas 3001 only at launch [G11]. The size and price table is rendered from one data file, not hand-typed.
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
Questions 1–7 from v0.1 were resolved by Arthur on 10-24 at 11:16 AM CT; see §1, §3 and §5. The Creative naming questions have been sent (pending):
- (a) Do you accept the `--{group}-{role}` scheme?
- (b) Is the type scale fluid or fixed, and how many steps?
- (c) What grid columns and gutters apply per breakpoint?
- (d) Which tokens may an artist theme override?
- (e) Do the motion rules set element speed and intensity defaults?
- (f) Do token names need dark/light variants?

New:
- **A.** The Buy Button / Storefront SDK loads Shopify scripts from Shopify's CDN. That breaks today's "no outside requests" rule. Allow Shopify origins in the CSP on selling pages only?
- **B.** On the two DST-change days, a real 24 h doesn't end at midnight: it ends at 11 PM or 1 AM CT. Keep a real 24 h (the ruling as written), or avoid drop starts on Nov 1 and Mar 14?
- **C.** Store sync: does the Storefront API need an access token in the static page? A public Storefront token is designed for this, but confirm the scope with Gatekeeper.
- **D.** Who checks the takeover's curated free-font list for licences: Creative or Gatekeeper?
- **E.** Printful mockup terms for public use on our site and in the vault: need a check.
- **F.** Shopify plan billing: monthly ($39) or yearly ($29/mo, about $348 up front), and the start month. This is Paul's typed yes.
- **G.** Crawler/no-JS view of a drop's state: is the recommended pre-committed HTML fallback accepted?

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
