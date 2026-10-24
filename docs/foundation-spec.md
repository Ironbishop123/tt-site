# Tempered Tees site foundation spec (draft v0.7.4)
Forge, 2026-10-24 11:48 AM CT (v0.6.1 11:49 AM CT). v0.6 fixes Gatekeeper QA_TT_Foundation_Spec_v0.5 (3 HIGH, 11 MED, 8 LOW) and follows Arthur's 11:44–11:45 AM scope, plus Creative v2.2. Changes: `docs/foundation-spec_v0.6_CHANGES.md`. The version history is in the _prev files.

**Ground rules.**
- **Hosting and tools:** static on GitHub Pages [G1]. Vanilla HTML, CSS and JS: no site build step, no framework, no paid tools. Asset checks (SVG sanitizer, file-size, PNG and copy gates) run offline in Forge's hand-load script before commit, never at runtime. No third-party requests, except that Shopify's scripts are allowed in the CSP **on selling pages only** (ruling A). Every other page keeps an all-`'self'` CSP.
- **Paul's earlier layout and placement asks are goals, not specs** (Arthur, 10-24). Nothing in the current pages is kept just because it exists.
- **Visual system:** Creative owns it, currently **design-direction-v2.2** (`creative/design-direction-v2.2/`; v2 and v2.1 are frozen). This spec owns the structure that takes it in.

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
- **Source of truth:** Creative's `creative/design-direction-v2.2/tokens/tt-theme.css` (v2.2, byte-identical to v2.1). The frame/page reference is `design-direction-v2.2/site/` (home, product, profile, default_banner, site.css, quench.js, reveal.js). This section **tracks Creative's latest version of that file**, which is still being revised (tokens and header) as of 10-24, 11:30 AM CT. Phase 1 copies it into the site as `assets/tokens.css`, with no renames. The names follow `--{group}-{role}[-{variant}]` (agreed with Creative).
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
  - **At most one forge element per page**, never behind text or buttons (Creative Motion.md). The schema enforces this with `elements` maxItems 1.
  - **Profile signature:** panels are drawn in once by an accent pencil stroke when they scroll into view (`design-direction-v2.2/site/reveal.js`): 700 ms ease-out with a 120 ms stagger, opacity and stroke only. With reduced motion the panels show at once.
    - The `?r=` preview parameter in reveal.js is for Creative's stills; it is removed from the production copy.
- **Artist-overridable tokens:**
  - every `--color-*` **except `--color-focus`**;
  - `--font-display`, from our site set (Space Grotesk, Inter) plus **22 curated OFL fonts** (Creative `design-direction-v2.2/Artist_Fonts.md`). The schema enum holds all 24.
    - The woff2 URLs in Artist_Fonts.md (jsDelivr/Fontsource) are **download sources only, never runtime references**. Each font is self-hosted with its OFL.txt next to it [G15].
    - Gatekeeper verifies every licence (ruling I).
    - Creative's usage rules apply: display steps 4–6 only; one font per artist; the name must fit in 2 lines at 390 px, or the takeover falls back to Space Grotesk.
  - all `--el-*`, with `--el-intensity` and `--el-speed` capped at 0–1 in artist themes (the takeover default of .6/.8 fits; motion_accent is ≤ .5; reduced motion forces speed 0).
  - Everything else is locked: focus, body font, text steps, leading, spacing, grid, radius and motion durations/easings.
- **Header (all pages): layout H2** (Creative Logo_Header.md). The logo is on the left; Today's Drop, Vault, Artists and Cart are on the right. On phones it collapses to logo + Cart + menu. The header has no sound control (ruling H).
- **Logo:** the **L2 badge** (`logo/L2_badge.svg`, code-drawn and simplified from C_icon) is Creative's pick for the header, favicon and profile.
- **Sound (ruling H):** a small icon toggle inside the Quench hero only, off by default: a 40 px icon button with `aria-pressed`, bottom-left of the hero scene next to Replay (Creative v2.1). Creative updates their Motion.md rule 9 to match; Forge doesn't edit Creative's files.
- **Homepage hero:** concept **Quench (A)**, per Arthur. It needs no canvas; `<tt-fire>` is used only for the footer band in Phase 2 (Creative Alignment_Forge.md).

## 3. Drop-day takeover slot
- **What it is:** for 24 h the home `stage` and `hero` are filled from a drop record: `drops/<drop-id>.json`. It holds the artist display name, bio, links, design images, product ids and an optional `theme`.
- **Theme overrides:** an artist theme may override only an allowlisted subset of tokens (color, `--font-display`, `--el-*`) and choose forge elements. `--font-display` must come from our self-hosted OFL set plus a small curated list of free fonts (`assets/fonts/takeover/`, each with its licence file). Artists can't upload fonts. **Ruling D:** Creative proposes the curated list; Gatekeeper verifies each licence. Contrast is checked against WCAG AA when the theme loads; if it fails, the default theme is used.
- **Theme JSON schema:** `docs/themes/tt-theme.schema.json` (JSON Schema 2020-12) is the only copy; it isn't duplicated here. The sample is `docs/themes/demo-artist.json`. Artist theme sheets stay Phase 2 [G1].
  - `--font-display` is allowed only from an enum: `"Space Grotesk"` and `"Inter"` today, plus the 22 curated OFL fonts from Creative's Artist_Fonts.md, all self-hosted (rulings D and I). Gatekeeper still verifies the licences.
  - `--color-focus` and every locked token are rejected.
- **Drop state machine (Arthur ruling, v0.7, 12:06 PM CT):**
  - **LAST CHANCE is cut for launch (Arthur, 12:26 PM CT, v0.7.4).** Agreement v1.17 treats any sale after the first 24 h as a re-drop (7 days' notice, standard 15% ladder). It sits behind the flag `last_chance` in `docs/data/features.json`, which is **OFF by default**. With the flag off: the launch states are **UPCOMING → LIVE → VAULT**, and VAULT starts at `ends_at` + 1 s; no 'Last chance' label, price or page may render; drops.json may not contain any `last_chance_*` field or a `last_chance` status, and `drops_check.py` rejects them (it reads the flag from data/features.json or `--features <path>`). Turning the flag on needs an Arthur ruling and an agreement that allows it. The LAST CHANCE text below is kept for that future use only.
  - **Copy names (v2.3.6):** **Today's Drop** is $26. **Stoked Return (re-drop from the Vault)** is $28. **Armory** is $30. Size extras are 2XL +$2, 3XL +$4, 4XL +$6, and 5XL +$8. There is no founding price. The demo design on the site is **Ember Crest**.
  - States, in order (with the flag on): **UPCOMING → LIVE → LAST CHANCE → VAULT**. SOLD OUT and PULLED come from `status_override`, which always wins.
  - **LIVE:** one full CT day, 12:00:00 AM–11:59:59 PM CT, at `live_price`.
  - **LAST CHANCE:** the next full CT day, 12:00:00 AM–11:59:59 PM CT, at `last_chance_price`.
  - **VAULT:** from then on, at `vault_price`, which equals the regular price. Stoke-back works as in §5 (Vault).
  - **The price belongs to the state.** The page shows the price of the current state and nothing else.
  - **One drop per screen.** No page shows two drops' countdowns or prices at once.
  - All times live in one file, `data/drops.json`. Arthur sets them, Forge commits them, and Gatekeeper verifies them. Pages switch state on the client from the stored instants, so no deploy is needed at midnight.
  - **Ruling G:** the static versions of each drop page (upcoming, live, last chance, vault) are committed ahead of time, each with its absolute times and its state's price, so crawlers and no-JS visitors see true times and prices.
- **drops.json record** (schema: `docs/data/drops.schema.json`):
  - Fields: `{"id","artist_id","design_ids":[],"starts_at","ends_at","live_price","vault_price","status_override":null|"sold_out"|"pulled","theme":"<theme id>|null","size_upcharges"}`. `live_price` and `vault_price` are required. `last_chance_starts_at`, `last_chance_ends_at` and `last_chance_price` are optional and allowed only with the `last_chance` flag on. `size_upcharges` is required.
  - **Pricing (v2.3.6):** sample prices are Today's Drop $26 and Stoked Return (re-drop from the Vault) $28. The Vault archive has no price of its own. LAST CHANCE is flag-off at launch, so the sample has no `last_chance_price`. Armory is $30 (no drops.json field). There is no founding price and no founding window. Size extras are 2XL +$2, 3XL +$4, 4XL +$6, and 5XL +$8.
    - **Royalty** (Arthur, 12:16 PM CT: the agreement wins; source `research/tee/Artist_Agreement_v1.17_DRAFT.md`): §5.1 the basis is the Net Item Price (payment fees and printing costs aren't deducted); §5.2(a) a Founding Artist earns 20% on every item of their first Design sold during its first 24-hour drop; §5.2(b) the standard ladder for all other sales, including re-drops, LAST CHANCE, VAULT and Armory, is 15% on cleared lifetime units 1–50, 17.5% from unit 51 and 20% from unit 151; §5.3 the per-item minimum is the greater of the percentage or $2.00 at 15%, $2.25 at 17.5% and $2.50 at 20%. If the agreement changes, the agreement wins.
    - **Shipping:** the buyer pays it as a Printful pass-through; it's free on orders of $60 or more.
    - **Size upcharges**, the same in every state: `size_upcharges` = 2XL +$2, 3XL +$4, 4XL +$6, 5XL +$8, added to the current state's price.
  - A drop with any `null` price cannot go live: the price gate fails, and the page shows no price or buy button.
  - Every `*_starts_at` is local 00:00:00 and every `*_ends_at` is local 23:59:59 in America/Chicago, written as ISO 8601 with that date's explicit offset (e.g. `2026-12-12T00:00:00-06:00`). They're never local-time strings without an offset, and never derived from page load.
  - `last_chance_starts_at` is `ends_at` + 1 s, i.e. the next local midnight.
- **Exact semantics** (instants compared in UTC; each `ends_at` is inclusive to the end of its second):
  - `now < starts_at` → UPCOMING.
  - `starts_at ≤ now ≤ ends_at` → LIVE.
  - `last_chance_starts_at ≤ now ≤ last_chance_ends_at` → LAST CHANCE.
  - `now > last_chance_ends_at` → VAULT.
  - Each day spans exactly 86400 s in UTC: `(ends_at+1s)−starts_at` and `(last_chance_ends_at+1s)−last_chance_starts_at`.
- **Countdown module:** a single module whose content changes at zero, with no separate banner and no reload. The client re-checks every second.
  - **UPCOMING:** "Starts Sat, Dec 12, 12:00 AM CT", no countdown, price shown as `live_price`.
  - **LIVE:** countdown to `ends_at`, "Ends tonight 11:59 PM CT", `live_price`.
  - At zero, it becomes **LAST CHANCE:** countdown to `last_chance_ends_at`, "Last chance · ends tonight 11:59 PM CT", `last_chance_price`.
  - At zero, it becomes **VAULT:** no countdown, "In the Vault", `vault_price`, and the stoke-back control.
  - **`status_override`:** `sold_out` shows "Sold out", no countdown and no buy button; `pulled` shows "Unavailable" in the same way.
  - Off the drop day, absolute labels are used, e.g. "Ends Sat, Dec 12, 11:59 PM CT".
  - **All labels and prices are generated from drops.json, never hand-typed.**
- **DST (ruling B, M7):**
  - Offsets come from the America/Chicago zone rules (`-05:00` CDT, `-06:00` CST) and are never hand-typed.
  - **All duration math is in UTC instants.** Parse the stored offsets, or convert to UTC, before subtracting. Same-zone wall-clock subtraction hides DST.
  - **Neither the LIVE day nor the LAST CHANCE day may fall on a DST-change day** (v0.7). The refused dates are **generated from the zone rules** (any date whose 00:00 and next 00:00 differ by ≠ 86400 s in UTC), not from a typed list. Examples: 2026-11-01, 2027-03-14, 2027-11-07.
- **Timer gate (it can fail):** `docs/tools/drops_check.py`, run on every drops.json record together with the schema:
  - both days span 86400 s in UTC;
  - every start is local 00:00:00 and every end is local 23:59:59;
  - `last_chance_starts_at` = `ends_at` + 1 s;
  - neither day is on the generated DST-day list;
  - for publish, no price is `null`;
  - every rendered label equals the label regenerated from drops.json;
  - a mocked-clock page test shows UPCOMING → LIVE → LAST CHANCE → VAULT at the exact instants, with the right price each time and no reload.
- **Price gate (new [G20]):** the price shown equals the Shopify checkout price in UPCOMING, LIVE and VAULT, plus LAST CHANCE only if the flag is on (mocked clock); a null price blocks publishing.

## 3a. Artist-customizable slots (off by default, unused at launch)
- **Where the slots are:** named slots on the **artist profile** page and the **product/selling** page:
  - `frame` (frame or border);
  - `background_texture`;
  - `accent_color`;
  - `header_art` (optional);
  - `motion_accent` (optional, one small element from the forge-elements engine, at intensity 0.5 or less).
- **Off by default:** if a slot is empty or the theme is absent, our default theme renders. There is no uploader UI; Forge hand-loads themes into `data/themes/` and `assets/themes/<id>/`.
- **Theme JSON:** it extends the takeover theme (§3) with a `slots` object holding `profile` and `selling`. Assets are artist-made SVG, PNG or WebP (WebP for raster images only), from repo paths only.
  - **Size caps are enforced on the real files** by the hand-load script, never by a value the artist declares (the `max_kb` fields were removed from the schema).
  - Schema: `docs/themes/tt-theme.schema.json` (JSON Schema 2020-12).
  - Sample: `docs/themes/demo-artist.json`. It has placeholder paths only and no artwork.
- **Drop day:** the same theme applies to the artist's selling page and the homepage takeover for that drop's 24 h.
- **Guardrails:**
  - **Safe zones:** slot assets render in layers that the layout clips away from the price, Add to Cart, the back control and legal text. Those elements sit above all slot layers and are never covered.
  - **Contrast:** checked automatically against WCAG ratios: 4.5:1 for body text and 3:1 for large text and UI, on every token pair the theme changes.
  - **Fallback:** the default theme loads if any asset fails validation, size, contrast or load.
  - **Artist text (H1):** every artist string (name, bio, panel title/text, link labels, alt) is inserted with `textContent`, or with attribute setters for `alt`/`href`. Never `innerHTML`, `insertAdjacentHTML` or template strings into HTML.
    - The schema also rejects `<` and `>` in every text field (`^[^<>]*$`) and caps each length.
    - Gate: the payload `<img src=x onerror=alert(1)>` in a bio is rejected by the schema. Rendering the same string through the page code (schema bypassed) shows it as literal text, with 0 `img` elements created and no alert. A grep of the site JS finds 0 `innerHTML`/`insertAdjacentHTML`/`outerHTML` assignments.
  - **SVG (H2):** artist SVG is shown **only via `<img>` or CSS `background-image`**, never inline, `<object>`, `<embed>` or `<iframe>`.
    - **Pipeline (M14, v0.6.3), local only, in this order:**
      1. **svgo** 4.x (MIT, npm) with `inlineStyles` (onlyMatchedOnce false), `convertStyleToAttrs`, `removeStyleElement` and `removeScripts`. This turns Inkscape-style `style=` attributes and `<style>` rules into presentation attributes (fill, stroke, …) so they survive.
      2. DOMPurify.
      3. `svg_second_pass.py`.
      - Code: `docs/tools/svg_sanitize.mjs` (steps 1–2), then `docs/tools/svg_second_pass.py`.
    - At hand-load, before commit, each SVG goes through **DOMPurify** (Apache-2.0/MPL-2.0, free) in Node with jsdom, using `USE_PROFILES: {svg: true, svgFilters: true}`. On top of that profile:
      - forbidden tags: `script`, `style`, `foreignObject`, `use`, `a`, `image`, `animate`, `animateMotion`, `animateTransform`, `set`, `iframe`, `object`, `embed`;
      - forbidden attributes: every `on*`, `style`, `href`/`xlink:href` other than local `#id` (a DOMPurify hook; no ALLOWED_URI_REGEXP, because it strips geometry).
    - After that, a second pass **rejects the file** (it is not "cleaned") if any of these remain: `<script`, `<style`, `@import`, `url(` other than local `#id`, `javascript:`, `data:`, `<use`, `<a `, `<foreignObject`, `<set`, `<animate`, `<image`, `<iframe`/`<object`/`<embed`, `<!DOCTYPE`/`<!ENTITY`, ` on…=`, or any `http:`/`https:`/`//` reference. **Exactly two namespace declarations are exempt:** `xmlns="http://www.w3.org/2000/svg"` and `xmlns:xlink="http://www.w3.org/1999/xlink"`. Any other namespace URI, or a lookalike, is rejected. Implementation: `docs/tools/svg_second_pass.py` (v0.6.2, M12).
      - **It is a post-sanitizer check only**, not a sanitizer, and is never run on raw input by itself.
      - Since v0.6.3 it decodes HTML/XML entities (up to 3 times) before matching, so `&#x68;ttps` is caught. Other encodings could still slip past it alone, which is why DOMPurify always runs first.
    - Banned features: scripts, event handlers, `style` elements and `@import`, SMIL (`set`/`animate*`, including href rewrites), `javascript:` and `data:` URIs, `use`, `a`, `foreignObject`, and external refs.
    - Gate: a test SVG for each banned feature must be rejected or stripped to safe output, and the committed files must pass the second-pass grep.
  - **Real size and dimension caps (M2):** the hand-load script reads the actual bytes and pixels:

    | Slot | Max file size | Max pixels |
    |---|---|---|
    | frame | 200 KB | 2400 px |
    | texture | 300 KB | 1024×1024 |
    | header art / banner | 400 KB | 2400×800 |
    | panel image | 200 KB | 640 px wide |
    | avatar frame | 50 KB | 800×800 |

    Over the limit means the file is rejected and the default theme is used.
- **Earlier validation runs** (kept for the record): validation of the sample (10-24, 11:28 AM CT): jsonschema 4.26.0 (venv), Draft 2020-12.
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
  - **Panel links:** a `link` is allowed on any panel type except `featured_designs` (L7).
  - **Outbound links:**
    - Artist outside links open in a new tab, with `target="_blank"` and `rel="noopener noreferrer"`. Internal links stay in the same tab (Arthur, 11:30 AM).
    - **Host allowlist (M1):** https only, no userinfo (`@`), no port. The host must be one of these, with `www.` allowed: instagram.com, tiktok.com, x.com, threads.net, bsky.app, youtube.com, behance.net, artstation.com, dribbble.com, etsy.com, ko-fi.com, patreon.com, linktr.ee, or example.com (test placeholders only).
      - Arthur can edit the list.
    - **No `nofollow`/`ugc` (Arthur, 11:49 AM CT, v0.6.1):** artists are vetted and signed, and followed links are a perk, so rel stays exactly `noopener noreferrer`. If unvetted public submissions to profiles ever open, those links get `rel="ugc nofollow noopener noreferrer"`.
      - A gate fails if `example.com` appears in any published theme.
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
- **What's being built:** fire is being built as a reusable `<tt-fire>` in cloud agent bc-9235242a (PR only, no merge) [G1]. Lava-over-rock, coals and embers follow on the same engine [G1].
- **Mount API:** each element is a custom element `<tt-{name}>`, or `TT.mount(name, el, opts)`, returning `{update(opts), pause(), resume(), destroy()}`. It owns one canvas inside its host and nothing else.
- **Inputs:** it reads the `--el-*` tokens from computed style on mount and on a `tt-theme-change` event. `opts`: `{intensity, speed, seed, region:"bottom"|"full"}`.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, it draws one still frame (or a static poster image of the same art) and runs no requestAnimationFrame loop.
- **Low-power fallback:** pause when `document.hidden` or when an IntersectionObserver says the element is off screen. Drop to a still if the frame budget is blown (e.g. more than 10 frames over 50 ms in the first 2 s), on `navigator.connection.saveData`, or when `deviceMemory <= 2`. These thresholds are proposals.
- **DPR caps:** canvas DPR is `min(devicePixelRatio, 2)` on desktop and 1.5 on coarse pointers. The splash embers already cap at 2 [G2].
- **Particle caps** scale with area, following today's 160 desktop / 40 phone embers [G2].
- **Budget:** each element is self-contained, under 30 KB gzip, with no network requests after load (proposed).

## 5. Store needs
- **Checkout (Arthur 11:16):** the site stays static on Pages, plus the Shopify Buy Button / Storefront API with Shopify-hosted checkout. Orders sync to Printful [G3]. A full Shopify theme is fallback only.
- **Shopify plan (checked 2026-10-24 about 11:17 AM CT):** the cheapest plan open to a new store is **Basic, $39/mo billed monthly or $29/mo billed yearly**. The pricing page also shows a promo: a 3-day trial, then $1/mo for 3 months. Sources: https://www.shopify.com/pricing (WebFetch); Basic lists "Build headless storefronts 1".
  - Buy Button: "The Buy Button sales channel is included in all Shopify subscription plans" (https://help.shopify.com/en/manual/online-sales-channels/buy-button).
  - The $5 Starter plan "isn't available to new stores" (https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan). A Shopify blog (May 2026) still says Starter is $5, which conflicts; the Help Center is newer and more specific.
  - **Ruling F:** Basic **billed monthly** ($39), not yearly, until sales prove it. Start only when the store is ready to sell, using the free trial first; the trial terms are re-verified at that time. Arthur asks; Paul's typed yes is required. $39/mo is about 26% of the $150/mo budget [G3].
  - **Ruling C:** the Storefront access token sits in the static page. Gatekeeper audits its scope before launch: read-only, least privilege.
- **Product view:** a big product view with tap or hover print zoom, served from a high-res mockup with `srcset`. At launch it uses **Printful mockups** (ruling E). **Printful's public-mockup terms are UNVERIFIED** until the official Printful terms are linked and checked; mockups stay off public pages until then (M9). Mockups must show the actual print file, and are replaced with our own photos once the physical sample arrives. No AI imagery, ever (Paul's rule [G1]).
- **Blank:** Bella+Canvas 3001 only at launch [G1].
- **Print files:** transparent PNG only, with no background, **at least 4500×5400 px** (Arthur, 11:32 and 11:39 AM). The size and price table is rendered from one data file, not hand-typed.
- **Vault (Arthur 11:16):** a public archive of sold-out designs. Pages stay live and indexed. A design returns only by re-drop (fan stokes). "Never returns" is used only for designs the artist has retired: `retired:true` plus the date, in the design record.
- **Truthful timers:**
  - A timer is shown only if `ends_at` is in drops.json as committed and published. The end time comes from that file, never from page load time.
  - If `ends_at` is missing or in the past, there is no countdown: the page shows the actual state ("Sold out", "Ended").
  - The client clock is a known risk, so the absolute end time is shown alongside the countdown: "Ends tonight 11:59 PM CT", or "Ends Sat, Dec 12, 11:59 PM CT" off the drop day. It is generated from `ends_at` (§3).
- **Checkout platform:** ruling 1 (above). Pages stay static and use the Shopify Buy Button / Storefront.
- **"Last Chance" wording (v0.7) (v0.7.4: never rendered while the flag is off):** it is used only in the LAST CHANCE state, and only while it is literally true: the design returns to the Vault at `vault_price` after `last_chance_ends_at`, and no other sale of the design at `last_chance_price` or lower is scheduled. The copy gate [G18] checks this against drops.json.
- **Copy rule (M8):** before commit, a gate scans all public copy (HTML, drops.json, theme text) case-insensitively for `forever`, `never`, `always`, `guaranteed`, `last chance`, `only \d+ left`, `selling fast`, `limited time` and `restock`.
  - Each hit needs a whitelisted reason, or the gate fails:
    - "never returns" only on a design record with `retired:true` and a date;
    - "last chance" only in the LAST CHANCE state's generated copy, and only when the "Last Chance" wording rule above holds (v0.7);
    - legal text exempt by path.
  - Product titles that quote shirt wording must match the print file's text exactly (checked against the design record's `print_text`).
- **CSP (M11):** set per page with a `<meta http-equiv>` tag.
  - **Non-selling pages:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'`.
  - **Selling pages:** the same, plus only the Shopify origins the Buy Button SDK needs in `script-src`, `connect-src`, `img-src` and `frame-src` (exact list to be taken from Shopify's docs and Gatekeeper-verified when we build). `img-src` for artist assets stays `'self'`; artist assets are never loaded from Shopify or anywhere else.

## 6. Phased migration (each phase is a new version folder; frozen builds are never edited)
| Phase | Scope | Done when (check that can fail) |
|---|---|---|
| 0 | Creative design-direction-v2.2 tokens; map its names to §2 | `grep -c` of every §2 token name in Creative's file = total; unmapped list is empty |
| 1 | tokens.css + frame + layout.css; rebuild splash v7.2.4 content as `home` on the frame (v8.0) | the go-live check on the new deploy folder reports `GO-LIVE STATUS … PASS` after signoff; `grep -E -- '--(ink\|straw\|heat\|hot)\b'` across assets = 0; 1440/1024/390 stills reviewed |
| 2 | `<tt-fire>` from bc-9235242a mounted in `stage`, replacing the `.fire` band | reduced-motion test shows 0 rAF calls; DPR test at dpr=3 shows canvas.width ≤ 2×CSS width; no 404s or outside requests |
| 3 | TT-SUB v1.7.4-review onto the same tokens.css and frame (new TT-SUB version; review intake logic untouched) | TT-SUB review_e2e suite passes (22/22 at v1.7.4 [G2]); `diff` of TT-SUB_Review_Intake.gs vs v1.7.4 is empty |
| 4 | product + vault + artist + about pages on the frame; product data + drops.json; truthful timer. Fan list + privacy page ship as their own release in this phase | a test drop JSON with `ends_at` in the past shows "Ended" and 0 countdown elements; one with no `ends_at` shows no timer |
| 5 | takeover slot + theme JSON (after the first drops) | a theme that fails AA contrast falls back to default (automated test); schema validation rejects unknown tokens |

## Open questions
- **Backlog (Gatekeeper optional LOWs, v0.6.3):**
  - the DOMPurify href hook only covers `href`/`xlink:href`, so references outside url() in other attributes (e.g. `filter`/`mask`/`clip-path`/`marker-*`) should also be limited to `url(#id)`;
  - reject `<!DOCTYPE`/`<!ENTITY` before svgo, not only in the second pass.
- **Resolved:** artist links have no nofollow/ugc (Arthur, 11:49 AM CT, v0.6.1). 1–7 by Arthur (11:16 AM), A–G by Arthur (11:19 AM), and Creative's naming questions 8a–f via design-direction-v2/Answers_for_Forge.md (11:30 AM):
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
- **Still open:**
  - The Shopify CSP origin list (built with the store).
  - Printful mockup terms (UNVERIFIED).
  - A second-source licence check for the curated fonts (UNVERIFIED, M10).

## Needs Gatekeeper verify (v0.6: merged and renumbered; the old→new map is in the CHANGES file)
**Facts and records**
- [G1] Hosting and records: both sites are on GitHub Pages; Bella+Canvas 3001 only; no-AI-imagery rule (CURRENT.md); `<tt-fire>` in bc-9235242a, PR only; element order; artist theme sheets in Phase 2 (sessions/decisions logs).
- [G2] Legacy facts: splash fonts self-hosted, splash token names, ember caps 160/40 and DPR 2; TT-SUB tokens and reduced motion; review_e2e 22/22 at v1.7.4.
- [G3] Shopify: checkout synced with Printful; Basic $39/mo monthly; Buy Button on all plans; Starter closed. Re-check on shopify.com, with trial terms, when the store is ready (rulings 1 and F).
- [G4] Storefront token scope: read-only, least privilege (ruling C).
- [G5] Printful public-mockup terms: **UNVERIFIED**, needs the official terms linked (ruling E, M9).

**Tests (each can fail)**
- [G6] Timer gate (§3, `drops_check.py`): LIVE and LAST CHANCE days each pass the UTC 86400 s check, local 00:00:00 and 23:59:59, the generated DST-day refusal (2026-11-01, 2027-03-14, 2027-11-07 refused), label equals regenerated label, and the mocked-clock state changes.
- [G7] Artist text escaping (H1): schema rejects `<>` and over-long text; the `onerror` payload renders as text with 0 elements created; 0 `innerHTML`-family uses in site JS.
- [G8] SVG (H2): DOMPurify SVG profile plus the second-pass reject grep. One test file each for script, `on*`, style/@import, SMIL set/animate href, `javascript:`, `data:`, `use`, `a`, foreignObject and external href, all must be rejected or made safe. SVG is rendered only via `<img>`/CSS.
- [G9] Real file size and pixel caps per slot (M2); an over-cap file is rejected.
- [G10] Links (M1): https only, allowlisted hosts, no userinfo or port; artist links have `target="_blank" rel="noopener noreferrer"`; internal links have no target; no `javascript:`/`data:`; no example.com in published themes.
- [G11] Repo-path assets only: every theme image is under `assets/themes/`; no tracking pixels or third-party image hosts; featured_designs only from our catalog.
- [G12] CSP (M11): non-selling pages exactly as in §5 with no Shopify origins; selling pages add only the verified Shopify origins.
- [G13] Safe zones: price, Add to Cart, back control and legal text are never covered at 1440/1024/390, with max-size placeholders.
- [G14] Contrast: a theme below WCAG 4.5:1 or 3:1, including text over textures at max opacity, falls back to the default theme (L5).
- [G15] Fonts: 24-font enum = Artist_Fonts.md (22) + site set (2); every font self-hosted with its OFL.txt; 0 runtime font-host requests. Licence is **UNVERIFIED** until a second source confirms each (M10).
- [G16] Theme schema: rejects external URLs, locked tokens, `--color-focus`, off-list fonts, `elements` > 1, and `--el-*` > 1; demo-artist.json passes.
- [G17] Print files: transparent PNG (RGBA), ≥ 4500×5400, corners at alpha 0, no opaque full-canvas background.
- [G18] Copy rule gate (M8): banned absolute or scarcity words need a whitelisted reason; "never returns" needs `retired:true`; product titles that quote shirt wording match `print_text` exactly.
- [G20] Price parity (v0.7.4): the price shown equals the Shopify checkout price in UPCOMING, LIVE and VAULT, plus LAST CHANCE only if the flag is on (mocked clock); a null price blocks publishing.
- [G19] Phase 0: every §2 token name is in Creative v2.2 tt-theme.css; site tokens.css is byte-identical to the version used.
