/* <tt-fire> — procedural fire for Tempered Tees.
   Presets (band, edge, accent, glow) change size, intensity, and shape only.
   Palette and motion come from forge-elements/core.js.
   See docs/fire-notes.md for the techniques and the references. */

import {
  MOTION,
  forge,
  fbm,
  gnoise,
  parseColor,
  pickBacking,
  prefersReducedMotion,
  registerForgeType,
  resolveTheme,
  getThemeEpoch,
} from './core.js';

const STILL_URL = new URL('../fire_band_final.webp', import.meta.url).href;

const DIRS = { up: 0, down: 1, right: 2, left: 3 };

/* Shape only. Do not put palette or flicker rates here.
   spread 1 is full bleed. Lower spread is one soft column (accent). */
const PRESETS = {
  band: {
    intensity: 1,
    reach: 0.97,
    bed: 1,
    tongue: 0.62,
    spread: 1,
    glow: 0.82,
    core: 0.72,
    crown: 0.24,
    caps: { maxW: 1920, maxH: 560, phoneMaxW: 960, phoneMaxH: 320 },
  },
  edge: {
    intensity: 0.88,
    reach: 0.84,
    bed: 1,
    tongue: 0.78,
    spread: 1,
    glow: 0.46,
    core: 0.55,
    crown: 0.02,
    caps: { maxW: 1600, maxH: 420, phoneMaxW: 800, phoneMaxH: 280 },
  },
  accent: {
    intensity: 1,
    reach: 0.94,
    bed: 0.82,
    tongue: 0.68,
    spread: 0.34,
    glow: 0.64,
    core: 0.74,
    crown: 0.04,
    defaultWidth: '72px',
    defaultHeight: '104px',
    caps: { maxW: 240, maxH: 320, phoneMaxW: 180, phoneMaxH: 240 },
  },
  glow: {
    intensity: 0.7,
    reach: 0.46,
    bed: 1.15,
    tongue: 0.22,
    spread: 1,
    glow: 1.28,
    core: 0.3,
    crown: 0.06,
    defaultHeight: '140px',
    caps: { maxW: 1280, maxH: 300, phoneMaxW: 720, phoneMaxH: 180 },
  },
};

const CAPS_2D = { maxW: 240, maxH: 110, phoneMaxW: 180, phoneMaxH: 90, floorCss: false };

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Original shader. Technique notes and links: docs/fire-notes.md. */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform float uSpeed;
uniform float uRise;
uniform float uRiseTip;
uniform float uSway;
uniform float uWarp;
uniform vec3 uHz;
uniform vec3 uAmp;
uniform vec3 uDeep;
uniform vec3 uRed;
uniform vec3 uOrange;
uniform vec3 uYellow;
uniform vec3 uWhite;
uniform float uReach;
uniform float uBed;
uniform float uTongue;
uniform float uSpread;
uniform float uGlowAmt;
uniform float uCore;
uniform float uCrown;
uniform float uDir;
uniform float uAspect;

float hash21(vec2 p) {
  vec3 s = fract(vec3(p.x * 0.2471806, p.y * 0.8191725, (p.x + p.y) * 0.4142136));
  s += dot(s.zxy, s.yxz + 23.71);
  return fract((s.x + s.y) * s.z);
}

vec2 gdir(vec2 i) {
  float a = hash21(i) * 6.28318530718;
  return vec2(cos(a), sin(a));
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n00 = dot(gdir(i), f);
  float n10 = dot(gdir(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(gdir(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(gdir(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
}

vec2 rot(vec2 p) {
  return vec2(0.87758256189 * p.x - 0.4794255386 * p.y, 0.4794255386 * p.x + 0.87758256189 * p.y);
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  v += a * gnoise(p);
  p = rot(p) * 2.02;
  a *= 0.5;
  v += a * gnoise(p);
  return v;
}

float fbm4(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  v += a * gnoise(p); p = rot(p) * 2.02; a *= 0.5;
  v += a * gnoise(p); p = rot(p) * 2.02; a *= 0.5;
  v += a * gnoise(p); p = rot(p) * 2.02; a *= 0.5;
  v += a * gnoise(p);
  return v;
}

vec2 axes(vec2 uv) {
  if (uDir < 0.5) return vec2(uv.x, uv.y);
  if (uDir < 1.5) return vec2(uv.x, 1.0 - uv.y);
  if (uDir < 2.5) return vec2(uv.y, uv.x);
  return vec2(uv.y, 1.0 - uv.x);
}

/* Body stops at yellow. White is a separate, tiny base glint. */
vec3 ramp(float h) {
  vec3 c = mix(uDeep, uRed, smoothstep(0.0, 0.26, h));
  c = mix(c, uOrange, smoothstep(0.12, 0.5, h));
  c = mix(c, uYellow, smoothstep(0.4, 0.86, h));
  return c;
}

void main() {
  vec2 ax = axes(vUv);
  float across = ax.x;
  float along = ax.y;
  float yn = along;

  /* max(aspect, 4) keeps a phone from collapsing to two lobes, without
     going back to a fixed column count. */
  float aspect = max(uAspect, 0.35);
  float span = max(aspect, 4.0);
  float x = (across - 0.5) * span * 1.7;

  float flow = uTime * uSpeed * mix(uRise, uRiseTip, yn);
  float lean = gnoise(vec2(x * 0.37 + uPhase, uTime * uSpeed * uSway * 0.2)) * uSway;
  x += lean * yn * 1.2;

  vec2 p = vec2(x * mix(0.62, 1.9, yn) + 1.7, yn * mix(1.35, 3.5, yn) - flow + 5.2);
  float warpAmp = uWarp * mix(0.32, 1.65, yn * yn);
  vec2 q = vec2(fbm2(p + vec2(0.3, 3.4)), fbm2(p + vec2(7.2, 1.1)));
  float n = fbm4(p + q * warpAmp);
  float sheet = 1.0 - abs(gnoise(p * 2.05 + vec2(1.1, -flow * 0.5)));
  float field = clamp(n * 0.5 + 0.5 + sheet * 0.12 * yn, 0.0, 1.0);

  /* Two incommensurate frequencies, so tongue heights differ and merge.
     This is not a cell envelope. */
  float xN = across * span;
  float sky = gnoise(vec2(xN * 0.72 + uTime * uSpeed * 0.045, 1.7 + uPhase)) * 0.62
            + gnoise(vec2(xN * 1.61 + 4.2, 6.3)) * 0.38;
  float thresh = mix(0.02, 0.97, pow(yn, mix(0.55, 1.45, uTongue)));
  thresh += sky * 0.36 * smoothstep(0.18, 0.92, yn);
  float mid = 1.0 - smoothstep(0.0, 0.75, abs(across - 0.5));
  thresh -= uCrown * mid * yn * 0.1;
  float tongue = field - thresh;

  float bedN = 0.62 + 0.38 * gnoise(vec2(x * 0.85, 0.4 - uTime * uSpeed * uRise * 0.35));
  float valley = (1.0 - smoothstep(0.3, 0.7, yn)) * 0.2 * uBed * clamp(bedN, 0.2, 1.0);
  float density = tongue + valley;

  float edge = 1.0;
  float spread = clamp(uSpread, 0.05, 1.0);
  if (spread < 0.97) {
    float open = mix(0.16, 0.58, spread);
    float pinch = mix(open * 0.2, open, 1.0 - yn * 0.78);
    edge = 1.0 - smoothstep(pinch, pinch + 0.05 + 0.1 * spread, abs(across - 0.5));
  }

  float reach = clamp(uReach, 0.15, 1.05);
  float tipFade = 1.0 - smoothstep(reach * 0.84, reach, yn);
  float head = 1.0 - smoothstep(0.985, 1.0, along);
  float shaped = max(density, 0.0) * edge * tipFade;
  float flame = smoothstep(0.0, 0.16, shaped);
  float hot = smoothstep(0.1, 0.46, shaped);
  float heat = clamp(flame * 0.32 + hot * 0.62 * mix(0.55, 1.0, uCore), 0.0, 0.84);

  vec3 col = ramp(heat);
  float glint = smoothstep(0.8, 0.97, field)
    * smoothstep(0.16, 0.26, yn) * (1.0 - smoothstep(0.26, 0.4, yn))
    * hot;
  col = mix(col, uWhite, clamp(glint, 0.0, 0.35));

  float flick = 1.0
    + uAmp.x * sin(uTime * uHz.x + uPhase)
    + uAmp.y * sin(uTime * uHz.y + x * 1.7 + uPhase)
    + uAmp.z * sin(uTime * uHz.z + field * 9.0 + x);
  flick = clamp(flick, 0.82, 1.12);

  float bloom = smoothstep(0.04, 0.34, tongue) * (1.0 - smoothstep(0.1, 1.0, yn));
  bloom *= uGlowAmt * head * edge;
  col += uOrange * bloom * 0.32;
  col += uYellow * hot * uCore * 0.1;
  col *= uIntensity * flick;

  float luma = dot(max(col, 0.0), vec3(0.2126, 0.7152, 0.0722));
  float capL = mix(0.86, 0.93, clamp(glint, 0.0, 1.0));
  col *= min(1.0, capL / max(luma, 0.0001));

  float alpha = clamp((flame * 0.94 + bloom * 0.34) * head, 0.0, 1.0);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}
`;

const HZ = new Float32Array(MOTION.flickerHz);
const AMP = new Float32Array(MOTION.flickerAmp);

function cssLen(v) {
  return /^-?\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
}

function presetOf(name) {
  return PRESETS[name] || PRESETS.band;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function smooth(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0 || 1e-4));
  return t * t * (3 - 2 * t);
}
function lerp3(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}
function ramp(theme, h) {
  let c = lerp3(theme.deep, theme.red, smooth(0, 0.26, h));
  c = lerp3(c, theme.orange, smooth(0.12, 0.5, h));
  return lerp3(c, theme.yellow, smooth(0.4, 0.86, h));
}

/* Same shape math as the shader, fewer noise octaves, for the no-WebGL path. */
function shade2d(across, along, time, phase, shape, theme) {
  const aspect = Math.max(shape.aspect, 0.35);
  const span = Math.max(aspect, 4);
  let x = (across - 0.5) * span * 1.7;
  const yn = along;
  const speed = theme.speed;
  const flow = time * speed * mix(MOTION.rise, MOTION.riseTip, yn);
  const lean = gnoise(x * 0.37 + phase, time * speed * MOTION.sway * 0.2) * MOTION.sway;
  x += lean * yn * 1.2;
  const px = x * mix(0.62, 1.9, yn) + 1.7;
  const py = yn * mix(1.35, 3.5, yn) - flow + 5.2;
  const warpAmp = MOTION.warp * mix(0.32, 1.65, yn * yn);
  const q0 = fbm(px + 0.3, py + 3.4, 2);
  const q1 = fbm(px + 7.2, py + 1.1, 2);
  const n = fbm(px + q0 * warpAmp, py + q1 * warpAmp, 3);
  const sheet = 1 - Math.abs(gnoise(px * 2.05 + 1.1, py * 2.05 - flow * 0.5));
  const field = clamp01(n * 0.5 + 0.5 + sheet * 0.12 * yn);
  const xN = across * span;
  const sky = gnoise(xN * 0.72 + time * speed * 0.045, 1.7 + phase) * 0.62
    + gnoise(xN * 1.61 + 4.2, 6.3) * 0.38;
  const mid = 1 - smooth(0, 0.75, Math.abs(across - 0.5));
  const thresh = mix(0.02, 0.97, yn ** mix(0.55, 1.45, shape.tongue))
    + sky * 0.36 * smooth(0.18, 0.92, yn)
    - shape.crown * mid * yn * 0.1;
  const tongue = field - thresh;
  const bedN = 0.62 + 0.38 * gnoise(x * 0.85, 0.4 - time * speed * MOTION.rise * 0.35);
  const valley = (1 - smooth(0.3, 0.7, yn)) * 0.2 * shape.bed * Math.min(1, Math.max(0.2, bedN));
  const density = tongue + valley;
  let edge = 1;
  const spread = Math.min(1, Math.max(0.05, shape.spread));
  if (spread < 0.97) {
    const open = mix(0.16, 0.58, spread);
    const pinch = mix(open * 0.2, open, 1 - yn * 0.78);
    edge = 1 - smooth(pinch, pinch + 0.05 + 0.1 * spread, Math.abs(across - 0.5));
  }
  const reach = Math.min(1.05, Math.max(0.15, shape.reach));
  const tipFade = 1 - smooth(reach * 0.84, reach, yn);
  const head = 1 - smooth(0.985, 1, along);
  const shaped = Math.max(density, 0) * edge * tipFade;
  const flame = smooth(0, 0.16, shaped);
  const hot = smooth(0.1, 0.46, shaped);
  const heat = Math.min(0.84, flame * 0.32 + hot * 0.62 * mix(0.55, 1, shape.core));
  const col = ramp(theme, heat);
  const glint = smooth(0.8, 0.97, field) * smooth(0.16, 0.26, yn) * (1 - smooth(0.26, 0.4, yn)) * hot;
  const gmix = Math.min(0.35, Math.max(0, glint));
  const hz = MOTION.flickerHz;
  const amp = MOTION.flickerAmp;
  let flick = 1
    + amp[0] * Math.sin(time * hz[0] + phase)
    + amp[1] * Math.sin(time * hz[1] + x * 1.7 + phase)
    + amp[2] * Math.sin(time * hz[2] + field * 9 + x);
  flick = Math.min(1.12, Math.max(0.82, flick));
  let bloom = smooth(0.04, 0.34, tongue) * (1 - smooth(0.1, 1, yn));
  bloom *= shape.glow * head * edge;
  const inten = theme.intensity * flick;
  let r = (mix(col[0], theme.white[0], gmix) + theme.orange[0] * bloom * 0.32 + theme.yellow[0] * hot * shape.core * 0.1) * inten;
  let g = (mix(col[1], theme.white[1], gmix) + theme.orange[1] * bloom * 0.32 + theme.yellow[1] * hot * shape.core * 0.1) * inten;
  let b = (mix(col[2], theme.white[2], gmix) + theme.orange[2] * bloom * 0.32 + theme.yellow[2] * hot * shape.core * 0.1) * inten;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const capL = mix(0.86, 0.93, clamp01(glint));
  if (luma > capL && luma > 0) {
    const s = capL / luma;
    r *= s;
    g *= s;
    b *= s;
  }
  const alpha = Math.min(1, (flame * 0.94 + bloom * 0.34) * head);
  return [(clamp01(r) * 255) | 0, (clamp01(g) * 255) | 0, (clamp01(b) * 255) | 0, (alpha * 255) | 0];
}

class TTFire extends HTMLElement {
  static get observedAttributes() {
    return ['preset', 'height', 'width', 'intensity', 'palette', 'direction'];
  }

  constructor() {
    super();
    this.phase = Math.random() * 20;
    this.visible = true;
    this.mode = 'pending';
    this._paletteKey = '';
    this._theme = null;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host{display:block;position:relative}
      canvas,img{position:absolute;inset:0;width:100%;height:100%;display:block}
      img{object-fit:contain;object-position:center bottom}
    </style>`;
    this._root = root;
  }

  get preset() {
    const name = (this.getAttribute('preset') || 'band').toLowerCase();
    return PRESETS[name] ? name : 'band';
  }

  get direction() {
    const d = (this.getAttribute('direction') || 'up').toLowerCase();
    return d in DIRS ? d : 'up';
  }

  connectedCallback() {
    this.style.display = 'block';
    if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-hidden', 'true');
    }
    this.applySize();
    this.chooseMode();
    this.buildSurface();
    this.watch();
    forge.add(this);
  }

  disconnectedCallback() {
    forge.remove(this);
    if (this._io) this._io.disconnect();
    if (this._ro) this._ro.disconnect();
  }

  attributeChangedCallback(name, prev, next) {
    if (prev === next || !this.isConnected) return;
    if (name === 'height' || name === 'width' || name === 'preset') this.applySize();
    if (name === 'palette') this._theme = null;
    this._sized = false;
  }

  onMotionChange() {
    const prev = this.mode;
    this.chooseMode();
    if (this.mode !== prev) this.buildSurface();
    forge.kick();
  }

  applySize() {
    const spec = presetOf(this.preset);
    const h = this.getAttribute('height');
    const w = this.getAttribute('width');
    if (h) this.style.height = cssLen(h);
    else if (spec.defaultHeight) this.style.height = spec.defaultHeight;
    else this.style.removeProperty('height');
    if (w) this.style.width = cssLen(w);
    else if (spec.defaultWidth) this.style.width = spec.defaultWidth;
    else this.style.removeProperty('width');
    if (w || spec.defaultWidth) this.style.flexShrink = '0';
    else this.style.removeProperty('flex-shrink');
  }

  chooseMode() {
    const forced = typeof window !== 'undefined' ? window.__ttForceRenderer : '';
    if (prefersReducedMotion() || forced === 'still') {
      this.mode = 'still';
    } else if (forced === '2d') {
      this.mode = 'canvas2d';
    } else if (!forge.failed() && (forge.gl() || forge.initGL(VERT, FRAG))) {
      this.mode = 'webgl';
    } else {
      this.mode = 'canvas2d';
    }
    this.dataset.forgeMode = this.mode;
  }

  buildSurface() {
    for (const node of [...this._root.children]) {
      if (node.tagName !== 'STYLE') node.remove();
    }
    this.canvas = null;
    this.ctx = null;
    if (this.mode === 'still') {
      const img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.src = STILL_URL;
      img.width = 1920;
      img.height = 720;
      this._root.appendChild(img);
      return;
    }
    const canvas = document.createElement('canvas');
    this._root.appendChild(canvas);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      this.mode = 'still';
      this.dataset.forgeMode = 'still';
      this.buildSurface();
      return;
    }
    this.canvas = canvas;
    this.ctx = ctx;
  }

  watch() {
    if (typeof IntersectionObserver === 'function') {
      this._io = new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting;
        forge.kick();
      }, { rootMargin: '64px' });
      this._io.observe(this);
    }
    /* Host only. The bitmap size must not feed back into layout, or a
       resolution cap becomes the element's width. */
    if (typeof ResizeObserver === 'function') {
      this._ro = new ResizeObserver(() => {
        this._sized = false;
        forge.kick();
      });
      this._ro.observe(this);
    }
  }

  themeNow() {
    const key = this.getAttribute('palette') || '';
    if (this._theme && this._theme.epoch === getThemeEpoch() && this._paletteKey === key && this._themeUntil > performance.now()) {
      return this._theme;
    }
    const theme = resolveTheme(this);
    if (key && key !== 'brand') {
      let over = null;
      try { over = JSON.parse(key); } catch (e) { over = null; }
      if (over && typeof over === 'object') {
        for (const part of ['deep', 'red', 'orange', 'yellow', 'white']) {
          if (over[part] == null) continue;
          const parsed = parseColor(over[part]);
          if (parsed) theme[part] = parsed;
        }
      }
    }
    this._paletteKey = key;
    this._themeUntil = performance.now() + 400;
    this._theme = theme;
    return theme;
  }

  shapeNow(rect) {
    const spec = presetOf(this.preset);
    const horizontal = this.direction === 'up' || this.direction === 'down';
    const across = horizontal ? rect.width : rect.height;
    const along = horizontal ? rect.height : rect.width;
    const attr = this.getAttribute('intensity');
    const attrN = attr == null || attr === '' || Number.isNaN(+attr) ? 1 : +attr;
    return {
      reach: spec.reach,
      bed: spec.bed,
      tongue: spec.tongue,
      spread: spec.spread,
      glow: spec.glow,
      core: spec.core,
      crown: spec.crown,
      intensity: spec.intensity * attrN,
      aspect: across / Math.max(along, 1),
    };
  }

  backing(rect) {
    const spec = presetOf(this.preset);
    const caps = this.mode === 'canvas2d' ? CAPS_2D : spec.caps;
    return pickBacking(rect.width, rect.height, caps);
  }

  draw(t) {
    if (this.mode === 'still' || !this.canvas) return;
    const rect = this.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const size = this.backing(rect);
    if (this.canvas.width !== size.w || this.canvas.height !== size.h) {
      this.canvas.width = size.w;
      this.canvas.height = size.h;
    }
    /* The width/height attributes set the bitmap. Layout stays on the host. */
    const canvas = this.canvas;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const theme = this.themeNow();
    const shape = this.shapeNow(rect);
    const time = ((t * 0.001) % 90);
    if (this.mode === 'webgl') this.drawGL(time, theme, shape, size);
    else this.draw2D(time, theme, shape, size);
  }

  drawGL(time, theme, shape, size) {
    const gl = forge.gl();
    const locs = forge.locs();
    if (!gl || !locs) return;
    forge.bindFrame(size.w, size.h);
    gl.uniform1f(locs.uTime, time);
    gl.uniform1f(locs.uPhase, this.phase);
    gl.uniform1f(locs.uIntensity, theme.intensity * shape.intensity);
    gl.uniform1f(locs.uSpeed, theme.speed);
    gl.uniform1f(locs.uRise, MOTION.rise);
    gl.uniform1f(locs.uRiseTip, MOTION.riseTip);
    gl.uniform1f(locs.uSway, MOTION.sway);
    gl.uniform1f(locs.uWarp, MOTION.warp);
    gl.uniform3fv(locs.uHz, HZ);
    gl.uniform3fv(locs.uAmp, AMP);
    gl.uniform3fv(locs.uDeep, theme.deep);
    gl.uniform3fv(locs.uRed, theme.red);
    gl.uniform3fv(locs.uOrange, theme.orange);
    gl.uniform3fv(locs.uYellow, theme.yellow);
    gl.uniform3fv(locs.uWhite, theme.white);
    gl.uniform1f(locs.uReach, shape.reach);
    gl.uniform1f(locs.uBed, shape.bed);
    gl.uniform1f(locs.uTongue, shape.tongue);
    gl.uniform1f(locs.uSpread, shape.spread);
    gl.uniform1f(locs.uGlowAmt, shape.glow);
    gl.uniform1f(locs.uCore, shape.core);
    gl.uniform1f(locs.uCrown, shape.crown);
    gl.uniform1f(locs.uDir, DIRS[this.direction]);
    gl.uniform1f(locs.uAspect, shape.aspect);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.ctx.clearRect(0, 0, size.w, size.h);
    this.ctx.drawImage(forge.canvas(), 0, 0, size.w, size.h, 0, 0, size.w, size.h);
  }

  draw2D(time, theme, shape, size) {
    const ctx = this.ctx;
    const w = size.w;
    const h = size.h;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const themed = {
      deep: theme.deep,
      red: theme.red,
      orange: theme.orange,
      yellow: theme.yellow,
      white: theme.white,
      intensity: theme.intensity * shape.intensity,
      speed: theme.speed,
    };
    const dir = this.direction;
    for (let y = 0; y < h; y++) {
      const v = 1 - y / (h - 1);
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1);
        let across = u;
        let along = v;
        if (dir === 'down') along = 1 - v;
        else if (dir === 'right') { across = v; along = u; }
        else if (dir === 'left') { across = v; along = 1 - u; }
        const px = shade2d(across, along, time, this.phase, shape, themed);
        const i = (y * w + x) * 4;
        data[i] = px[0];
        data[i + 1] = px[1];
        data[i + 2] = px[2];
        data[i + 3] = px[3];
      }
    }
    ctx.putImageData(img, 0, 0);
  }
}

registerForgeType('fire', {
  presets: Object.keys(PRESETS),
  element: 'tt-fire',
});

if (!customElements.get('tt-fire')) customElements.define('tt-fire', TTFire);

export { PRESETS, TTFire };
