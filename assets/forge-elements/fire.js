/* <tt-fire> — procedural fire for Tempered Tees.
   Presets (band, edge, accent, glow) change size, intensity, and shape only.
   Palette and motion come from forge-elements/core.js.
   See docs/fire-notes.md for the techniques and the references. */

import {
  MOTION,
  forge,
  fbm,
  gnoise,
  hash21,
  parseColor,
  pickBacking,
  prefersReducedMotion,
  registerForgeType,
  resolveTheme,
  getThemeEpoch,
} from './core.js';

const STILL_URL = new URL('../fire_band_final.webp', import.meta.url).href;

const DIRS = { up: 0, down: 1, right: 2, left: 3 };

/* Shape only. Do not put palette or flicker rates here. */
const PRESETS = {
  band: {
    intensity: 1,
    spacing: 200,
    minColumns: 3,
    maxColumns: 9,
    tipRise: 0.9,
    baseHalf: 0.5,
    tipHalf: 0.065,
    tongue: 0.8,
    body: 1,
    glow: 0.9,
    core: 1,
    crown: 0.72,
    caps: { maxW: 960, maxH: 360, phoneMaxW: 540, phoneMaxH: 210 },
  },
  edge: {
    intensity: 0.9,
    spacing: 58,
    minColumns: 2,
    maxColumns: 24,
    tipRise: 0.86,
    baseHalf: 0.5,
    tipHalf: 0.08,
    tongue: 0.74,
    body: 1,
    glow: 0.48,
    core: 0.7,
    crown: 0.04,
    caps: { maxW: 900, maxH: 320, phoneMaxW: 480, phoneMaxH: 240 },
  },
  accent: {
    intensity: 1,
    columns: 1,
    tipRise: 0.9,
    baseHalf: 0.44,
    tipHalf: 0.05,
    tongue: 0.88,
    body: 1,
    glow: 0.72,
    core: 1.05,
    crown: 0.1,
    defaultWidth: '72px',
    defaultHeight: '104px',
    caps: { maxW: 200, maxH: 260, phoneMaxW: 160, phoneMaxH: 220 },
  },
  glow: {
    intensity: 0.68,
    spacing: 280,
    minColumns: 1,
    maxColumns: 3,
    tipRise: 0.5,
    baseHalf: 0.78,
    tipHalf: 0.45,
    tongue: 0.16,
    body: 0.2,
    glow: 1.45,
    core: 0.16,
    crown: 0.1,
    defaultHeight: '140px',
    caps: { maxW: 560, maxH: 220, phoneMaxW: 380, phoneMaxH: 150 },
  },
};

const CAPS_2D = { maxW: 168, maxH: 88, phoneMaxW: 128, phoneMaxH: 72 };

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
uniform float uColumns;
uniform float uTipRise;
uniform float uBaseHalf;
uniform float uTipHalf;
uniform float uTongue;
uniform float uBody;
uniform float uGlowAmt;
uniform float uCore;
uniform float uCrown;
uniform float uDir;

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

vec3 ramp(float h) {
  vec3 c = mix(uDeep, uRed, smoothstep(0.02, 0.28, h));
  c = mix(c, uOrange, smoothstep(0.16, 0.5, h));
  c = mix(c, uYellow, smoothstep(0.4, 0.74, h));
  c = mix(c, uWhite, smoothstep(0.66, 1.0, h));
  return c;
}

void main() {
  vec2 ax = axes(vUv);
  float across = ax.x;
  float along = ax.y;

  float mid = 1.0 - smoothstep(0.0, 0.55, abs(across - 0.5));
  float crown = mix(1.0, mix(0.78, 1.0, mid), uCrown);
  float cols = max(uColumns, 1.0);
  float x = across * cols;
  float id = floor(x);
  float local = fract(x) - 0.5;
  float cellH = mix(0.58, 1.0, hash21(vec2(id + 0.5, 1.7)));
  float reach = max(uTipRise * crown * cellH, 0.08);
  float yn = along / reach;
  float yn1 = clamp(yn, 0.0, 1.0);

  float sway = gnoise(vec2(id * 0.41 + uPhase, uTime * uSpeed * 0.27)) * uSway;
  local += sway * mix(0.04, 0.4, yn1);

  float flow = uTime * uSpeed * mix(uRise, uRiseTip, yn1);
  vec2 p = vec2((local + across * 0.12) * mix(1.45, 2.7, yn1) + id * 1.87, yn * mix(1.1, 2.65, yn1) - flow);
  p += vec2(3.1, 7.7);

  float warpAmp = uWarp * mix(0.1, 1.0, yn1);
  vec2 q = vec2(fbm2(p + vec2(0.0, 1.7)), fbm2(p + vec2(4.2, 8.6)));
  float base = fbm4(p + q * warpAmp);
  float sheet = 1.0 - abs(gnoise(p * 2.15 + vec2(1.3, -flow * 0.35)));
  float n = clamp(base * 0.5 + 0.5 + sheet * 0.22 * yn1, 0.0, 1.0);

  float curve = pow(yn1, mix(0.48, 1.42, uTongue));
  float field = n - curve * 0.92 + (1.0 - yn1) * 0.24 * uBody;
  float halfW = mix(uBaseHalf, uTipHalf, pow(yn1, 0.82));
  float side = 1.0 - smoothstep(halfW * 0.4, max(halfW, 0.02), abs(local));
  float tipFade = 1.0 - smoothstep(0.76, 1.02, yn);
  float head = 1.0 - smoothstep(0.97, 1.0, along);
  float shaped = max(field, 0.0) * side * tipFade;

  float flame = smoothstep(0.02, 0.22, shaped);
  float hot = smoothstep(0.14, 0.5, shaped);
  float lift = exp(-((yn1 - 0.18) * (yn1 - 0.18)) / 0.16);
  float heat = clamp(flame * mix(0.4, 1.0, lift) + hot * lift * uCore, 0.0, 1.0);

  float flick = 1.0
    + uAmp.x * sin(uTime * uHz.x + uPhase)
    + uAmp.y * sin(uTime * uHz.y + id * 1.31 + uPhase)
    + uAmp.z * sin(uTime * uHz.z + n * 8.0 + id);
  flick = clamp(flick, 0.8, 1.16);

  float bloom = smoothstep(0.0, 0.3, field * 0.8 + 0.08) * (1.0 - smoothstep(halfW, halfW + 0.28, abs(local)));
  bloom *= (1.0 - smoothstep(0.0, 1.2, yn)) * uGlowAmt * head;

  vec3 col = ramp(heat);
  col += uOrange * bloom * 0.6;
  col += uYellow * hot * hot * lift * uCore * 0.22;
  col *= uIntensity * flick;

  float alpha = clamp(flame * 0.95 + bloom * 0.42, 0.0, 1.0) * head;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
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

function columnsFor(preset, acrossPx) {
  if (preset.columns) return preset.columns;
  const n = acrossPx / preset.spacing;
  return Math.max(preset.minColumns, Math.min(preset.maxColumns, n));
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
  let c = lerp3(theme.deep, theme.red, smooth(0.02, 0.28, h));
  c = lerp3(c, theme.orange, smooth(0.16, 0.5, h));
  c = lerp3(c, theme.yellow, smooth(0.4, 0.74, h));
  return lerp3(c, theme.white, smooth(0.66, 1, h));
}

/* Same shape math as the shader, fewer noise octaves, for the no-WebGL path. */
function shade2d(across, along, time, phase, shape, theme) {
  const mid = 1 - smooth(0, 0.55, Math.abs(across - 0.5));
  const crown = mix(1, mix(0.78, 1, mid), shape.crown);
  const cols = Math.max(shape.columns, 1);
  const x = across * cols;
  const id = Math.floor(x);
  let local = x - id - 0.5;
  const cellH = mix(0.58, 1, hash21(id + 1, 2));
  const reach = Math.max(shape.tipRise * crown * cellH, 0.08);
  const yn = along / reach;
  const yn1 = clamp01(yn);
  const sway = gnoise(id * 0.41 + phase, time * theme.speed * 0.27) * MOTION.sway;
  local += sway * mix(0.04, 0.4, yn1);
  const flow = time * theme.speed * mix(MOTION.rise, MOTION.riseTip, yn1);
  let px = (local + across * 0.12) * mix(1.45, 2.7, yn1) + id * 1.87 + 3.1;
  let py = yn * mix(1.1, 2.65, yn1) - flow + 7.7;
  const warpAmp = MOTION.warp * mix(0.1, 1, yn1);
  const q = fbm(px, py + 1.7, 2);
  const base = fbm(px + q * warpAmp, py + fbm(px + 4.2, py + 8.6, 2) * warpAmp, 3);
  const n = clamp01(base * 0.5 + 0.5);
  const curve = yn1 ** mix(0.48, 1.42, shape.tongue);
  const field = n - curve * 0.92 + (1 - yn1) * 0.24 * shape.body;
  const halfW = mix(shape.baseHalf, shape.tipHalf, yn1 ** 0.82);
  const side = 1 - smooth(halfW * 0.4, Math.max(halfW, 0.02), Math.abs(local));
  const tipFade = 1 - smooth(0.76, 1.02, yn);
  const head = 1 - smooth(0.97, 1, along);
  const shaped = Math.max(field, 0) * side * tipFade;
  const flame = smooth(0.02, 0.22, shaped);
  const hot = smooth(0.14, 0.5, shaped);
  const lift = Math.exp(-((yn1 - 0.18) ** 2) / 0.16);
  const heat = Math.min(1, flame * mix(0.4, 1, lift) + hot * lift * shape.core);
  const hz = MOTION.flickerHz;
  const amp = MOTION.flickerAmp;
  let flick = 1
    + amp[0] * Math.sin(time * hz[0] + phase)
    + amp[1] * Math.sin(time * hz[1] + id * 1.31 + phase)
    + amp[2] * Math.sin(time * hz[2] + n * 8 + id);
  flick = Math.min(1.16, Math.max(0.8, flick));
  let bloom = smooth(0, 0.3, field * 0.8 + 0.08) * (1 - smooth(halfW, halfW + 0.28, Math.abs(local)));
  bloom *= (1 - smooth(0, 1.2, yn)) * shape.glow * head;
  const col = ramp(theme, heat);
  const inten = theme.intensity * flick;
  const r = Math.min(1, (col[0] + theme.orange[0] * bloom * 0.6 + theme.yellow[0] * hot * hot * lift * shape.core * 0.22) * inten);
  const g = Math.min(1, (col[1] + theme.orange[1] * bloom * 0.6 + theme.yellow[1] * hot * hot * lift * shape.core * 0.22) * inten);
  const b = Math.min(1, (col[2] + theme.orange[2] * bloom * 0.6 + theme.yellow[2] * hot * hot * lift * shape.core * 0.22) * inten);
  const alpha = Math.min(1, (flame * 0.95 + bloom * 0.42) * head);
  return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0, (alpha * 255) | 0];
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
      :host{display:block}
      canvas{display:block;width:100%;height:100%}
      img{display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom}
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
    const attr = this.getAttribute('intensity');
    const attrN = attr == null || attr === '' || Number.isNaN(+attr) ? 1 : +attr;
    return {
      columns: columnsFor(spec, Math.max(across, 1)),
      tipRise: spec.tipRise,
      baseHalf: spec.baseHalf,
      tipHalf: spec.tipHalf,
      tongue: spec.tongue,
      body: spec.body,
      glow: spec.glow,
      core: spec.core,
      crown: spec.crown,
      intensity: spec.intensity * attrN,
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
    gl.uniform1f(locs.uColumns, shape.columns);
    gl.uniform1f(locs.uTipRise, shape.tipRise);
    gl.uniform1f(locs.uBaseHalf, shape.baseHalf);
    gl.uniform1f(locs.uTipHalf, shape.tipHalf);
    gl.uniform1f(locs.uTongue, shape.tongue);
    gl.uniform1f(locs.uBody, shape.body);
    gl.uniform1f(locs.uGlowAmt, shape.glow);
    gl.uniform1f(locs.uCore, shape.core);
    gl.uniform1f(locs.uCrown, shape.crown);
    gl.uniform1f(locs.uDir, DIRS[this.direction]);
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
    for (let y = 0; y < h; y++) {
      const along = 1 - y / (h - 1);
      for (let x = 0; x < w; x++) {
        const px = shade2d(x / (w - 1), along, time, this.phase, shape, themed);
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
