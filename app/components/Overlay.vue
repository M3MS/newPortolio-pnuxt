<script lang="ts" setup>
import { onMounted } from 'vue';
import { gsap } from 'gsap';

onMounted(() => {

  const overlay = document.querySelector('.overlay');
  const overlayPath = document.querySelector('.overlay__path') as SVGPathElement;
  gsap.timeline({delay: 1})
    .set(overlayPath, { 
      attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
    })
    .to(overlayPath, { 
      duration: 0.3,
      ease: 'power2.in',
      attr: { d: 'M 0 100 V 50 Q 50 100 100 50 V 100 z' }
    })
    .to(overlayPath, { 
      duration: 0.8,
      ease: 'power4',
      attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
    })
    .to(overlay, {
      autoAlpha: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    })

});
</script>

<template>

    <svg class="overlay" ref="overlay" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path class="overlay__path" vector-effect="non-scaling-stroke" d="M 0 100 V 100 Q 50 100 100 100 V 100 z" />
    </svg>

</template>
