# Asset sources

Source and licence for every image, icon, and font in this phase. Creative checked the twelve files left out of PR #2 on 2026-10-24 (Provenance_PR2). All twelve are SELF-MADE. None of those twelve binaries are in this PR.

SELF-MADE means code we wrote, or Paul's own camera photo. Licence for self-made code is original work owned by Tempered Tees, not a third-party licence. UNVERIFIED is used only where the source is actually unknown. The v8.0, demo, and Creative rows below are not UNVERIFIED. The public root and splash-v7 table is Creative's sourced rows.

## Shipped in v8.0 (the deploy folder)

| File | Source | Licence |
|---|---|---|
| `v8.0/assets/logo/L2_badge.svg` | SELF-MADE. Code-drawn from C_icon.svg, non-AI. Source: research/tee/Asset_Provenance.md. | Original work, Tempered Tees. |
| `v8.0/assets/icons/about.svg` | Byte-identical to Creative `site/pub/ring.svg`. Hand-written circle. SELF-MADE (code). | Original work, Tempered Tees. |
| `v8.0/assets/icons/commissions.svg` | Byte-identical to Creative `site/pub/anvil.svg`. Hand-written path. SELF-MADE (code). | Original work, Tempered Tees. |
| `v8.0/assets/icons/links.svg` | Forge, hand-drawn two-circle link mark for the profile panel. No embedded image and no external reference. | Original work, Tempered Tees. |
| `v8.0/assets/icons/process.svg` | Forge, hand-drawn three-line mark for the profile panel. No embedded image and no external reference. | Original work, Tempered Tees. |
| `v8.0/site/assets/SpaceGrotesk-subset.woff2` | Space Grotesk, self-hosted subset. Licence file beside it: `OFL-SpaceGrotesk.txt`. | SIL Open Font License 1.1. |
| `v8.0/site/assets/Inter-subset.woff2` | Inter, self-hosted subset. Licence file beside it: `OFL-Inter.txt`. | SIL Open Font License 1.1. |
| `v8.0/assets/themes/site-profile/banner_default_A_2400x600.webp` | SELF-MADE (code). Re-rendered default banner A from the Creative v2.3.6 public bundle (`cd_v236_public.tgz`, sha256 `e583ad9e1babb9eb546b542f6cf347388564832ebe2905efb335d247bd91092a`). File sha256 `5e1482bfeb3de78595c91132a5d5fd1e494b5c8a2dae170ab64a1dceeadd4367`. | Original work, Tempered Tees. |
| `v8.0/assets/themes/site-profile/banner_default_B_2400x600.webp` | SELF-MADE (code). Re-rendered default banner B from the same v2.3.6 public bundle. File sha256 `d74d9f55c8791640e3e7437e8c5a5bba0e0440a841f79e1915dc664d4b9008c5`. | Original work, Tempered Tees. |
| `v8.0/assets/themes/site-profile/avatar_frame.svg` | Forge geometric placeholder, the same code-drawn ring already listed under the demo table. Copied here so the published profile can show a frame. Not artist art. | Original work, Tempered Tees. |
| `v8.0/assets/fire_band_final.webp` | SELF-MADE. Still frame of the procedural forge fire (band preset) from the fire element. File sha256 `1700c7b5aee3938cd30c6a925457d3d4e5fc8eecc9eeee5b6ba7829c52888c30`. | Original work, Tempered Tees. |
| `v8.0/assets/forge-elements/core.js`, `fire.js`, `fire.css` | SELF-MADE. Procedural `<tt-fire>` from the forge fire element. No third-party code. The home page reads `--el-intensity` .35 and `--el-speed` .6. | Original work, Tempered Tees. |

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

The repository root is now the deployed v8 homepage (`index.html`, with `coming-soon.html` and `about.html`). The previous splash lives at `/splash-v7/` and is not the v8.0 staging folder.

## Public root and splash-v7

These files are committed and are served with the public site or the moved splash. Coming soon uses the hero tee files already in this table. It adds no new image, font, or audio file.

| File | sha256 (12) | Who / how | Licence | AI | Evidence |
|---|---|---|---|---|---|
| `favicon.svg` | 7a76a0c3325c | SELF-MADE (code). Byte-identical to research/tee/logo/final/C_icon.svg, a hand-drawn vector built in code from licensed fonts, with no image inputs | Original work, Tempered Tees | NON-AI, hashgrep 0 | Asset_Provenance.md:95, :102, :200 (C_icon sha 7a76a0c3); tools/prov_sources.tsv:18 |
| `favicon_32.png` | 1354bf53aeb1 | SELF-MADE (code). Rendered from favicon.svg (C_icon) by og_favicons_v2/render.py | Original work, Tempered Tees | NON-AI, hashgrep 0 | Byte-identical to research/tee/Polish_Pass_2026-10-19/og_favicons_v2/favicon_32.png; render.py:7; prov_sources.tsv:9; Asset_Provenance.md:28, :77 |
| `apple_touch_180.png` | 3db93859c4f9 | SELF-MADE (code). Rendered from favicon.svg on #0F1114 by render.py | Original work, Tempered Tees | NON-AI, hashgrep 0 | Byte-identical to og_favicons_v2/apple_touch_180.png; MANIFEST_ICONS.md:9; render.py:7; prov_sources.tsv:8; Asset_Provenance.md:77 |
| `icon-192.png` | 2abf7f84df07 | SELF-MADE (code). Rendered from favicon.svg by render_icons.py | Original work, Tempered Tees | NON-AI, hashgrep 0 | Byte-identical to og_favicons_v2/icon-192.png; MANIFEST_ICONS.md:6; prov_sources.tsv:5; Asset_Provenance.md:77 |
| `icon-512.png` | 0bed2b1c73c6 | SELF-MADE (code). Rendered from favicon.svg | Original work, Tempered Tees | NON-AI, hashgrep 0 | Byte-identical to og_favicons_v2/icon-512.png; MANIFEST_ICONS.md:7; prov_sources.tsv:6; Asset_Provenance.md:77 |
| `icon-512-maskable.png` | 2d8605565803 | SELF-MADE (code). Rendered from favicon.svg with #0F1114 bleed | Original work, Tempered Tees | NON-AI, hashgrep 0 | Byte-identical to og_favicons_v2/icon-512-maskable.png; MANIFEST_ICONS.md:8; prov_sources.tsv:7; Asset_Provenance.md:77 |
| `og_share_1200x630.png` | dcd2fb41f174 | Forge (2026-10-23): the PEX og_share (sha a0077832) with only its 2nd text line repainted to "First drops coming soon." via tools/og_v723/text_line.html. Inputs: fire = Pexels video 5659686 (https://www.pexels.com/video/a-burning-fire-on-black-background-5659686/); tee = Pexels 8532616 (Hanna Pad, "A Black Shirt Hanging on the Wall"); text = Space Grotesk subset | Pexels License (free commercial use, no attribution required) + SIL OFL 1.1 font | NON-AI, hashgrep 0 | Byte-identical to product/tempered-tees-site/tools/og_v723/og_share_v723.png; prov_sources.tsv:29, :21; og_favicons_v3/LICENSES.md:25 (Pexels 5659686), L3 (Pexels 8532616); Asset_Provenance.md:26, :140 |
| `splash-v7/assets/hero_flat03_1x.avif` | a59680d3e0d8 | SELF-MADE (Paul's camera photo). flat_03.jpg from a Samsung Galaxy Z Fold8, 2026-10-21; classic non-generative edits (hero_v1.1) | Original work, Tempered Tees (Paul's photo) | NON-AI, hashgrep 0 | Byte-identical to research/tee/photos/hero_v1.1/hero_flat03_1x.avif; signoffs/splash_v7.2_OWN-PHOTO.txt:1-3; prov_sources.tsv:24; creative/design-direction-v2.3.1/Provenance_PR2.md:13 (EXIF) |
| `splash-v7/assets/hero_flat03_1x.webp` | a3adfb9a9fc6 | Same as above | Same | NON-AI, hashgrep 0 | hero_v1.1/hero_flat03_1x.webp; signoff file; prov_sources.tsv:23 |
| `splash-v7/assets/hero_flat03_1x.jpg` | 08da57b2a849 | Same as above | Same | NON-AI, hashgrep 0 | hero_v1.1/hero_flat03_1x.jpg; signoff file; prov_sources.tsv:25 |
| `splash-v7/assets/hero_flat03_2x.avif` | 9efc27f78014 | Same as above | Same | NON-AI, hashgrep 0 | hero_v1.1/hero_flat03_2x.avif; signoff file; prov_sources.tsv:27 |
| `splash-v7/assets/hero_flat03_2x.webp` | 6c2baba79c27 | Same as above | Same | NON-AI, hashgrep 0 | hero_v1.1/hero_flat03_2x.webp; signoff file; prov_sources.tsv:26 |
| `splash-v7/assets/hero_flat03_2x.jpg` | 601a1c1b98db | Same as above | Same | NON-AI, hashgrep 0 | hero_v1.1/hero_flat03_2x.jpg; signoff file; prov_sources.tsv:28 |
| `splash-v7/assets/audio/forge_loop.mp3` | b2c71ed59da5 | SELF-MADE (code). Synthesized by research/tee/Splash_Page_DRAFT/final_B_v7/make_forge_audio.py (sha 1b1c51c6..., pure numpy, seeded, no file inputs) -> WAV -> libmp3lame 64k | Original work, Tempered Tees | NON-AI, hashgrep 0 | prov_sources.tsv:19; Asset_Provenance.md:78; byte-identical to product/tempered-tees-site/_prev/audio_prev_20261019_031032/forge_loop.mp3 |
| `splash-v7/assets/audio/forge_loop.webm` | 2b676d955b70 | SELF-MADE (code). Same script, libopus 40k re-encode | Original work, Tempered Tees | NON-AI, hashgrep 0 | prov_sources.tsv:20; Asset_Provenance.md:78 |
| `splash-v7/assets/logo_icon.svg` | 7a76a0c3325c | SELF-MADE (code). Byte-identical to C_icon.svg (same file as favicon.svg) | Original work, Tempered Tees | NON-AI, hashgrep 0 | Asset_Provenance.md:24, :95, :102, :200 |

