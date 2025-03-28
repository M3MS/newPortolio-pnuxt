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
  height: 90vh;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;

  &--revert {
      flex-direction: row-reverse;
  }

  .text-content {
      width: 25vw;
      font-size: 1.2vw;
      will-change: transform;
  }

  .media {
      width: 50vw;
      height: 100%;
      position: relative;
      will-change: transform;

      img {
          width: 100%;
          height: auto;
          object-fit: cover;
          object-position: center;
      }
  }
}

</style>