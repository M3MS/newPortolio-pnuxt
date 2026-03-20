<script setup lang="ts">
import type { Content } from "@prismicio/client";
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

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

onMounted(() => {
  let introSplit = new SplitText('.intro-title', {type: "lines, words"});
  let introText = introSplit.words;
  let introTl = gsap.timeline({paused: true, delay: 2.5});
  let ctx;

  introText.forEach(word => {

    introTl.from(word, {
      opacity: 0,
      y: 150,
      duration: 0.5,
      delay: 0.2,
      stagger: 0.05,
      ease: "power3"
    })

  });

  introTl.play();

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
        Code<br>
        <span class="hollow-text">Sweat<span class="small">&</span></span><br>
        Tears
      </h1>
    </div>
  </section>
</template>
