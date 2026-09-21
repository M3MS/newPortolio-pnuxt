# SVG page transitions: implementation and lifecycle

This document describes the current behavior of [`transitionSetup.ts`](./transitionSetup.ts), its integration with Vue and Nuxt, and the geometry behind its GSAP animation. It assumes familiarity with Vue's Composition API, asynchronous rendering, and animation timelines.

## 1. Design and execution model

The transition animates a fixed, viewport-sized SVG over the page. Its filled path expands to cover the viewport, then contracts to reveal the content underneath. Page opacity changes happen at full coverage.

The animation is adapted from [Codrops' Theodore implementation](https://github.com/codrops/Theodore/blob/main/src/js/index.js):

| Vue hook | Reference animation | Direction | Duration |
| --- | --- | --- | --- |
| `onLeave` | `closeMenu` overlay sequence | Top to bottom | 2.2 seconds |
| `onEnter` | `openMenu` overlay sequence | Bottom to top | 2.2 seconds |

**Each hook contains a complete cover-and-reveal sequence.** With `mode: 'out-in'`, a normal page replacement runs both consecutively, giving 4.4 seconds of scheduled animation. Route loading and rendering can add latency around those timelines.

The reference's menu visibility changes are replaced by page-opacity changes. Its title and menu-item translations are not part of this implementation.

## 2. Ownership and integration

| File | Responsibility |
| --- | --- |
| [`app.vue`](../app.vue) | Supplies `transitionSetup` to `<NuxtPage>`. |
| [`layouts/default.vue`](../layouts/default.vue) | Renders the shared overlay alongside the page slot. |
| [`components/Overlay.vue`](../components/Overlay.vue) | Owns and exposes the SVG and path DOM refs. |
| [`composables/useOverlayRef.ts`](../composables/useOverlayRef.ts) | Stores the exposed overlay component instance for the hooks. |
| [`composables/transition.ts`](../composables/transition.ts) | Stores the application-level `transitionComplete` flag. |
| [`transitionSetup.ts`](./transitionSetup.ts) | Defines Vue hooks and drives the GSAP timelines. |

### Nuxt wiring

```vue
<NuxtLayout>
  <NuxtPage :transition="transitionSetup" />
</NuxtLayout>
```

[`nuxt.config.ts`](../../nuxt.config.ts) sets `app.pageTransition: false` as the default. The explicit `transition` prop on `<NuxtPage>` enables this transition at the point of use.

The overlay belongs to the layout rather than the transitioning page root. During navigation that retains the default layout, the same overlay survives the departing page's removal and is available to the entering page. Changing or remounting the layout changes that lifecycle assumption.

### Component exposure and DOM access

`Overlay.vue` declares:

```ts
const overlay = ref<SVGSVGElement | null>(null)
const overlayPath = ref<SVGPathElement | null>(null)

defineExpose({ overlay, overlayPath })
```

The layout registers the exposed instance through a function ref:

```vue
<Overlay :ref="setOverlayRef" />
```

Vue unwraps exposed refs on the public component instance. The transition therefore accesses the DOM nodes as:

```ts
const overlay = overlayRef.value?.overlay
const overlayPath = overlayRef.value?.overlayPath
```

There is one shared overlay, resolved at the start of each hook. The readonly wrapper returned by `useOverlayRef()` protects the ref through that API; it does not prevent GSAP from mutating DOM attributes and styles on the referenced nodes.

## 3. Vue's transition contract

```ts
const transitionSetup = {
  name: 'page-transition',
  mode: 'out-in',
  css: false,
  onBeforeEnter,
  onEnter,
  onLeave,
}
```

- **`mode: 'out-in'`** serializes the outgoing and incoming DOM transitions. Vue waits for leave completion before proceeding with the entering transition.
- **`css: false`** disables Vue's CSS transition-class handling and CSS duration detection. Completion is controlled by JavaScript hooks.
- **`name`** retains a descriptive transition name. With CSS handling disabled, `page-transition-enter-*` and `page-transition-leave-*` classes do not drive this effect.

### `el` and `done`

Vue supplies each asynchronous hook with `(el, done)`:

- `el` is the transitioning page's root DOM element, not the shared SVG.
- `done()` signals completion to Vue. In `onLeave`, it permits removal of the outgoing DOM and progression to the entering transition. In `onEnter`, it completes the enter lifecycle.

The two-argument hook signature tells Vue to wait for explicit completion. Returning a GSAP timeline does not itself complete the hook. This also applies to the leave fallback, which returns a timeline but relies on its `onComplete: done` callback.

### Before-enter preparation

```ts
onBeforeEnter: (el: Element) => {
  gsap.set(el, { opacity: 0 })
}
```

The incoming root is made transparent before its enter animation. It still participates in layout; this is an opacity change, not a `display` change. Its opacity is restored halfway through `onEnter`, behind a fully filled overlay.

### Nuxt rendering is a separate lifecycle

`out-in` orders the visual transition hooks. Nuxt also coordinates routing, async page setup, and `<Suspense>`. Do not infer from `out-in` that every outgoing component's teardown must finish before incoming data fetching or setup can begin.

Likewise, a component's `onMounted`, a resolved font promise, and a completed navigation are not interchangeable with the completion of the SVG reveal.

## 4. SVG coordinate system and path geometry

The overlay uses:

```html
<svg
  width="100%"
  height="100%"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
  <path d="M 0 100 V 100 Q 50 100 100 100 V 100 z" />
</svg>
```

The viewBox is a normalized coordinate space:

- `x = 0` and `x = 100` represent the left and right edges.
- `y = 0` and `y = 100` represent the top and bottom edges.
- `preserveAspectRatio="none"` scales the coordinates independently to the viewport's width and height. No JavaScript viewport measurement is needed for these keyframes.

### Two path families

Every animated path has the command topology `M → V → Q → V → z`. Two anchor configurations determine which side of the curve is filled.

**Bottom-anchored path**, written as `B(e, c)` in the tables below:

```text
M 0 100 V e Q 50 c 100 e V 100 z
```

This starts at the bottom-left corner, rises to the curved edge, crosses to the right side, and closes along the bottom. The filled area lies below the curve.

**Top-anchored path**, written as `T(e, c)`:

```text
M 0 0 V e Q 50 c 100 e V 0 z
```

This closes along the top. The filled area lies above the curve.

In both families:

- `e` is the vertical coordinate of both curve endpoints.
- `c` is the vertical coordinate of the quadratic Bézier control point at `x = 50`.
- `B(...)` and `T(...)` are documentation shorthand, not functions defined in the code.

### What the `Q` command actually does

For a curve parameter `u` between 0 and 1, the quadratic segment has:

```text
P0 = (0, e)
P1 = (50, c)
P2 = (100, e)

P(u) = (1 - u)² P0 + 2(1 - u)u P1 + u² P2
```

Its horizontal coordinate is `100u`. At the horizontal midpoint, its vertical coordinate is `(e + c) / 2`.

Consequently:

- `Q 50 0 100 50`, starting from `(0, 50)`, has a midpoint at `(50, 25)`.
- `Q 50 100 100 50` has a midpoint at `(50, 75)`.

The control point bends the edge; the curve does not generally pass through that point. In particular, a control-point `y` of `0` does not mean the curved edge has already reached the top at its midpoint.

### Full and collapsed states

| State | Meaning |
| --- | --- |
| `B(100, 100)` | Collapsed along the bottom; zero filled area. |
| `B(0, 0)` | Full viewport coverage, anchored at the bottom. |
| `T(100, 100)` | Full viewport coverage, anchored at the top. |
| `T(0, 0)` | Collapsed along the top; zero filled area. |

`B(0, 0)` and `T(100, 100)` fill the same rectangle despite having different path coordinates. This equivalence is the key to changing the anchor halfway through a timeline without a visible discontinuity.

## 5. `onEnter`: the `openMenu` sequence

Times are relative to the beginning of the enter timeline.

| Time | Operation | Target path | Easing |
| --- | --- | --- | --- |
| `0` | Show the SVG and initialize a collapsed bottom path. | `B(100, 100)` | Immediate |
| `0–0.8s` | Raise the curved edge from the bottom. | `B(50, 0)` | `power4.in` |
| `0.8–1.1s` | Flatten the edge at the top, reaching full coverage. | `B(0, 0)` | `power2` |
| `1.1s` | Set page opacity to `1`; switch to a top-anchored full path. | `T(100, 100)` | Immediate |
| `1.1–1.4s` | Raise the lower edge of the top-anchored fill. | `T(50, 0)` | `power2.in` |
| `1.4–2.2s` | Collapse the remaining fill into the top edge. | `T(0, 0)` | `power4` |
| `2.2s` | Hide the SVG; set completion state; call `done()`. | Collapsed at top | Immediate |

The first curved keyframe is expressed in the implementation as:

```ts
.to(overlayPath, {
  duration: 0.8,
  ease: 'power4.in',
  attr: { d: 'M 0 100 V 50 Q 50 0 100 50 V 100 z' }
}, 0)
```

At full coverage, the timeline performs two zero-duration operations:

```ts
.set(el, { opacity: 1 })
.set(overlayPath, {
  attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' }
})
```

The incoming page becomes paintable behind the opaque overlay. The second operation changes the fill's anchor so that the subsequent contraction continues upward, uncovering the page from bottom to top.

On completion, the callback executes in this order:

```ts
toggleTransitionComplete(true)
done()
```

The final `.set(overlay, { autoAlpha: 0 })` precedes that callback in the timeline.

## 6. `onLeave`: the `closeMenu` sequence

Before creating its timeline, `onLeave` sets `transitionComplete` to `false`.

| Time | Operation | Target path | Easing |
| --- | --- | --- | --- |
| `0` | Show the SVG and initialize a collapsed top path. | `T(0, 0)` | Immediate |
| `0–0.8s` | Lower the curved edge from the top. | `T(50, 100)` | `power4.in` |
| `0.8–1.1s` | Flatten the edge at the bottom, reaching full coverage. | `T(100, 100)` | `power2` |
| `1.1s` | Set page opacity to `0`; switch to a bottom-anchored full path. | `B(0, 0)` | Immediate |
| `1.1–1.4s` | Lower the upper edge of the bottom-anchored fill. | `B(50, 100)` | `power2.in` |
| `1.4–2.2s` | Collapse the remaining fill into the bottom edge. | `B(100, 100)` | `power4` |
| `2.2s` | Hide the SVG and call `done()`. | Collapsed at bottom | Immediate |

The departing page stays opaque during the first half of the overlay animation. At `1.1s`, its opacity changes immediately to `0` behind full coverage. It remains in the transition's DOM until Vue processes leave completion.

The second half uncovers the shared layout/background because the outgoing page is transparent and the incoming enter transition has not begun. This behavior follows directly from placing the entire `closeMenu` sequence in `onLeave`.

## 7. Composed navigation timeline

For an uninterrupted replacement with no delay between the two hooks:

```text
Time         0             1.1            2.2            3.3            4.4s
             |--------------|--------------|--------------|--------------|
Hook         onLeave                       onEnter
Overlay      cover downward reveal down    cover upward   reveal up
Old page     opacity 1      opacity 0      removed
New page                                   opacity 0      opacity 1
Complete     false ------------------------------------------------> true
```

The composition deliberately has two sweeps. Between the outgoing page's opacity change and the incoming page's opacity change, uncovered areas expose the layout/background. At the handoff, the SVG is collapsed and hidden before the enter timeline starts it again from the bottom.

The `3.3s` and `4.4s` positions are derived from back-to-back timelines, not a promise about elapsed time since a link click. Route readiness, Vue/Nuxt scheduling, and browser frame delivery influence the observed timing.

## 8. GSAP mechanics

### Attribute interpolation

`attr: { d: ... }` targets the path's SVG attribute. GSAP interpolates numeric values in the compatible path strings on its animation ticks. All keyframes retain the same command sequence and eight numeric slots, so this implementation does not require MorphSVG or path-topology normalization.

Changing the number or order of path commands would invalidate that simple correspondence. Changing only the control-point coordinates preserves it.

### Timeline ordering

Chained `.to()` calls without a position parameter are appended at the current timeline end. The explicit `0` on the first enter tween anchors it to the start, alongside the initial zero-duration sets.

These calls have different scheduling semantics:

- `gsap.set(...)` executes immediately, as used in `onBeforeEnter` and the enter fallback.
- `timeline.set(...)` schedules a zero-duration operation at a position in that timeline, as used for the full-coverage page swap and anchor change.

Moving the midpoint `.set(el, ...)` outside the timeline would change page visibility before full coverage. Moving `done()` to the midpoint would change Vue's transition ordering and allow the next hook to interact with the shared overlay while the previous sequence is still running.

### Easing

GSAP resolves the unsuffixed `power2` and `power4` names to their `.out` variants:

| Ease | Role |
| --- | --- |
| `power4.in` | Strong acceleration into the covering sweep. |
| `power2` / `power2.out` | Deceleration into the fully covered rectangle. |
| `power2.in` | Acceleration out of full coverage into the reveal. |
| `power4` / `power4.out` | Strong deceleration as the overlay leaves the screen. |

Using `power4.in` for the final segment would accelerate into the finish and materially change the reference's motion. The curve shape and the easing are independent: the SVG coordinates describe geometry, while easing controls progress between those coordinates over time.

### `autoAlpha` and opacity

`autoAlpha` is GSAP's combined opacity/visibility control:

- `autoAlpha: 1` makes the SVG opaque and restores visible rendering through `visibility: inherit`.
- `autoAlpha: 0` sets opacity to zero and visibility to hidden.

The normal page-root transitions use `opacity` alone. Only the missing-overlay leave fallback uses `autoAlpha` on the page itself.

The SVG path mutation is not a transform-only animation; it changes vector geometry and can require painting. Page-root opacity is a separate rendering operation. The normalized viewBox avoids resize calculations but does not make path interpolation compositor-only.

## 9. Completion signals and initialization

`useTransition()` exposes a module-scoped reactive object:

```ts
const transitionState = reactive({ transitionComplete: false })
```

Despite its name, `toggleTransitionComplete(value)` is a setter, not a boolean inversion.

| Event | State effect |
| --- | --- |
| Module initialization | `false` |
| Leave begins, including the fallback | `false` |
| Normal leave completes | Remains `false` |
| Normal enter completes | `true`, immediately before `done()` |
| Missing-overlay enter | `true`, immediately before synchronous `done()` |

Neither this flag nor `useOverlayRef()` is created through Nuxt's `useState()`. Both are module-level stores; they are not per-request SSR state or serialized DOM handles. Their intended DOM interactions occur on the client.

### Initial rendering

The transition configuration does not set `appear: true`. Ordinary initial rendering/hydration therefore does not run this enter sequence simply because the page mounted. The SVG initially has a zero-area path, and `Overlay.vue` hides the SVG in `onMounted`.

The initial `transitionComplete: false` consequently should not be treated as a universal indication that a page is hidden or still loading. This implementation sets it to `true` when an enter hook completes; it does not separately initialize it for an already rendered first page.

### Nuxt's `page:transition:finish` hook

In the installed Nuxt 3.21.8 runtime, `node_modules/nuxt/dist/pages/runtime/page.js` emits `page:transition:finish` from the injected **`onAfterLeave`** callback.

For this `out-in` transition, that event marks completion of the departing page's transition. It precedes completion of the entering SVG sequence. The project page currently subscribes to this event to call `ScrollTrigger.refresh()`; that subscription does not mean the incoming reveal has finished.

For work specifically synchronized to the final reveal, the relevant boundary in this implementation is the enter timeline's `onComplete`, or Vue's `onAfterEnter`. The custom `transitionComplete` flag is also set at that boundary during a normal enter. Recheck Nuxt's runtime behavior when upgrading, rather than deriving lifecycle semantics from a hook's name alone.

## 10. Missing-overlay behavior

Each hook checks both the SVG node and the path node before creating its normal timeline.

**Enter fallback:** logs a warning, restores page opacity to `1`, sets the completion flag to `true`, and calls `done()` synchronously.

**Leave fallback:** logs a warning and fades the page out over `0.6s` using `autoAlpha: 0`, with `done` as the timeline completion callback. The completion flag was already set to `false` at hook entry.

These checks keep a missing component ref from blocking normal transition completion. They establish availability only at the start of a hook; they do not monitor whether an already captured DOM node is later detached.

## 11. Runtime boundaries

The following details matter when integrating additional behavior with these hooks:

- **Shared animation target:** both timelines mutate the same path. Ordinary `out-in` execution provides ordering, but the implementation has no retained timeline handle, cancellation hooks, or explicit interruption policy for superseded navigation or layout teardown.
- **Completion on interruption:** the callbacks are registered on GSAP's `onComplete`. Killing a timeline does not automatically execute the normal completion path. Any future interruption handling needs an explicit policy for Vue's `done()`, page visibility, overlay visibility, and completion state.
- **Input remains enabled:** the SVG has `pointer-events: none`. Page opacity does not disable pointer events or keyboard focus, and the transition does not stop scrolling. The overlay is a visual cover, not an interaction lock.
- **Motion preference is local:** this transition does not inspect `prefers-reduced-motion`. Reduced-motion handling inside a page's own GSAP context does not automatically affect these timelines.
- **Page animation cleanup is separate:** reverting a page-scoped GSAP context or destroying its Lenis instance does not manage these independently created overlay timelines.
- **Styling:** the overlay is fixed at the viewport origin with `z-index: 9999999`. Its fill uses `$red`, currently `#fdacb5`, from [`_variables.scss`](../assets/scss/_variables.scss). Actual stacking still depends on the overlay's ancestor stacking contexts.
- **Stroke behavior:** `vector-effect="non-scaling-stroke"` is present on the path. The current appearance comes from the fill; the component does not assign a visible stroke.

## 12. Debugging and verification

Use the timeline boundaries above when inspecting the effect. A focused verification pass can check:

1. **Direction:** leave starts at the top and exits at the bottom; enter starts at the bottom and exits at the top.
2. **Coverage:** each midpoint is a full viewport rectangle before page opacity changes.
3. **Final state:** after enter completes, page opacity is `1`, SVG opacity is `0`, SVG visibility is hidden, and `transitionComplete` is `true`.
4. **DOM handoff:** the normal leave path keeps the outgoing root until the full 2.2-second timeline completes.
5. **Viewport scaling:** wide, tall, and resized viewports remain covered through the normalized viewBox.
6. **Fallbacks:** a missing SVG or path completes both hook paths instead of leaving Vue waiting indefinitely.

Useful symptoms and their corresponding areas of investigation:

| Symptom | Inspect |
| --- | --- |
| New content appears before the screen is covered. | `onBeforeEnter` and the position of the enter timeline's `.set(el, { opacity: 1 })`. |
| Reveal finishes abruptly. | Final easing: it should be `power4`, not `power4.in`. |
| A flash occurs at the midpoint. | The exact full-coverage paths used before and after the anchor switch. |
| Navigation remains in a transition state. | Whether the active timeline reaches `onComplete` and whether `done()` executes. |
| Layout/background is exposed between pages. | This is expected from the two full sequences and midpoint opacity changes; see the composed timeline. |
| A page's animation runs before the reveal finishes. | The lifecycle signal it uses; distinguish mount, `page:transition:finish`, and enter completion. |

For browser automation, wait for observable completion state rather than sleeping for exactly 4.4 seconds. Checking the expected page identity, page opacity, and hidden SVG together avoids mistaking the brief hidden-overlay handoff for final enter completion.

## References

- [Implementation: `transitionSetup.ts`](./transitionSetup.ts)
- [Codrops Theodore source](https://github.com/codrops/Theodore/blob/main/src/js/index.js)
- [Vue: JavaScript transition hooks](https://vuejs.org/guide/built-ins/transition.html#javascript-hooks)
- [Vue: transition modes](https://vuejs.org/guide/built-ins/transition.html#transition-modes)
- [GSAP: AttrPlugin](https://gsap.com/docs/v3/GSAP/CorePlugins/Attr/)
- [GSAP: CSSPlugin and `autoAlpha`](https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/)
