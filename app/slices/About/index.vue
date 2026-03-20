<script setup lang="ts">
import type { Content } from "@prismicio/client";

// The array passed to `getSliceComponentProps` is purely optional.
// Consider it as a visual hint for you when templating your slice.
defineProps(
  getSliceComponentProps<Content.AboutSlice>([
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
    class="about"
  >
    <div class="about__inner">
      <h3  data-scroll data-scroll-speed="3" class="about__title title-lg is-bold text-split">ABOUT</h3>
      <PrismicImage :field="slice.primary.background" class="about__img" />
      <PrismicText 
        :field="slice.primary.body"
        wrapper="p"
        data-scroll 
        data-scroll-speed="4" 
        class="about__text anim-text text-split"
      />
    </div>
  </section>

</template>
