<script setup lang="ts">
import type { Content } from "@prismicio/client";

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
      <h2 class="about__title title-lg is-bold text-split">ABOUT</h2>
      <PrismicImage :field="slice.primary.background" class="about__img" />
      <div class="is-flex justify-end">
        <PrismicRichText
          :field="slice.primary.about_text"
          wrapper="div"
          class="about__text text-split"
        />
      </div>
    </div>
  </section>
</template>
