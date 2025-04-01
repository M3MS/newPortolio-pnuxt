<script setup lang="ts">
import type { Content } from "@prismicio/client";

// The array passed to `getSliceComponentProps` is purely optional.
// Consider it as a visual hint for you when templating your slice.
defineProps(
  getSliceComponentProps<Content.PifPafSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="pifpaf"
    :class="{
      'pifpaf--revert': slice.variation === 'revert'
    }"
  >
  <div class="text-content" data-scroll-trigger data-speed="0.9">
    <PrismicRichText :field="slice.primary.text_content" wrapper="p" class="text-split" />
  </div>
  <div class="media" data-scroll-trigger data-speed="0.8">
    <PrismicImage
      v-if="$prismic.isFilled.image(slice.primary.image)"
      :field="slice.primary.image"
      :imgix-params="{ auto: null }"
      />
  </div>
  </section>
</template>

<style lang="scss" scoped>
.pifpaf {
  position: relative;
  width: 100%;
  max-width: 90vw;
  height: 70vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  mix-blend-mode: exclusion;

  @media (min-width: 800px) {
    flex-direction: row;
    height: 90vh;
    align-items: center;
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
      position: relative;
      margin-left: auto;
      will-change: transform;

      img {
          width: 100%;
          height: auto;
          object-fit: cover;
          object-position: center;
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
}

</style>