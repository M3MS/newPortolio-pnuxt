<script setup lang="ts">
import type { Content } from "@prismicio/client";

// The array passed to `getSliceComponentProps` is purely optional.
// Consider it as a visual hint for you when templating your slice.
defineProps(
  getSliceComponentProps<Content.BigWordzSlice>([
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
    class="intro"
  >
    <div class="intro__inner">
      <h1 class="intro-title">
        Code<br>
        <span class="hollow-text">Sweat<span class="small">&</span></span><br>
        Tears
      </h1>
    </div>
  </section>
</template>
