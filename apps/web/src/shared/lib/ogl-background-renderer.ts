import { Mesh, Program, Renderer, Triangle } from "ogl";

const VERTEX_SHADER =
  /* glsl */ "#version 300 es\nin vec2 position;\nvoid main() { gl_Position = vec4(position, 0.0, 1.0); }";

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;

const vec3 copperDark = vec3(23.0, 13.0, 9.0) / 255.0;
const vec3 copperMid = vec3(163.0, 78.0, 53.0) / 255.0;
const vec3 copperLight = vec3(242.0, 181.0, 150.0) / 255.0;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
    f.y
  );
}

vec3 copperGradient(vec2 uv, float aspect, float time) {
  vec2 p = (uv - 0.5) / 0.9;
  float gradientTime = time * 2.08;
  float degree = noise(vec2(gradientTime * 0.1, p.x * p.y) * 2.0);
  float angle = radians((degree - 0.5) * 500.0 + 180.0);
  float s = sin(angle);
  float c = cos(angle);
  p.y /= aspect;
  p = mat2(c, -s, s, c) * p;
  p.y *= aspect;
  float warpTime = gradientTime * 2.0;
  p.x += sin(p.y * 5.0 + warpTime) / 50.0;
  p.y += sin(p.x * 7.5 + warpTime) / 25.0;

  float blend = smoothstep(-0.35, 0.25, p.x);
  vec3 light = mix(copperLight, copperMid, blend);
  vec3 dark = mix(copperMid, copperDark, blend);
  vec3 color = mix(light, dark, 1.0 - smoothstep(-0.35, 0.55, p.y));
  color += (hash21(uv * 2.0 + floor(time * 25.0)) - 0.5) * 0.1;
  return clamp((color - 0.5) * 1.5 + 0.5, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float time = uTime * mix(0.02, 0.28, 0.24);
  vec3 color = (copperGradient(uv, aspect, time) - 0.5) * 1.08 + 0.5;

  vec2 texel = 2.5 / uResolution;
  vec3 bloom = copperGradient(uv + vec2(texel.x, 0.0), aspect, time);
  bloom += copperGradient(uv - vec2(texel.x, 0.0), aspect, time);
  bloom += copperGradient(uv + vec2(0.0, texel.y), aspect, time);
  bloom += copperGradient(uv - vec2(0.0, texel.y), aspect, time);
  color = mix(color, bloom * 0.25 + color * 0.2, 0.48 * 0.55);

  float grain = hash21(gl_FragCoord.xy + floor(uTime * 24.0)) - 0.5;
  color += grain * 0.18 * 0.22;
  float vignette = 1.0 - smoothstep(0.18, 0.82, length((uv - 0.5) * vec2(aspect, 1.0)));
  color *= mix(1.0, vignette, 0.22 * 0.72);
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const PIXEL_BUDGET = 1280 * 720;
const FRAME_INTERVAL_MS = 1000 / 30;

function getDrawingBufferSize(container: HTMLDivElement, devicePixelRatio: number) {
  // Read the fractional layout size before any transforms are applied.
  const styles = getComputedStyle(container);
  const width = Number.parseFloat(styles.width);
  const height = Number.parseFloat(styles.height);
  if (!(width > 0 && height > 0)) return;

  const scale = Math.min(devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

export function mountOglBackground(container: HTMLDivElement) {
  let devicePixelRatio = window.devicePixelRatio;
  const size = getDrawingBufferSize(container, devicePixelRatio);
  if (!size) return;

  const canvas = document.createElement("canvas");
  const contextOptions = { alpha: false, antialias: false, depth: false };
  let context: WebGL2RenderingContext | null = null;
  let renderer: Renderer;
  let program: Program | undefined;
  let geometry: Triangle | undefined;
  let mesh: Mesh;
  let resizeObserver: ResizeObserver | undefined;
  let host: HTMLDivElement | null = container;
  let visible = false;
  let disposed = false;
  let playbackFrame = 0;
  let revealFrame = 0;
  let lastDraw = 0;
  const resolution = { value: new Float32Array(2) };
  const time = { value: 0 };

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(playbackFrame);
    cancelAnimationFrame(revealFrame);
    resizeObserver?.disconnect();
    host = null;
    canvas.removeEventListener("webglcontextlost", dispose);
    canvas.remove();
    geometry?.remove();
    program?.remove();
    if (context && !context.isContextLost()) context.getExtension("WEBGL_lose_context")?.loseContext();
  }

  function updateResolution() {
    // OGL sizes the drawing buffer. CSS keeps the canvas fitted to the panel.
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
    resolution.value[0] = renderer.gl.drawingBufferWidth;
    resolution.value[1] = renderer.gl.drawingBufferHeight;
  }

  function draw() {
    try {
      renderer.render({ scene: mesh });
    } catch {
      dispose();
    }
  }

  function updateSize() {
    if (!host) return;
    devicePixelRatio = window.devicePixelRatio;
    const size = getDrawingBufferSize(host, devicePixelRatio);
    if (!size) return;
    const { width, height } = size;
    if (renderer.width === width && renderer.height === height) return;
    renderer.setSize(width, height);
    updateResolution();
    return true;
  }

  function resize() {
    if (visible && !disposed && updateSize()) draw();
  }

  function animate(now: number) {
    if (window.devicePixelRatio !== devicePixelRatio) {
      resize();
      if (disposed) return;
    }
    const elapsed = now - lastDraw;
    if (elapsed >= FRAME_INTERVAL_MS) {
      const frameTime = elapsed - (elapsed % FRAME_INTERVAL_MS);
      lastDraw += frameTime;
      time.value += Math.min(frameTime, 40) / 1000;
      draw();
    }
    if (!disposed) playbackFrame = requestAnimationFrame(animate);
  }

  function setVisible(next: boolean) {
    if (disposed || visible === next) return;
    visible = next;
    if (visible) {
      resize();
      if (disposed) return;
      lastDraw = performance.now();
      playbackFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(playbackFrame);
    }
  }

  try {
    // OGL falls back to WebGL 1, but this shader requires WebGL 2.
    context = canvas.getContext("webgl2", contextOptions) as WebGL2RenderingContext | null;
    if (!context) return;
    renderer = new Renderer({
      canvas,
      webgl: 2,
      ...size,
      dpr: 1,
      autoClear: false,
      ...contextOptions
    });
    const gl = renderer.gl;
    program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: { uResolution: resolution, uTime: time },
      cullFace: false,
      depthTest: false,
      depthWrite: false
    });
    gl.deleteShader(program.vertexShader);
    gl.deleteShader(program.fragmentShader);
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      dispose();
      return;
    }

    geometry = new Triangle(gl);
    mesh = new Mesh(gl, { geometry, program });
    updateResolution();
    canvas.className = "block size-full";
    canvas.addEventListener("webglcontextlost", dispose);
    container.append(canvas);
    draw();
    if (disposed || gl.isContextLost()) {
      dispose();
      return;
    }

    revealFrame = requestAnimationFrame(() => {
      if (!disposed) canvas.dataset.ready = "";
    });
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    }
  } catch {
    dispose();
    return;
  }

  return {
    setVisible,
    park() {
      if (disposed || !canvas.hasAttribute("data-ready")) return false;
      setVisible(false);
      resizeObserver?.disconnect();
      host = null;
      canvas.remove();
      return true;
    },
    attach(nextHost: HTMLDivElement) {
      if (disposed) return false;
      try {
        host = nextHost;
        canvas.dataset.reused = "";
        nextHost.append(canvas);
        updateSize();
        // The drawing buffer may have been cleared while detached.
        draw();
        if (disposed || renderer.gl.isContextLost()) {
          dispose();
          return false;
        }
        resizeObserver?.observe(nextHost);
        return true;
      } catch {
        dispose();
        return false;
      }
    },
    dispose
  };
}
