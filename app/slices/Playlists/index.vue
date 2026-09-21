<script setup lang="ts">
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

defineProps(getSliceComponentProps<Content.PlaylistsSlice>());
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
  >
    <div class="playlists__inner">
      <PrismicText
          :field="slice.primary.section_title"
          wrapper="h2"
          class="title-md is-bold text-split"
        />
    </div>
  </section>
</template>
