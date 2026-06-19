<script setup lang="ts">
import { computed } from "vue";
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// The array passed to `getSliceComponentProps` is purely optional.
// Consider it as a visual hint for you when templating your slice.
const props = defineProps(
  getSliceComponentProps<Content.PifPafSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const speed = computed<number>(() => {
  const r = seededRandom(props.index + 1);
  const value = 0.7 + r * 0.3; // range [0.7, 1.0)
  return Number(value.toFixed(2));
});

const isPined = props.slice.primary.pin_image;
console.log(isPined);

if (isPined) {
  let ctx: any = null;

  onMounted(() => {
    ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ".media",
        start: "top top",
        end: "bottom 80%",
        pin: ".text-content",
        markers: true,
      });
    });
  });
}
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="pifpaf"
    :class="{
      'pifpaf--revert': slice.variation === 'revert',
      'pifpaf--pined': slice.primary.pin_image,
    }"
  >
    <div class="text-content">
      <ClientOnly>
        <PrismicRichText
          :field="slice.primary.text_content"
          wrapper="p"
          class="text-split"
        />
        <template #fallback>
          <PrismicText :field="slice.primary.text_content" wrapper="p" />
        </template>
      </ClientOnly>
    </div>
    <div class="media" data-scroll-trigger :data-speed="speed">
      <PrismicImage
        v-if="$prismic.isFilled.image(slice.primary.image)"
        :field="slice.primary.image"
        :imgix-params="{
          auto: null,
          fm: 'webp',
          q: 100,
        }"
      />
      <video
        v-if="$prismic.isFilled.keyText(slice.primary.video_link)"
        loop
        muted
        autoplay
        playsinline
      >
        <source :src="slice.primary.video_link" type="video/mp4" />
      </video>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pifpaf {
  position: relative;
  width: 100%;
  max-width: 90vw;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: 800px) {
    flex-direction: row;
    padding: 10vw 0;
    //align-items: center;
    justify-content: space-around;
  }

  .text-content {
    width: 55vw;
    font-size: 1.8rem;
    will-change: transform;
    margin: 5vh;

    @media (min-width: 800px) {
      width: 25vw;
      font-size: 1.3vw;
    }
  }

  .media {
    width: 70vw;
    overflow-y: scroll;
    position: relative;
    margin-left: auto;
    will-change: transform;

    img {
      width: 100%;
      height: auto;
      object-fit: cover;
      object-position: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
    }

    video {
      width: 100%;
      height: auto;
      object-fit: cover;
      object-position: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }
  }

  &--revert {
    @media (min-width: 800px) {
      flex-direction: row-reverse;

      .media {
        margin-left: 0;
        margin-right: auto;
      }
    }
  }

  &--pined {
    .text-content {
      display: flex;
      align-items: center;
      height: 100vh !important;
    }

    .media {
      max-width: 1200px;
    }
  }
}
</style>
