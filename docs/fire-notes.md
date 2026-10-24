# Fire notes

How the forge fire is drawn, and the open references behind it. The shader and the Canvas2D path are written for this site. They are not ports of a Shadertoy listing. Shadertoy's default license is non-commercial, and the short code samples in the articles below were not copied (offsets, rotation matrices, and hash constants included).

## What has to read as fire

A flame is hot gas. Thick, dense regions burn yellow-white. The body is orange. The edges and the tips thin out to deep red and then disappear. The tips flicker, curl, and separate into tongues. A noise field sliding upward still looks like a texture. The mask has to throw most of that field away so only a flame shape remains.

## Techniques in the shader

### Gradient noise and fBM

Lattice gradient noise, summed as fractional Brownian motion: each octave doubles the frequency, halves the amplitude (Hurst exponent around 1/2), and rotates the domain so the grid does not show through. The flame sample uses four octaves. The warp uses two. That is the usual graphics construction of fBM, not a fluid simulation.

- Inigo Quilez, [fBM](https://iquilezles.org/articles/fbm/)
- Patricio Gonzalez Vivo and Jen Lowe, [The Book of Shaders: Noise](https://thebookofshaders.com/13/)
- Ken Perlin, *An Image Synthesizer*, SIGGRAPH 1985 (the noise basis)

### Domain warp

Before the flame is sampled, the sample point is pushed by another noise field: `fbm(p + warp * fbm(p))`. One warp level, not two. Two levels look richer and cost about twice the noise lookups, which does not fit a full-width band on a phone. Warp amplitude is small at the base and larger toward the tips, so the bed of the fire stays coherent and the tips curl.

- Inigo Quilez, [Domain warping](https://iquilezles.org/articles/warp/)
- Wayline, [Capstone: a living fire](https://www.wayline.io/learn/shaders/19) (warp as the step that stops a flame looking like a flat cloud)

### Upward flow, with turbulence that grows with height

Time is subtracted from the noise's vertical coordinate, so features travel up the flame. The speed increases with height (hot gas accelerates). Horizontal frequency also increases with height, which is what shreds the column into smaller pieces as it rises. A slow sway, stronger at the tips, leans each tongue. The sway is part of the shared motion tokens, so every preset leans the same way.

- Mark Fischer, [WebGL fire shader based on fBM](https://blog.fixermark.com/posts/2025/webgl-fire-shader-based-on-fbm/)
- Moonjump, [Fire & Smoke](https://moonjump.com/forum/shader-sandbox/tutorial/fire-and-smoke)

### Flame-shape masks (this is what makes tongues)

Noise alone is a cloud. The flame is that cloud with three masks:

1. A per-tongue envelope, wide at the base and narrow at the tip, so neighbors share one bed of fire and split into licks above it.
2. A threshold that climbs with height. At the base most of the noise survives. At the top only the peaks survive, and those peaks are the tongues.
3. A hard fade before the canvas edge, plus a reach that stops short of the top. Tips end inside the box. They are not cropped by `background-size: cover`.

A crown term on the band preset makes the middle of the page slightly taller than the corners, which matches a hearth rather than a trimmed hedge. A ridged extra octave (one noise lookup, inverted absolute value) puts thin bright sheets inside the column. Those read as flame fronts rather than cotton.

- ShaderBattle, [Fire 1: a flame you can see into](https://shaderbattle.com/learn/fire-1-a-flame-you-can-see-into) (taper, sway, turbulence taken out of the density, heat cooler at the tip)

### Blackbody color

Heat, not a separate palette per preset, picks the color. The ramp follows the blackbody locus from a dull red through orange and yellow to a yellow-white core, using the brand stops already on the page: deep red, `#E8642C` (heat), `#FFB43C` (hot), then `#FFF6E4` only where the flame is thick and low. Tips stay red because the white stop is gated by a lift curve peaked in the lower body. It is a piecewise ramp chosen against that locus, not a copied polynomial.

- [Black body](https://en.wikipedia.org/wiki/Black_body)
- [Planckian locus](https://en.wikipedia.org/wiki/Planckian_locus)

### Glow

A wider, softer lobe in the same orange is added under the tongues. One pass, no second buffer. It is the bloom you see on a real flame against a dark room, and it is why the glow preset can turn the body down and still read as heat.

### Flicker at three speeds

The same three rates are uniforms, from one motion record:

- slow, about 1.6 Hz, the breath of the whole fire
- medium, about 5 Hz
- fast, about 12 Hz, phase-shifted by the noise so neighboring tongues do not pulse together

Presets do not get their own rates. Speed from the theme scales all three.

## Presets

`band`, `edge`, `accent`, and `glow` change spacing, reach, width, how hard the height threshold breaks the tips, how much of the soft glow shows, and an intensity multiplier. Palette and motion stay on the shared tokens. Direction (`up`, `down`, `left`, `right`) only turns which edge the flames grow from.

## What we did not use

- Shadertoy fire shaders, as code. They are a useful look reference and the wrong license to copy. [Search](https://www.shadertoy.com/results?query=tag%3Dfire)
- The published warp offsets `(5.2, 1.3)`, `(1.7, 9.2)`, `(8.3, 2.8)` and the `mat2(0.8, 0.6, -0.6, 0.8)` rotation.
- The common `sin(dot(p, vec2(127.1, 311.7))) * 43758.5453` hash.
- Feedback-buffer fire (the old "smear the previous frame and scroll it up" demo). It needs last frame's pixels, looks like a different effect, and fights a shared context with several instances.

## Cost

One WebGL context and one `requestAnimationFrame` loop for every `<tt-fire>` on the page. Each instance is a quad. The backing store is capped (about 960px on the long side on a desktop band, lower on a phone or a coarse pointer) so a 2560px display does not rasterize 2560 pixels of fire. The loop stops when the tab is hidden or every instance is off screen. `prefers-reduced-motion` does not run it: the element shows `assets/fire_band_final.webp` with `object-fit: contain` and no scale animation. If WebGL cannot start, the same tokens and the same shape math run through the JS noise in `core.js` into a small canvas. If that cannot start either, the still image is used.
