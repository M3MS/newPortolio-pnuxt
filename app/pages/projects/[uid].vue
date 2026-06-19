<script setup lang="ts">
import { components } from "~/slices";
import { Scene } from "~/scenes/BlobSceneClass";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import textEffect from "~/utils/textEffect";

defineOptions({
  inheritAttrs: false,
});

const prismic = usePrismic();
const route = useRoute();
const { data: page } = await useAsyncData(
  `[project-uid-${route.params.uid}]`,
  () => prismic.client.getByUID("project", route.params.uid as string),
);

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => prismic.asImageSrc(page.value?.data.meta_image)),
});
const blob = ref(null);

const lerp = ref(0.1);

const autoRaf = ref(false);

const lenisRef = ref();

let sceneInstance: any = null;
let textEffectCleanup: (() => void) | null = null;

watchEffect((onInvalidate) => {
  if (!lenisRef.value?.lenis) return;

  lenisRef.value.lenis.on("scroll", ScrollTrigger.update);

  function update(time: number) {
    lenisRef.value?.lenis?.raf(time * 1000);
  }
  gsap.ticker.add(update);

  onInvalidate(() => {
    gsap.ticker.remove(update);
  });
});

onMounted(() => {
  if (!blob.value) return;

  sceneInstance = new Scene({ domElement: blob.value });

  document.fonts.ready.then(() => {
    textEffectCleanup = textEffect();
    ScrollTrigger.refresh();
  });
});

onUnmounted(() => {
  textEffectCleanup?.();
});
</script>

<template>
  <main id="project">
    <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }">
      <section class="hero">
        <div class="hero__inner">
          <div class="hero__title">
            <PrismicText
              :field="page?.data.company"
              wrapper="h1"
              class="is-bold title-md text-uppercase hollow-text"
            />
            <span class="lead">{{ page?.data.tech_stack }}</span>
            <div class="hero__blob" ref="blob" />
          </div>
          <div class="hero__image">
            <div class="aspect"></div>
            <PrismicImage
              v-if="$prismic.isFilled.image(page?.data.hero)"
              :field="page?.data.hero"
            />
          </div>
        </div>
      </section>
      <section class="intro">
        <ClientOnly>
          <PrismicText
            :field="page?.data.description"
            wrapper="p"
            class="text-split"
          />
          <template #fallback>
            <PrismicText :field="page?.data.description" wrapper="p" />
          </template>
        </ClientOnly>
      </section>
      <SliceZone
        wrapper="div"
        :slices="page?.data.slices ?? []"
        :components="components"
      />
      <section class="more">
        <div class="more__inner">
          <NuxtLink to="/" class="">See All Projects</NuxtLink>
        </div>
      </section>
    </vue-lenis>
  </main>
</template>
<style lang="scss" scoped>
#project {
  .hero {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;

    &__blob {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      z-index: -1;
    }

    &__inner {
      display: flex;
      flex-wrap: wrap;
      height: 100%;
    }

    &__title {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: $dark-blue;
      border: 4px solid $red;
      padding: 50px;
      margin: 50px;
      border-radius: 21px;
      max-width: calc(45% - 100px);
      flex: 0 0 calc(45% - 100px);
      position: relative;
      z-index: 1;
      overflow: hidden;
      mix-blend-mode: exclusion;

      h1 {
        line-height: 0.9;
        font-size: 10svw;
        -webkit-text-stroke: 5px $black;
      }

      span {
        display: block;
        font-size: 1.2rem;
        padding-left: 1vw;
        color: $dark;
      }

      @media (min-width: 800px) {
        background-color: transparent;
        padding: 0 0 0 3vw;

        span {
          font-size: 1.4vw;
        }
      }
    }

    &__image img {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      object-fit: cover;
      object-position: center;
      will-change: transform;

      @media (min-width: 800px) {
        object-position: -50vw center;
        top: 0;
        left: 55vw;
        right: auto;
        width: 35vw;
        height: 100%;
      }
    }
  }

  .intro {
    width: 100vw;
    display: flex;
    padding: 15vh 0;
    justify-content: center;
    align-items: center;
    text-align: center;
    mix-blend-mode: exclusion;

    p {
      font-size: 2rem;
      max-width: 80vw;

      @media (min-width: 800px) {
        font-size: 1.3vw;
        max-width: 60vw;
      }
    }
  }

  .more {
    width: 100vw;
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    mix-blend-mode: exclusion;

    a {
      font-size: 2.5rem;
      max-width: 60vw;
    }
  }
}
</style>
