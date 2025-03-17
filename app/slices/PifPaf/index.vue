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
  >
  <div class="text-content" data-scroll data-scroll-speed="-0.5">
    <PrismicRichText :field="slice.primary.text_content" />
  </div>
  <figure class="js-plane" data-scroll data-scroll-speed="-1.5">
    <div class="aspect"></div>
    <PrismicImage
      v-if="$prismic.isFilled.image(slice.primary.image)"
      :field="slice.primary.image" />
  </figure>
  </section>
</template>
