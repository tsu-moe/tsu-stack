import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

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

function mountOglBackground(container: HTMLDivElement) {
  const canvas = document.createElement("canvas");
  const contextOptions = { alpha: false, antialias: false, depth: false };
  if (!canvas.getContext("webgl2", contextOptions)) return;

  const renderer = new Renderer({ canvas, webgl: 2, ...contextOptions });
  const gl = renderer.gl;
  const resolution = { value: new Float32Array(2) };
  const time = { value: 0 };
  const program = new Program(gl, {
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
    program.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return;
  }

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let frame = 0;
  let lastDraw = 0;
  let lost = false;

  canvas.className = "block size-full";
  container.append(canvas);

  function resize() {
    const { clientWidth: width, clientHeight: height } = container;
    if (!width || !height || lost) return;

    const pixelBudget = 1280 * 720;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(pixelBudget / (width * height)));
    renderer.setSize(width, height);
    // OGL sizes the drawing buffer in pixels. Let CSS fill the clipped panel exactly.
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
    resolution.value[0] = gl.drawingBufferWidth;
    resolution.value[1] = gl.drawingBufferHeight;
    if (visible && !document.hidden) renderer.render({ scene: mesh });
  }

  function animate(now: number) {
    if (!lastDraw) lastDraw = now;
    const delta = now - lastDraw;
    if (delta >= 1000 / 30 - 1) {
      time.value += Math.min(delta, 40) / 1000;
      renderer.render({ scene: mesh });
      lastDraw = now;
    }
    frame = requestAnimationFrame(animate);
  }

  function updatePlayback() {
    if (visible && !document.hidden && !reducedMotion.matches && !lost) {
      if (!frame) frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastDraw = 0;
    }
  }

  function handleContextLoss() {
    lost = true;
    updatePlayback();
    canvas.remove();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  canvas.addEventListener("webglcontextlost", handleContextLoss);
  function handleVisibilityChange() {
    if (visible && !document.hidden) resize();
    updatePlayback();
  }
  document.addEventListener("visibilitychange", handleVisibilityChange);
  reducedMotion.addEventListener("change", updatePlayback);

  return {
    setVisible(next: boolean) {
      visible = next;
      if (visible) resize();
      updatePlayback();
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
      geometry.remove();
      program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    }
  };
}

export function OglBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let background: ReturnType<typeof mountOglBackground>;
    let attempted = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting && !attempted) {
        attempted = true;
        background = mountOglBackground(container);
      }
      background?.setVisible(entry.isIntersecting);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      background?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="ogl-background pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    />
  );
}
