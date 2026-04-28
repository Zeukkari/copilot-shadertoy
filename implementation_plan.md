# Implementation Plan - ShaderToy Testing

## Goal Description
Create a collection of WebGL shader experiments demonstrating various techniques (Fractals, Raymarching, Audio Reactivity) with a focus on visual aesthetics, interactivity, and performance.

## Completed Tasks
- [x] Basic WebGL Setup
- [x] Mandelbrot Fractal with Zoom
- [x] UI Control Panel
- [x] Raymarching Demo (SDFs)
- [x] Audio Reactivity & Speech Synthesis
- [x] Dark/High-Contrast Aesthetics
- [x] Interactive KIFS Fractal
- [x] Mobile Optimizations (Resolution Scaling)
- [x] Advanced Audio Sequencer (Song Structure)
- [x] Dynamic Geometry Switching
- [x] Volumetric Clouds (raymarched, day/night cycle, ambient drone audio)
- [x] GPU Fluid Simulation (Stam/Jos-Stam Navier-Stokes on ping-pong FBOs, vorticity confinement, curl-noise body force, multi-palette display)
- [x] Reaction-Diffusion Painter (Gray-Scott with 9-point Laplacian, 8 presets, height-field shading, 5 palettes)
- [x] Hyperspace Tunnel (Kaleidoscopic Mandelbox flythrough with warp effect, chromatic aberration, autopilot)
- [x] Hyperspace Tunnel v2 (refined: smooth wandering centerline, audio-reactive pulse, FFT bass detection, 5 palettes)
- [x] Galaxy (GPU particle system, ping-pong FBO position/velocity textures, 65k-1M particles, black hole gravity + spiral force, click-to-poke)
- [x] Neural Lattice (raymarched 3D MLP with pulsing signals along edges, 3 visual styles)
- [x] Oscilloscope CRT (Lissajous + audio-reactive line rendering with phosphor persistence, barrel distortion, scanlines, 4 phosphor colors)
- [x] Bug fix: Neural Lattice & Oscilloscope black-screen (extension dependencies + shader complexity)

## Future Ideas
- [ ] **Path Tracing**: Basic Monte Carlo path tracer for realistic lighting.
- [ ] **MIDI Input**: Allow users to control parameters via MIDI controller.
- [ ] **VR Support**: WebXR integration for immersive viewing.
- [ ] **Particles in Fluid**: Couple `galaxy.html` style GPU particles with `fluid.html` velocity field.
- [ ] **Procedural City**: Raymarched cyberpunk city with neon signs.

## Technical Notes
- **Performance**: Always verify frame rates on mobile devices. Use `u_resolution` scaling for heavy shaders.
- **Audio**: Web Audio API requires user interaction to start. Always include a "Start" button.
- **SDFs**: Use `smin` (smooth minimum) for organic blending of shapes.
- **Volumetrics**: Use Beer-Powder extinction + Henyey-Greenstein phase for believable clouds. Jitter the initial ray `t` with a hash to break up stepping bands. Keep the secondary light march short (4-7 steps) with exponentially growing step size.
- **FBO simulations**: Always feature-detect `OES_texture_half_float` first, fall back to `OES_texture_float`, then to `UNSIGNED_BYTE`. Check `OES_texture_half_float_linear` for LINEAR filtering support. For physics where precision matters (e.g. particle positions over many frames), prefer `OES_texture_float`.
- **Gray-Scott**: A 9-point Laplacian (weights 0.2 for cardinals, 0.05 for diagonals, -1 center) gives much cleaner isotropic patterns than the naive 5-point version. Run 6-15 steps per display frame for time-accelerated visuals.
- **Fluid**: 14-22 Jacobi iterations is the sweet spot for visible incompressibility without slowdown. Vorticity confinement dramatically increases visual interest at near-zero cost.
- **GPU Particles**: Store position and velocity in separate RGBA textures. Use 1xN texture coordinates as vertex attribute (`a_idx`) and `texture2D()` in the vertex shader to look up the world-space position. Render with `gl.POINTS` and additive blending.
- **Audio-reactive shaders**: An `AnalyserNode` with `fftSize=256-512` and a per-frame `getByteFrequencyData()` read is cheap. Smooth the bass-band sum into a `u_pulse` uniform with a low-pass coefficient like `pulse += (target - pulse) * dt * 12`.
- **CRT effects**: Cheapest convincing CRT = barrel distortion (`uv *= 1 + 0.06 * dot(uv,uv)`) + scanlines (`mix(1.0, 0.85, sin(y * res.y * pi))`) + a 4-tap blur for phosphor glow + ping-pong FBO with multiplicative fade for persistence.
- **WebGL extension gotcha (color-renderable textures)**: `OES_texture_half_float` and `OES_texture_float` only enable *sampling* of those texture formats. They do **not** make those textures usable as FBO color attachments — that requires `EXT_color_buffer_half_float` / `WEBGL_color_buffer_float`. Lesson from the oscilloscope black-screen bug: when the accumulator FBO doesn't strictly need >8-bit precision (e.g. line trail with multiplicative fade), default to `UNSIGNED_BYTE` for guaranteed renderability across all browsers/devices.
- **WebGL extension gotcha (FLOAT texture upload)**: `gl.texImage2D(..., gl.FLOAT, Float32Array)` silently fails (or zero-fills) when `OES_texture_float` is not enabled. If you only need to encode small ranges, pack into `UNSIGNED_BYTE` (`(v * 0.5 + 0.5) * 255`) and decode in the shader (`tex.xy * 2.0 - 1.0`). 8 bits of precision is fine for screen-space line points.
- **GLSL ES 1.00 nested-loop pitfall**: Deeply nested loops with non-constant bounds and `break` conditions (e.g. four-deep `if(li >= Li) break`) compile slowly or get unrolled aggressively, sometimes producing programs that link but never render in reasonable time. Lesson from neural-lattice black-screen: when iterating "all nodes × all edges", switch to a **spatial-hash / cell-neighborhood** scheme — find the cell the ray sample is in (`floor(p / spacing)`) and only test the 3×3×3 neighborhood. Drops complexity from O(N⁴) to O(constant).
