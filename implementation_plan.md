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

## Future Ideas
- [ ] **Volumetric Clouds**: Implement a raymarched cloud shader.
- [ ] **Path Tracing**: Basic Monte Carlo path tracer for realistic lighting.
- [ ] **Fluid Simulation**: 2D Navier-Stokes fluid solver on GPU.
- [ ] **MIDI Input**: Allow users to control parameters via MIDI controller.
- [ ] **VR Support**: WebXR integration for immersive viewing.

## Technical Notes
- **Performance**: Always verify frame rates on mobile devices. Use `u_resolution` scaling for heavy shaders.
- **Audio**: Web Audio API requires user interaction to start. Always include a "Start" button.
- **SDFs**: Use `smin` (smooth minimum) for organic blending of shapes.
