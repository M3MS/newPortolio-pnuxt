<script setup lang="ts">
import gsap from "gsap";
import type { Content } from "@prismicio/client";

defineProps(
  getSliceComponentProps<Content.SkillsSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);

let mm: ReturnType<typeof gsap.matchMedia> | null = null
let ctx: any = null

onMounted(() => {
  mm = gsap.matchMedia()

  mm.add("(max-width: 768px)", () => {
    const mobileTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".marquee",
        start: "-100% bottom",
        scrub: 1,
      },
    })

    mobileTL.to(".first", { duration: 2, xPercent: -100 })
            .to(".second", { duration: 2, xPercent: 100 }, "<")
  })

  mm.add("(min-width: 769px)", () => {
    const desktopTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".marquee",
        start: "10% bottom",
        scrub: 5,
      },
    })

    desktopTL.to(".first", { duration: 2, xPercent: -100 })
             .to(".second", { duration: 2, xPercent: 100 }, "<")
  })

  ctx = gsap.context(() => {
    gsap.to('.techno', {
      backgroundColor: 'rgb(249 255 107)',
      ease: "sine.in",
      duration: 1,
      scrollTrigger: {
        start: "top 70%",
        trigger: ".techno",
      },
    })
  })
})

onUnmounted(() => {
  mm?.revert()
  ctx?.revert()
})
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="techno"
  >
    <PrismicText
    :field="slice.primary.heading"
    wrapper="h3"
    class="lead text-center is-bold text-split"
    />
    <div class="marquee">
      <div class="marquee__inner first">
        <span>GSAP</span>
        <span>COFFEE</span>
        <span>THREEJS</span>
        <span>ES6</span>
      </div>
      <div class="marquee__inner second">
        <span>WORDPRESS</span>
        <span>CLUBMATE</span>
        <span>BEDROCK</span>
        <span>WEBPACK</span>
      </div>
      <div class="marquee__inner first">
        <span>GULP</span>
        <span>COMPOSER</span>
        <span>PIZZA</span>
        <span>DOCKER</span>
      </div>
      <div class="marquee__inner second">
        <span>VUE</span>
        <span>LARAVEL</span>
        <span>SASS</span>
        <span>FIGMA</span>
      </div>
    </div>
  </section>
</template>
