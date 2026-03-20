# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Run Nuxt dev server + Slice Machine UI concurrently
npm run nuxt:dev     # Nuxt dev server only
npm run slicemachine # Slice Machine UI only
npm run build        # Production build
npm run generate     # Static site generation
npm run preview      # Preview production build
npm run lint         # ESLint
```

Slice Machine UI runs at `http://localhost:9999` and the slice simulator at `http://localhost:3000/slice-simulator`.

## Architecture

**Stack**: Nuxt 3 + Prismic CMS + GSAP + Three.js + Lenis + SCSS

### Content & Routing

Content is managed in Prismic. Three document types exist: `page`, `project`, and `settings`. Routes are configured in `nuxt.config.ts`:
- `/` → `page` document with UID `"home"`
- `/:uid` → any `page` document
- `/projects/:uid` → `project` document

Pages fetch their document via `prismic.client.getByUID()` then render a `<SliceZone>` with the document's slices.

### Slices

Slices are reusable content blocks defined in `app/slices/`. Each slice has a component (`index.vue`), a model (`model.json`), mock data (`mocks.json`), and a screenshot. The `app/slices/index.ts` file auto-registers them as async components for SliceZone.

Slice Machine manages slice models — run `npm run slicemachine` to open the visual editor. Prismic custom type schemas live in `customtypes/`.

### Layout & Page Transitions

`app/layouts/default.vue` wraps all pages with `AppHeader`, `AppFooter`, `Overlay`, and a `<Transition>` component. Page transitions use SVG path morphing (wavy blob) via GSAP:
- `app/utils/transitionSetup.ts` — defines `onBeforeEnter`/`onEnter`/`onLeave` GSAP hooks
- `app/composables/useOverlayRef.ts` — provides the overlay component ref across the app
- `app/composables/transition.ts` — reactive state for transition completion status

The transition mode is `out-in`, named `page-transiton` (note: not a typo in the codebase, matches the CSS class).

### Animations

- **Text effects**: `app/utils/textEffect.js` — splits `.text-split` elements into words using GSAP SplitText, animates them on scroll via ScrollTrigger
- **Blob scene**: `app/scenes/BlobSceneClass.js` — Three.js WebGL scene used on the homepage. Features an icosahedron with custom vertex/fragment shaders, a particle system (7000 points in golden spiral), mouse-driven deformation, and ScrollTrigger-based camera animations. Uses GSAP uniforms: `uTime`, `uSpeed`, `uNoiseDensity`, `uNoiseStrength`, `uFrequency`, `uAmplitude`, `uIntensity`

### Styling

SCSS with global variable injection. `app/assets/scss/_variables.scss` is automatically available in all component styles (configured via Vite `preprocessorOptions`). No CSS modules — standard scoped Vue styles.
