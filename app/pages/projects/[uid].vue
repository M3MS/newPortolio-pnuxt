<script setup lang="ts">
import { components } from "~/slices";
import { VueLenis, useLenis } from 'lenis/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import textEffect  from '~/utils/textEffect';

defineOptions({
  inheritAttrs: false,
});

gsap.registerPlugin(ScrollTrigger);

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

const lerp = ref(0.1)
const autoRaf = ref(true)

const lenis = useLenis((lenis) => {
    lenis.on('scroll', ScrollTrigger.update)
})

const lenisRef = ref()

watch(
  lenis,
  (lenis) => {
    
  },
  { immediate: true }
)


onMounted(() => {

  lenisRef.value = lenis

  ScrollTrigger.scrollerProxy(lenisRef.value.$el, {
    scrollTop(value) {
      return arguments.length ? lenisRef.value.$el.scrollTop = value : lenisRef.value.$el.scrollTop
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
    }
  })

  ScrollTrigger.defaults({ scroller: lenisRef.value.$el })
  ScrollTrigger.refresh()

  textEffect()

  let mm = gsap.matchMedia();

  mm.add("(min-width: 800px)", () => {
    const elements = document.querySelectorAll('[data-scroll-trigger]')

    elements.forEach((element) => 

      gsap.to('[data-speed]', {
        y: (i, element) => (1 - Number.parseFloat(element.getAttribute('data-speed'))) * ScrollTrigger.maxScroll(window),
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: () => "+=" + ScrollTrigger.maxScroll(window),
          invalidateOnRefresh: true,
          scrub: 0,
          markers: true,
        },
      })
    )
  });

  
})
</script>

<template>
  <div id="project">
    <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }"> 
      <section class="hero">
        <div class="hero__inner">
          <div class="hero__title">
            <PrismicText :field="page?.data.company" wrapper="h1" class="is-bold title-md text-uppercase hollow-text" />
            <span class="lead">{{page?.data.tech_stack }}</span>
          </div>
          <div class="hero__image">
            <div class="aspect"></div>
            <PrismicImage v-if="$prismic.isFilled.image(page?.data.hero)" :field="page?.data.hero" />
          </div>
        </div>
      </section>
      <section class="intro">
        <PrismicText :field="page?.data.description" wrapper="p" class="text-split" />
      </section>
      <SliceZone
        wrapper="div"
        :slices="page?.data.slices ?? []"
        :components="components"
      />
      <section class="more">
        <div class="more__inner">
          <NuxtLink to="/" class="btn btn--primary">See all projects</NuxtLink>
        </div>
      </section>
    </vue-lenis>
  </div>
</template>
<style lang="scss" scoped >
#project {
  .hero {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    mix-blend-mode: exclusion;

    &__inner {
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      justify-content: center;
      height: 100%;
    }

    &__title {
      background-color: $dark-blue;
      z-index: 1;
      padding: 3rem;

      h1 {
          line-height: 0.9;
      }

      span  {
          display: block;
          font-size: 1.2rem;
          padding-left: 1vw;
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