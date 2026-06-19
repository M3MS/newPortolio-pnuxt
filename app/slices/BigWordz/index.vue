<script setup lang="ts">
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

defineProps(
  getSliceComponentProps<Content.BigWordzSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);

let split: SplitText | null = null;
let ctx: any = null;

onMounted(() => {
  ctx = gsap.context(() => {
    split = SplitText.create(".intro-title", { type: "lines, words" });

    const introTl = gsap.timeline({ delay: 2 });

    gsap.to(".intro-title", {
      opacity: 1,
    });

    split.words.forEach((word) => {
      introTl.from(word, {
        opacity: 0,
        y: 200,
        duration: 0.5,
        delay: 0.1,
        stagger: 0.05,
        ease: "power3.out",
      });
    });
  });
});

onUnmounted(() => {
  split?.revert();
  ctx?.revert();
});
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="intro"
  >
    <div class="intro__inner">
      <h1 class="intro-title">
        Code<br />
        <span class="hollow-text">Sweat<span class="small">&</span></span
        ><br />
        Tears
      </h1>
    </div>
  </section>
</template>
