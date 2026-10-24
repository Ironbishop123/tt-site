# Asset sources

Source and licence for every image, icon, and font in this phase. Creative checked the twelve files left out of PR #2 on 2026-10-24 (Provenance_PR2). All twelve are SELF-MADE. None of those twelve binaries are in this PR.

SELF-MADE means code we wrote, or Paul's own camera photo. Licence for self-made code is original work owned by Tempered Tees, not a third-party licence. UNVERIFIED is used only where the source is actually unknown. Nothing in this list is UNVERIFIED.

## Shipped in v8.0 (the deploy folder)

| File | Source | Licence |
|---|---|---|
| `v8.0/assets/logo/L2_badge.svg` | SELF-MADE. Code-drawn from C_icon.svg, non-AI. Source: Creative v2.3.3 Asset_Provenance.md. | Original work, Tempered Tees. |
| `v8.0/assets/icons/about.svg` | Byte-identical to Creative `site/pub/ring.svg`. Hand-written circle. SELF-MADE (code). | Original work, Tempered Tees. |
| `v8.0/assets/icons/commissions.svg` | Byte-identical to Creative `site/pub/anvil.svg`. Hand-written path. SELF-MADE (code). | Original work, Tempered Tees. |
| `v8.0/assets/icons/links.svg` | Forge, hand-drawn two-circle link mark for the profile panel. No embedded image and no external reference. | Original work, Tempered Tees. |
| `v8.0/assets/icons/process.svg` | Forge, hand-drawn three-line mark for the profile panel. No embedded image and no external reference. | Original work, Tempered Tees. |
| `v8.0/site/assets/SpaceGrotesk-subset.woff2` | Space Grotesk, self-hosted subset. Licence file beside it: `OFL-SpaceGrotesk.txt`. | SIL Open Font License 1.1. |
| `v8.0/site/assets/Inter-subset.woff2` | Inter, self-hosted subset. Licence file beside it: `OFL-Inter.txt`. | SIL Open Font License 1.1. |

The panel outline is not a file. It is one site-owned SVG template in the page (`#panel-stroke`), cloned for the reveal. It is not artist SVG.

## Demo only, outside the deploy folder

These sit in `_demo/`, which is not under `v8.0`. The leading underscore keeps the folder off GitHub Pages while Jekyll is the publisher. `v8.0` HTML does not reference them. `_demo/artist.html` sends `noindex`.

| File | Source | Licence |
|---|---|---|
| `_demo/assets/themes/demo-artist/banner_placeholder.webp` | Forge geometric placeholder (dot field). Not artist art and not a v2.3 bundle image. | Original work, Tempered Tees. |
| `_demo/assets/themes/demo-artist/header_placeholder.png` | Forge geometric placeholder. Not rendered on the profile. | Original work, Tempered Tees. |
| `_demo/assets/themes/demo-artist/texture_placeholder.png` | Forge 64×64 grid. | Original work, Tempered Tees. |
| `_demo/assets/themes/demo-artist/panel_wip_placeholder.png` | Forge bar placeholder. | Original work, Tempered Tees. |
| `_demo/assets/themes/demo-artist/avatar_frame_placeholder.svg` | Forge code-drawn ring. | Original work, Tempered Tees. |
| `_demo/assets/themes/demo-artist/frame_placeholder.svg` | Forge code-drawn frame. Not stacked on the banner. | Original work, Tempered Tees. |

## Creative's twelve files (Provenance_PR2)

All twelve are SELF-MADE. They are not committed here.

| File | sha256 | Source | Licence | In this PR |
|---|---|---|---|---|
| `site/banner_default_A_2400x600.webp` | `e8a02d0b2361f186c00763b92927b446031b882adbd74d78cd0878229012f4a1` | SELF-MADE (code). Rendered from `banner_default.html`. Inputs: pub/flame, anvil, ring, print. | Original work, Tempered Tees. | No |
| `site/banner_default_B_2400x600.webp` | `2d682f20aaa64d1bf347b18fee63e570c9974f178bad0bf6bbb0e7b2046473a3` | SELF-MADE (code). Same generator, option B. | Original work, Tempered Tees. | No |
| `site/pub/flame.svg` | `e4827812b59bd0b44cdb605ac168cc99f7f009ef4ee1e64074050de7b19bd516` | SELF-MADE (code). Two hand-written paths. | Original work, Tempered Tees. | No |
| `site/print.svg` | `3d116301aeddbf61590133e636bd91b32982106e390d85163bfcad32d185680b` | SELF-MADE (code). **Placeholder print**, code-drawn by Creative. Not artist art. It must stay labelled as a placeholder and must not be shown as a real product. | Original work, Tempered Tees. | No |
| `site/assets/tee_1800.webp` | `9d39915780a01303769d1fc49fddc0694bb1e6d1b5b47df28fedadf7b9e7d666` | SELF-MADE (Paul's camera photo). **NOT PUBLIC: awaiting Paul re-approval.** | Paul's photograph. Excluded from the deploy. | No |
| `site/assets/crumpled_02_2x.webp` | `6112e31b42763c874123d827b829551bab18213ce36343405f30a455475b371b` | SELF-MADE (Paul's camera photo). **NOT PUBLIC: awaiting Paul re-approval.** | Paul's photograph. Excluded from the deploy. | No |
| `site/assets/crumpled_03_2x.webp` | `2bbc6b2096a588e60d9af1a8bc896635a5d79b84f4b112fc04248c7cc631f087` | SELF-MADE (Paul's camera photo). **NOT PUBLIC: awaiting Paul re-approval.** | Paul's photograph. Excluded from the deploy. | No |
| `site/panel_default_About.svg` | `b05c0c058f3a03bf41f63686885dd691e14c96f5558335026f500f029d210dee` | SELF-MADE (code). Opaque panel with the word About baked in. The profile uses a live HTML title instead. | Original work, Tempered Tees. | No |
| `site/panel_default_Commissions.svg` | `7cfea58593789e170df68480cfc38265d9614191a85607464cf7f843f64cca83` | SELF-MADE (code). Same construction, word Commissions. | Original work, Tempered Tees. | No |
| `site/panel_default_Featured.svg` | `b0dc396bbb911e22fe78174059b0ea79cfb2b1becc02445889090c27aa3f4f65` | SELF-MADE (code). Same construction, word Featured. | Original work, Tempered Tees. | No |
| `site/panel_default_Links.svg` | `b407baa2a6453fcec662a05af1d41aecb1f2cace8b03628feab3078ad3ab2035` | SELF-MADE (code). Same construction, word Links. | Original work, Tempered Tees. | No |
| `site/panel_default_Process.svg` | `378804d7eec084f2c35ab05817a72092162d1d0897d76099cca8e98fc4a061f8` | SELF-MADE (code). Same construction, word Process. | Original work, Tempered Tees. | No |

The live splash at the repository root (`index.html`, `assets/splash.css`, `assets/splash.js`, `CNAME`, and the root font and hero files) is unchanged and is not part of the v8.0 deploy.
