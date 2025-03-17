<script setup lang="ts">
import { components } from "~/slices";
import { VueLenis, useLenis } from 'lenis/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

const lenis = useLenis(
  (lenis) => {
    lenis.on('scroll', ScrollTrigger.update)
  },
  0,
  'root'
)

const lenisRef = ref()

watch(
  lenis,
  (lenis) => {
    
  },
  { immediate: true }
)

onMounted(() => {
  /*--------------------
  Parallax data-scroll
  --------------------*/
  document.querySelectorAll('[data-scroll]').forEach((el) => {

    const speed = el.dataset.scrollSpeed * 100
    const zoom = el.dataset.scrollZoom || 1

    gsap.set(el, {
      scale: zoom
    })

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        scrub: true,
        start: 'top 90%',
        end: 'bottom 0%',
        once: false
      },
      y: `${-speed}%`,
      ease: 'none'
    })
  })
})
</script>

<template>
  <div id="project">
    <vue-lenis class="scroller" ref="lenisRef" root :options="{ lerp, autoRaf }"> 
      <div class="hero">
        <div class="hero__inner">
          <PrismicImage v-if="$prismic.isFilled.image(page?.data.hero)" :field="page?.data.hero" class="hero__img" />
          <div class="hero__title">
            <PrismicText :field="page?.data.company" wrapper="h1" class="is-bold title-md text-uppercase hollow-text" />
            <span class="lead">{{page?.data.tech_stack }}</span>
          </div>
        </div>
      </div>
      <div class="intro">
        <PrismicText :field="page?.data.description" wrapper="p" />
      </div>
      <SliceZone
        wrapper="div"
        :slices="page?.data.slices ?? []"
        :components="components"
      />
    </vue-lenis>
  </div>
</template>