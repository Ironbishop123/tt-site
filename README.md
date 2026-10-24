# Tempered Tees

Splash page for [temperedtees.com](https://temperedtees.com/). Static files, no build step, no third-party scripts.

## Forge elements

Fire is the first forge element. Lava over rock, a bed of coals, and drifting embers are meant to follow as new element types on this same engine, not as separate effects with their own colors and timing.

```
assets/forge-elements/core.js   noise, theme tokens, shared loop and WebGL context
assets/forge-elements/fire.js   fire presets and the <tt-fire> element
docs/fire-notes.md              how the flame is built, and the references
```

`core.js` owns three things every later element should reuse:

- The noise (`gnoise`, `fbm`). Lava and coals should sample this instead of bringing another noise.
- Theme tokens: palette, intensity, and speed. Motion rates (rise, sway, warp, the three flicker speeds) live next to them in `MOTION` and are not per preset.
- `forge`, the single render loop and the single WebGL context. A new element registers with `registerForgeType` and adds its instances to that loop.

Presets on `<tt-fire>` only change size, intensity, and shape. They do not change the palette or the motion character, so a band at the bottom of a page and an accent on a badge are the same fire.

| `preset` | What it is |
| --- | --- |
| `band` | Full-width fire along the bottom of a hero. |
| `edge` | A thin lip of flame on a section or card edge. |
| `accent` | A small flame for a badge, icon, or button. |
| `glow` | Low heat behind an element. Little tongue, more bloom. |

`direction` is `up` (default), `down`, `left`, or `right`. `height`, `width`, and `intensity` override the preset size and strength. `intensity` multiplies the theme. `palette="brand"` uses the theme; a JSON object in that attribute overrides colors for that one element.

### Drop one in

```html
<script type="module" src="assets/forge-elements/fire.js"></script>

<tt-fire preset="band"></tt-fire>
<tt-fire preset="edge" height="64"></tt-fire>
<tt-fire preset="edge" direction="right" width="48" height="180"></tt-fire>
<tt-fire preset="accent" width="72" height="104"></tt-fire>
<tt-fire preset="glow" height="120"></tt-fire>
```

Size a `band` with CSS (the homepage does this on `.fire`). Accent has a default box; the others grow to the width of their parent. `fire-demo.html` shows all four presets together. It is `noindex`.

The homepage keeps the ember canvas. The old CSS `scaleY` flicker on `.fire` is gone; flicker is inside the shader. The top-fade mask on `.fire` is unchanged, and the flame tips stop inside the box so the mask and the viewport do not clip them.

### Theme, including a later artist takeover

Tokens resolve in this order: built-in brand defaults, then `setForgeTheme`, then CSS variables on the element. An artist-takeover page can restyle every fire without editing the shader.

```css
:root {
  --forge-color-deep: #2A0C08;
  --forge-color-red: #9C220F;
  --forge-color-orange: #E8642C;
  --forge-color-yellow: #FFB43C;
  --forge-color-white: #FFF6E4;
  --forge-intensity: 1;
  --forge-speed: 1;
}
```

```js
import { setForgeTheme } from './assets/forge-elements/core.js';

setForgeTheme({
  intensity: 1.1,
  speed: 0.85,
  palette: { orange: '#E8642C', yellow: '#FFB43C' },
});
```

### When it does not animate

`prefers-reduced-motion: reduce` shows `assets/fire_band_final.webp` inside the element, `object-fit: contain`, with no scale animation. If WebGL cannot start, the element paints the same shape and tokens with the JS noise in `core.js` (Canvas2D). If that cannot start either, it uses the still image, so the band is never an empty box.
