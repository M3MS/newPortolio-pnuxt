<script setup lang="ts">
import type { VueLenis } from "lenis/vue";
import { Scene } from "~/scenes/BlobSceneClass";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { VideoPlayerElement } from '@videojs/html/video';
import '@videojs/html/video/minimal-skin';

defineOptions({ inheritAttrs: false });

const prismic = usePrismic();
const route = useRoute();
const nuxtApp = useNuxtApp();
const [{ data: page }, { data: projects }] = await Promise.all([
  useAsyncData(`[project-uid-${route.params.uid}]`, () =>
    prismic.client.getByUID("project", route.params.uid as string),
  ),
  useAsyncData("project-navigation", () =>
    prismic.client.getAllByType("project", {
      fetch: ["project.company"],
      orderings: [{ field: "document.first_publication_date", direction: "desc" }],
    }),
  ),
]);

const projectName = computed(() => prismic.asText(page.value?.data.company));
const technologies = computed(() =>
  (page.value?.data.tech_stack ?? "").split(/\s+-\s+|,/).map((item) => item.trim()).filter(Boolean),
);
const nextProject = computed(() => {
  const items = projects.value ?? [];
  const index = items.findIndex((project) => project.id === page.value?.id);
  return items.length > 1 && index !== -1 ? items[(index + 1) % items.length] : null;
});

const player = ref<VideoPlayerElement | null>(null);

useSeoMeta({
  title: () => page.value?.data.meta_title,
  ogTitle: () => page.value?.data.meta_title,
  description: () => page.value?.data.meta_description,
  ogDescription: () => page.value?.data.meta_description,
  ogImage: () => prismic.asImageSrc(page.value?.data.meta_image),
});

const projectRef = ref<HTMLElement | null>(null);
const blob = ref<HTMLDivElement | null>(null);
const lenisRef = ref<InstanceType<typeof VueLenis> | null>(null);
const reducedMotion = ref(false);
const lenisOptions = computed(() => ({
  lerp: 0.1,
  autoRaf: false,
  smoothWheel: !reducedMotion.value,
  prevent: (node: HTMLElement) =>
    node.classList.contains("project__details") && node.scrollHeight > node.clientHeight,
}));
let mediaContext: gsap.MatchMedia | undefined;

watchEffect((onCleanup) => {
  const lenis = lenisRef.value?.lenis;
  if (!lenis) return;

  const update = (time: number) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(update);

  onCleanup(() => {
    lenis.off("scroll", ScrollTrigger.update);
    gsap.ticker.remove(update);
  });
});

function refreshScroll() {
  ScrollTrigger.refresh();
}

const removeTransitionHook = nuxtApp.hook("page:transition:finish", refreshScroll);

onMounted(async () => {
  await document.fonts.ready;
  if (!projectRef.value) return;

  mediaContext = gsap.matchMedia();
  mediaContext.add({
    reduce: "(prefers-reduced-motion: reduce)",
    animate: "(prefers-reduced-motion: no-preference)",
  }, (context) => {
    reducedMotion.value = Boolean(context.conditions?.reduce);
    if (reducedMotion.value) return;

    const scene = blob.value ? new Scene({ domElement: blob.value }) : null;
    gsap.utils.toArray<HTMLElement>(".project-gallery__entry").forEach((entry) => {
      gsap.from(entry, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: entry, start: "top 95%", once: true },
      });
    });

    return () => scene?.cleanup();
  }, projectRef.value);
  refreshScroll();
});

onBeforeUnmount(() => {
  mediaContext?.revert();
  removeTransitionHook();
});
</script>

<template>
  <main id="project" ref="projectRef" class="project">
    <vue-lenis ref="lenisRef" root :options="lenisOptions">
      <div class="project__layout">
        <section
          class="project__info"
          aria-labelledby="project-title"
        >
          <div class="project__heading">
            <NuxtLink to="/" class="project__back">
              <span aria-hidden="true">↖</span> All projects
            </NuxtLink>
            <div class="project__masthead">
              <p class="project__eyebrow">Selected work / Case study</p>
              <div ref="blob" class="project__blob" aria-hidden="true" />
              <h1 id="project-title" class="project__title">{{ projectName }}</h1>
            </div>
          </div>

          <div class="project__details">
            <div v-if="prismic.isFilled.richText(page?.data.description)" class="project__row">
              <h2 class="project__label">Overview</h2>
              <PrismicRichText :field="page?.data.description" wrapper="div" class="project__description" />
            </div>
            <div class="project__row">
              <h2 class="project__label">Details</h2>
              <dl class="project__facts">
                <div class="project__fact">
                  <dt class="project__term">Company</dt>
                  <dd class="project__value">{{ projectName }}</dd>
                </div>
                <div v-if="technologies.length" class="project__fact project__fact--stack">
                  <dt class="project__term">Built with</dt>
                  <dd class="project__value">
                    <ul class="project__tags" aria-label="Technology stack">
                      <li v-for="technology in technologies" :key="technology" class="project__tag">
                        {{ technology }}
                      </li>
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="project__row project__navigation">
            <span class="project__label">{{ nextProject ? "Up next" : "Keep exploring" }}</span>
            <NuxtLink
              :to="nextProject ? `/projects/${nextProject.uid}` : '/'"
              class="project__next"
            >
              <span>{{ nextProject ? prismic.asText(nextProject.data.company) : "All projects" }}</span>
              <span class="project__arrow" aria-hidden="true">↗</span>
            </NuxtLink>
          </div>
        </section>

        <section class="project-gallery" aria-label="Project showcase">
          <figure class="project-gallery__cover">
            <div class="project-gallery__toolbar" aria-hidden="true">
              <span class="project-gallery__dots"><i /><i /><i /></span>
              <span>{{ projectName }} / Website preview</span>
              <span>01</span>
            </div>
            <div class="project-gallery__stage">
              <PrismicImage
                v-if="prismic.isFilled.image(page?.data.hero)"
                :field="page?.data.hero"
                :alt="page?.data.hero.alt || `${projectName} — website preview`"
                :imgix-params="{ w: 1600, q: 85, auto: 'format,compress' }"
                class="project-gallery__hero"
                fetchpriority="high"
                @load="refreshScroll"
              />
              <img
                v-else
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85"
                alt="Placeholder: laptop on a creative workspace"
                class="project-gallery__hero"
                width="1600"
                height="1067"
                @load="refreshScroll"
              >
            </div>
            <figcaption class="project-gallery__cover-caption">
              <span>{{ projectName }} — a closer look</span>
              <span aria-hidden="true">Scroll to explore ↓</span>
            </figcaption>
          </figure>

          <template v-for="(slice, index) in page?.data.slices" :key="slice.id">
            <figure v-if="slice.slice_type === 'pif_paf'" class="project-gallery__entry">
              <div class="project-gallery__media">
                <PrismicImage
                  v-if="prismic.isFilled.image(slice.primary.image)"
                  :field="slice.primary.image"
                  :alt="slice.primary.image.alt || `${projectName} — interface detail ${index + 1}`"
                  :imgix-params="{ w: 1400, q: 85, auto: 'format,compress' }"
                  class="project-gallery__image"
                  loading="lazy"
                  @load="refreshScroll"
                />
                <video-player ref="player" class="video-player" v-if="'video_link' in slice.primary && slice.primary.video_link">
                    <video
                      autoplay 
                      muted
                      playsinline
                      :src="slice.primary.video_link"
                      class="project-gallery__video video-js"
                      preload="metadata"
                      @loadedmetadata="refreshScroll"
                      loop="true"
                    >
                    </video>
                </video-player>
              </div>
              <figcaption class="project-gallery__caption">
                <span class="project-gallery__number">{{ String(index + 2).padStart(2, '0') }}</span>
                <PrismicRichText
                  v-if="prismic.isFilled.richText(slice.primary.text_content)"
                  :field="slice.primary.text_content"
                  wrapper="div"
                  class="project-gallery__copy"
                />
              </figcaption>
            </figure>
            <div
              v-else-if="slice.slice_type === 'rich_text'"
              class="project-gallery__entry project-gallery__entry--text"
            >
              <PrismicRichText :field="slice.primary.content" wrapper="div" class="project-gallery__copy" />
            </div>
          </template>

          <NuxtLink
            :to="nextProject ? `/projects/${nextProject.uid}` : '/'"
            class="project-gallery__next"
          >
            <span class="project__label">{{ nextProject ? "Next project" : "Back to the archive" }}</span>
            <span class="project-gallery__next-title">
              {{ nextProject ? prismic.asText(nextProject.data.company) : "All projects" }}
              <span aria-hidden="true">↗</span>
            </span>
          </NuxtLink>
        </section>
      </div>
    </vue-lenis>
  </main>
</template>

<style lang="scss" scoped>
.project {
  --project-gutter: clamp(2.4rem, 4vw, 7.2rem);
  color: $red;
  padding-right: 4rem;

  &__layout {
    display: grid;
    align-items: start;
  }

  &__info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4.8rem;
    padding: 3.2rem var(--project-gutter) 4.8rem;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 1.2rem;
    min-height: 4.4rem;
    color: $red;
    font-size: 1.4rem;

    &:hover { color: $green; }
  }

  &__masthead {
    position: relative;
    isolation: isolate;
    padding-top: 3.2rem;
  }

  &__eyebrow,
  &__label {
    font-size: 1.1rem;
    line-height: 1.5;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__eyebrow {
    color: $green;
    margin-bottom: 2.4rem;
  }

  &__title {
    position: relative;
    font-size: clamp(5.6rem, 16vw, 14rem);
    font-weight: bold;
    line-height: 0.9;
    letter-spacing: -0.055em;
    text-transform: uppercase;
    overflow-wrap: anywhere;
    -webkit-text-stroke: 1.5px $red;
    color: transparent;
  }

  &__blob {
    position: absolute;
    z-index: -1;
    inset: 0 -1rem -3rem 25%;
    opacity: 0.45;
    pointer-events: none;
    overflow: hidden;
    border-radius: 50%;
  }

  &__details {
    display: grid;
    gap: 3.6rem;
  }

  &__row {
    display: grid;
    gap: 1.6rem;
    min-width: 0;
  }

  &__label { padding-top: 0.4rem; }

  &__description {
    font-size: clamp(1.6rem, 1.35vw, 1.9rem);
    line-height: 1.6;
  }

  &__facts { min-width: 0; }

  &__fact {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 1.6rem;
    padding: 1.6rem 0;
    border-top: 1px solid rgba($red, 0.35);

    &--stack { grid-template-columns: 1fr; }
  }

  &__term { font-size: 1.3rem; }
  &__value { overflow-wrap: anywhere; }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__tag {
    padding: 0.8rem 1.2rem 0.6rem;
    border: 1px solid rgba($red, 0.5);
    border-radius: 2rem;
    font-size: 1.3rem;
    line-height: 1;
  }

  &__navigation {
    padding-top: 2.4rem;
    border-top: 1px solid rgba($red, 0.35);
  }

  &__next {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;
    color: $red;
    font-size: clamp(2.8rem, 3vw, 4.8rem);
    font-weight: bold;
    line-height: 1.1;
    overflow-wrap: anywhere;

    &:hover { color: $green; }
    &:hover .project__arrow { transform: translate(0.4rem, -0.4rem); }
  }

  &__arrow { transition: transform 0.25s ease; }

  :deep(a:focus-visible) {
    outline: 2px solid $green;
    outline-offset: 6px;
  }

  :deep(.project__description p + p),
  :deep(.project-gallery__copy p + p) { margin-top: 1.6rem; }

  :deep(.project__description a),
  :deep(.project-gallery__copy a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.3em;
  }

  @media (min-width: 768px) {
    padding-right: 8rem;
  }

  @media (min-width: 1100px) {
    &__layout { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); }

    &__info {
      position: sticky;
      top: 0;
      height: 100vh;
      gap: clamp(2.4rem, 4vh, 6rem);
      padding-top: 3.2rem;
      padding-bottom: 3.2rem;
    }

    &__heading,
    &__navigation { flex-shrink: 0; }

    &__title { font-size: clamp(6.4rem, 8.5vw, 16rem); }
    &__details {
      min-height: 0;
      margin-top: auto;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba($red, 0.5) transparent;
    }
    &__row { grid-template-columns: minmax(7rem, 0.35fr) minmax(0, 1fr); }
  }
}

.project-gallery {
  display: grid;
  gap: 3.2rem;
  min-width: 0;
  padding: 0 var(--project-gutter) 4.8rem;

  &__cover {
    overflow: hidden;
    border: 1px solid $red;
    border-radius: 2.1rem;
  }

  &__toolbar,
  &__cover-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;
    padding: 1.6rem;
    font-size: 1rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &__dots {
    display: flex;
    gap: 0.4rem;

    i {
      width: 0.5rem;
      height: 0.5rem;
      border: 1px solid $red;
      border-radius: 50%;

      &:first-child { background: $green; border-color: $green; }
    }
  }

  &__stage {
    display: flex;
    align-items: center;
    min-height: 38rem;
    padding: clamp(2rem, 3vw, 5rem);
    background: $red;
    background-image: radial-gradient(ellipse at 85% 15%, rgba($white, 0.4), transparent 65%);
  }

  &__hero {
    width: 100%;
    height: auto;
    border-radius: 0.6rem;
    box-shadow: 0 2rem 5rem rgba($dark-blue, 0.25);
  }

  &__entry {
    min-width: 0;

    &--text {
      padding: 3.2rem;
      border-block: 1px solid rgba($red, 0.35);
    }
  }

  &__media {
    overflow: hidden;
    border-radius: 1.6rem;
    background: rgba($red, 0.05);
  }

  &__image,
  &__video {
    display: block;
    width: 100%;
    height: auto;
  }

  &__video {
    video {
      height: 50vh;
    }
  }

  &__caption {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr);
    gap: 1.6rem;
    padding: 2rem 0 0.8rem;
  }

  &__number {
    padding-top: 0.3rem;
    color: $green;
    font-size: 1.1rem;
  }

  &__copy {
    font-size: 1.5rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  &__next {
    display: grid;
    gap: 4.8rem;
    padding: 3.2rem;
    border: 1px solid $red;
    border-radius: 2.1rem;
    color: $red;
    transition: background-color 0.25s ease, color 0.25s ease;

    &:hover { background-color: $red; color: $dark-blue; }
  }

  &__next-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;
    font-size: clamp(3.2rem, 5vw, 7.2rem);
    font-weight: bold;
    line-height: 1;
    overflow-wrap: anywhere;
  }

  @media (min-width: 1100px) {
    gap: 4rem;
    padding: 0 0 3.2rem;

    &__cover {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    &__toolbar,
    &__cover-caption { flex-shrink: 0; }

    &__stage {
      flex: 1;
      min-height: 0;
      justify-content: center;
    }

    &__hero {
      width: auto;
      max-height: 100%;
      object-fit: contain;
    }
  }
}
</style>
