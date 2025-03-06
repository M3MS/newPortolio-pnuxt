<script setup lang="ts">
import type { Content } from "@prismicio/client";

defineProps(
  getSliceComponentProps<Content.IntroTextSlice>([
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
    data-scroll-section 
    class="hello"
  >
    <div class="hello__inner">
      <h3 class="hello__text text-split anim-text">
        <span>Hi there!</span>
        <PrismicText :field="slice.primary.intro_text" wrapper="p"/>
      </h3>
    </div>
  </section>
</template>
