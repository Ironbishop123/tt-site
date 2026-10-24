/* Forge elements core.
   Shared by fire, and later by lava, coals, and embers.
   One noise implementation, one set of palette and motion tokens,
   one render loop, one WebGL context. Element modules register a type
   and hand drawables to `forge`. No third-party code. */

export const PALETTE = Object.freeze({
  deep: '#2A0C08',
  red: '#9C220F',
  orange: '#E8642C',
  yellow: '#FFB43C',
  white: '#FFF6E4',
});

/* Motion character. Presets must not replace these. Theme speed scales them. */
export const MOTION = Object.freeze({
  rise: 0.46,
  riseTip: 1.22,
  sway: 0.34,
  warp: 1.15,
  flickerHz: Object.freeze([1.6, 5.1, 12.4]),
  flickerAmp: Object.freeze([0.06, 0.034, 0.02]),
});

const CSS_VARS = Object.freeze({
  deep: '--forge-color-deep',
  red: '--forge-color-red',
  orange: '--forge-color-orange',
  yellow: '--forge-color-yellow',
  white: '--forge-color-white',
  intensity: '--forge-intensity',
  speed: '--forge-speed',
});

const TAU = 6.283185307179586;
const ROT_C = 0.87758256189;
const ROT_S = 0.4794255386;

let themeJSON = null;
let themeEpoch = 1;

const types = new Map();

export function registerForgeType(name, spec) {
  types.set(name, spec);
}

export function forgeTypeNames() {
  return [...types.keys()];
}

export function setForgeTheme(theme) {
  themeJSON = theme && typeof theme === 'object' ? theme : null;
  themeEpoch += 1;
}

export function getThemeEpoch() {
  return themeEpoch;
}

export function parseColor(input) {
  if (Array.isArray(input) && input.length >= 3) {
    const max = input[0] > 1 || input[1] > 1 || input[2] > 1 ? 255 : 1;
    return [input[0] / max, input[1] / max, input[2] / max];
  }
  const s = String(input == null ? '' : input).trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const rgb = /rgba?\(\s*([0-9.]+)[,\s/]+([0-9.]+)[,\s/]+([0-9.]+)/.exec(s);
  if (rgb) return [+rgb[1] / 255, +rgb[2] / 255, +rgb[3] / 255];
  return null;
}

function paletteFrom(source, fallback) {
  const out = { ...fallback };
  if (!source) return out;
  const bag = source.palette && typeof source.palette === 'object' ? { ...source, ...source.palette } : source;
  for (const key of Object.keys(PALETTE)) {
    if (bag[key] == null) continue;
    const parsed = typeof bag[key] === 'string' || Array.isArray(bag[key]) ? parseColor(bag[key]) : null;
    if (parsed) out[key] = bag[key];
  }
  return out;
}

/* Defaults, then the JSON theme, then CSS variables on the element (inherited). */
export function resolveTheme(el) {
  const colors = paletteFrom(themeJSON, { ...PALETTE });
  let intensity = 1;
  let speed = 1;
  if (themeJSON) {
    if (themeJSON.intensity != null && !Number.isNaN(+themeJSON.intensity)) intensity = +themeJSON.intensity;
    if (themeJSON.speed != null && !Number.isNaN(+themeJSON.speed)) speed = +themeJSON.speed;
  }
  if (el && typeof getComputedStyle === 'function') {
    const cs = getComputedStyle(el);
    for (const key of Object.keys(PALETTE)) {
      const raw = cs.getPropertyValue(CSS_VARS[key]).trim();
      if (!raw) continue;
      const parsed = parseColor(raw);
      if (parsed) colors[key] = raw;
    }
    const ri = cs.getPropertyValue(CSS_VARS.intensity).trim();
    const rs = cs.getPropertyValue(CSS_VARS.speed).trim();
    if (ri && !Number.isNaN(+ri)) intensity = +ri;
    if (rs && !Number.isNaN(+rs)) speed = +rs;
  }
  return {
    deep: parseColor(colors.deep),
    red: parseColor(colors.red),
    orange: parseColor(colors.orange),
    yellow: parseColor(colors.yellow),
    white: parseColor(colors.white),
    intensity,
    speed,
    epoch: themeEpoch,
  };
}

/* Integer hash for the JS noise path. Same algorithm family as the shader, not bit-identical. */
export function hash21(ix, iy) {
  let n = Math.imul(ix | 0, 0x6d2b79f5) ^ Math.imul(iy | 0, 0x9e3779b1);
  n = Math.imul(n ^ (n >>> 15), 0x27d4eb23);
  n ^= n >>> 13;
  return (n >>> 0) / 4294967296;
}

function gdir(ix, iy, dx, dy) {
  const a = hash21(ix, iy) * TAU;
  return dx * Math.cos(a) + dy * Math.sin(a);
}

export function gnoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const n00 = gdir(ix, iy, fx, fy);
  const n10 = gdir(ix + 1, iy, fx - 1, fy);
  const n01 = gdir(ix, iy + 1, fx, fy - 1);
  const n11 = gdir(ix + 1, iy + 1, fx - 1, fy - 1);
  const nx0 = n00 + (n10 - n00) * ux;
  return nx0 + (n01 + (n11 - n01) * ux - nx0) * uy;
}

export function fbm(x, y, octaves) {
  let v = 0;
  let a = 0.5;
  const n = octaves || 4;
  for (let i = 0; i < n; i++) {
    v += a * gnoise(x, y);
    const nx = ROT_C * x - ROT_S * y;
    const ny = ROT_S * x + ROT_C * y;
    x = nx * 2.02;
    y = ny * 2.02;
    a *= 0.5;
  }
  return v;
}

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function pickBacking(cssW, cssH, caps, phone) {
  const coarse = phone || (typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches);
  const dprCap = coarse || cssW < 760 ? 1.1 : 1.35;
  const dpr = Math.min((typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1, dprCap);
  let w = Math.max(2, cssW * dpr);
  let h = Math.max(2, cssH * dpr);
  const maxW = coarse && caps.phoneMaxW ? caps.phoneMaxW : caps.maxW;
  const maxH = coarse && caps.phoneMaxH ? caps.phoneMaxH : caps.maxH;
  if (w > maxW) {
    h *= maxW / w;
    w = maxW;
  }
  if (h > maxH) {
    w *= maxH / h;
    h = maxH;
  }
  return { w: Math.max(2, Math.round(w)), h: Math.max(2, Math.round(h)) };
}

function createLoop() {
  const items = new Set();
  let raf = 0;
  let gl = null;
  let glCanvas = null;
  let glFailed = false;
  let program = null;
  let buffer = null;
  let locs = null;
  let error = '';
  let lastFrameMs = 0;
  let lastGPUMs = 0;

  function onVis() {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    kick();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVis);
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mq) {
      const fn = () => {
        for (const item of items) if (item.onMotionChange) item.onMotionChange();
        kick();
      };
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn);
    }
  }

  function anyLive() {
    for (const item of items) {
      if (item.visible && item.mode !== 'still') return true;
    }
    return false;
  }

  function kick() {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (raf || !anyLive()) return;
    raf = requestAnimationFrame(frame);
  }

  function frame(t) {
    raf = 0;
    if (typeof document !== 'undefined' && document.hidden) return;
    const t0 = performance.now();
    let drew = false;
    for (const item of items) {
      if (!item.visible || item.mode === 'still') continue;
      drew = true;
      item.draw(t);
    }
    lastFrameMs = performance.now() - t0;
    if (drew) raf = requestAnimationFrame(frame);
  }

  function compile(glc, type, src) {
    const sh = glc.createShader(type);
    glc.shaderSource(sh, src);
    glc.compileShader(sh);
    if (!glc.getShaderParameter(sh, glc.COMPILE_STATUS)) {
      error = glc.getShaderInfoLog(sh) || 'shader compile failed';
      glc.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function initGL(vs, fs) {
    if (gl || glFailed) return gl;
    glCanvas = document.createElement('canvas');
    gl = glCanvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'low-power',
    });
    if (!gl) {
      glFailed = true;
      error = error || 'webgl unavailable';
      return null;
    }
    const v = compile(gl, gl.VERTEX_SHADER, vs);
    const f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) {
      glFailed = true;
      gl = null;
      return null;
    }
    program = gl.createProgram();
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      error = gl.getProgramInfoLog(program) || 'link failed';
      glFailed = true;
      gl = null;
      return null;
    }
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const names = [
      'uTime', 'uPhase', 'uIntensity', 'uSpeed', 'uRise', 'uRiseTip', 'uSway', 'uWarp',
      'uHz', 'uAmp', 'uDeep', 'uRed', 'uOrange', 'uYellow', 'uWhite',
      'uColumns', 'uTipRise', 'uBaseHalf', 'uTipHalf', 'uTongue', 'uBody', 'uGlowAmt', 'uCore', 'uCrown', 'uDir',
    ];
    locs = {};
    for (const name of names) locs[name] = gl.getUniformLocation(program, name);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      glFailed = true;
      gl = null;
      error = 'webgl context lost';
      for (const item of items) if (item.onMotionChange) item.onMotionChange();
    });
    return gl;
  }

  /* One backing canvas for every instance. It only grows, so a page of
     mixed sizes does not reallocate each frame. Each draw lands in the
     top-left of that buffer (GL's origin is the bottom). */
  function bindFrame(w, h) {
    if (!gl) return;
    const needW = Math.max(glCanvas.width, w);
    const needH = Math.max(glCanvas.height, h);
    if (glCanvas.width !== needW || glCanvas.height !== needH) {
      glCanvas.width = needW;
      glCanvas.height = needH;
    }
    const y = glCanvas.height - h;
    gl.viewport(0, y, w, h);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, y, w, h);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function bench() {
    if (!gl) return { mode: glFailed ? 'no-webgl' : 'idle', ms: lastFrameMs, gpuMs: lastGPUMs, error };
    const now = performance.now();
    const t0 = performance.now();
    let n = 0;
    for (const item of items) {
      if (item.mode === 'still') continue;
      item.draw(now);
      n += 1;
    }
    const cpu = performance.now() - t0;
    gl.finish();
    lastGPUMs = performance.now() - t0;
    return {
      mode: 'webgl',
      ms: lastGPUMs,
      submitMs: cpu,
      drawn: n,
      error,
      buffer: [glCanvas.width, glCanvas.height],
    };
  }

  return {
    items,
    add(item) {
      items.add(item);
      kick();
    },
    remove(item) {
      items.delete(item);
      if (!anyLive() && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    kick,
    initGL,
    bindFrame,
    locs: () => locs,
    gl: () => gl,
    canvas: () => glCanvas,
    failed: () => glFailed,
    error: () => error,
    lastFrameMs: () => lastFrameMs,
    bench,
    running: () => !!raf,
  };
}

export const forge = createLoop();

if (typeof window !== 'undefined') {
  window.__ttForge = {
    types: forgeTypeNames,
    instances: () => forge.items.size,
    running: () => forge.running(),
    lastFrameMs: () => forge.lastFrameMs(),
    error: () => forge.error(),
    bench: () => forge.bench(),
    setTheme: setForgeTheme,
    mode: () => {
      let m = 'none';
      for (const item of forge.items) m = item.mode;
      return m;
    },
  };
}
