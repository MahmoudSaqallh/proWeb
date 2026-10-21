# Shader Page Transitions in Next.js

WebGL shader transitions between routes in the Next.js App Router. Click a link → a noise wipe sweeps up and covers the screen → the route swaps while hidden → the wipe keeps sweeping up and reveals the new page.

```
app/
  layout.tsx        wraps the app in <TransitionProvider> (canvas lives here, survives route changes)
  page.tsx          demo page 1
  about/page.tsx    demo page 2
components/
  PageTransition.tsx   everything: shaders, canvas overlay, tween, provider, link
```

## How it works

There is one animated number: `progress`, a plain mutable `{ value: 0 }` object owned by the provider. It represents the whole journey:

- `0` — idle, overlay invisible
- `0 → 0.5` — leading edge sweeps up, covers the screen
- `0.5` — fully covered (this is when the route swaps)
- `0.5 → 1` — trailing edge sweeps up from the bottom, reveals the new page
- at `1` it snaps back to `0` (invisible at both ends, so the snap can't be seen)

The flow, step by step:

1. `TransitionLink` intercepts the click (`preventDefault`), awaits `play(0.5)`, then calls `router.push(href)`. The DOM swap happens behind the opaque overlay.
2. `TransitionProvider` watches `usePathname()`. When the path changes mid-transition, it plays `0.5 → 1`, then resets to `0`.
3. `Plane` copies `progress.value` into the shader every frame via `useFrame`.

The canvas is mounted once in the root layout, `position: fixed` over everything with `pointer-events: none`, and is fully transparent except during a transition.

## The shader

The vertex shader outputs clip-space coordinates directly (`gl_Position = vec4(position, 1.0)`), so a 2×2 plane always fills the viewport — no camera math.

The fragment shader runs per pixel and only decides alpha:

```glsl
float n = noise(vUv * 8.0);
float wipe = vUv.y + n * 0.2;                          // this pixel's threshold: height + noise
float coverP = clamp(uProgress * 2.0, 0.0, 1.0);       // first half of the journey
float clearP = clamp(uProgress * 2.0 - 1.0, 0.0, 1.0); // second half
float covered = smoothstep(wipe - 0.1, wipe + 0.1, coverP * 1.4 - 0.1);
float cleared = smoothstep(wipe - 0.1, wipe + 0.1, clearP * 1.4 - 0.1);
gl_FragColor = vec4(uColor, covered - cleared);
```

Two edges sweep upward through the screen. `covered` is the leading edge, `cleared` is the trailing edge chasing it half a journey behind. A pixel is opaque only between them — subtracting turns the overlay into a band traveling up. `smoothstep` feathers the edges; the shared noise makes them organic instead of straight lines.

### Things to tweak

- **Colors**: `uColorA` (bottom) and `uColorB` (top) in the `Plane` component — the overlay is a vertical gradient blended per pixel with `mix()`; make them equal for a flat color
- **Speed / feel**: `duration` and `ease` in the `gsap.to()` call inside `play` (any GSAP ease works — try `expo.inOut` or a custom one)
- **Direction**: replace `vUv.y` in `wipe` — `vUv.x` for horizontal, `distance(vUv, vec2(0.5))` for a circular reveal, pure `noise(vUv * s)` for a dissolve
- **Edge character**: noise scale (`8.0`) and amplitude (`0.2`); use different noise for `cleared` to make entry and exit look distinct
- **Overlap**: `clamp(uProgress * 2.0 - 0.8, ...)` starts the reveal before cover finishes — snappier
- **Fancier**: sample a grayscale displacement texture instead of computed noise; the texture becomes the art (ink bleeds, brush strokes)

## Gotchas (each of these was hit while building this)

1. **The canvas eats clicks.** react-three-fiber sets `pointer-events: auto` on its own `<canvas>` for its event system, which overrides `pointer-events: none` on the container. Without the `onCreated` fix, the invisible overlay makes the entire site unclickable.

2. **Don't mutate the uniforms object you passed as a prop.** R3F merges the `uniforms` prop into the material's own uniforms object — your reference is not kept. Mutating your copy silently does nothing. That's why `Plane` writes into `mat.current.uniforms` inside `useFrame` from the shared `progress` object.

3. **`requestAnimationFrame` pauses in background tabs and some embedded webviews.** GSAP and R3F both run on rAF, so a transition started there hangs until the tab is visible again. Normal usage is unaffected (users click links in foreground tabs), but if you need it, GSAP's ticker can be driven manually (`gsap.ticker.lagSmoothing` / custom ticker) and R3F supports `frameloop="never"` plus a manual `advance()` interval.

## Using it in your own project

1. `npm install three @react-three/fiber gsap`
2. Copy `components/PageTransition.tsx`
3. Wrap your root layout's children in `<TransitionProvider>`
4. Use `<TransitionLink>` instead of `next/link` for internal navigation (it accepts all normal `<a>` props)

## Run the demo

```bash
npm install
npm run dev
```

→ http://localhost:3000
