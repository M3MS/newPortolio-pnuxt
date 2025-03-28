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

  const elements = document.querySelectorAll('[data-scroll-trigger]')

  elements.forEach((element) => 

    gsap.to('[data-speed]', {
      y: (i, element) => (1 - Number.parseFloat(element.getAttribute('data-speed'))) * ScrollTrigger.maxScroll(window),
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: 'max',
        invalidateOnRefresh: true,
        scrub: 0,
      },
    })
  )
})
</script>

<template>
  <div id="project">
    <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }"> 
      <div class="hero">
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
      </div>
      <div class="intro">
        <PrismicText :field="page?.data.description" wrapper="p" class="text-split" />
      </div>
      <SliceZone
        wrapper="div"
        :slices="page?.data.slices ?? []"
        :components="components"
      />
    </vue-lenis>
  </div>
</template>