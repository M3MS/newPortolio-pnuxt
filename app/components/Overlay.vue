<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

const overlay = ref<SVGSVGElement | null>(null)
const overlayPath = ref<SVGPathElement | null>(null)

defineExpose({
  overlay,
  overlayPath,
})
</script>
<template>
  <svg class="overlay" ref="overlay" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path class="overlay__path" ref="ref="overlayPath" vector-effect="non-scaling-stroke" d="M 0 100 V 100 Q 50 100 100 100 V 100 z" />
  </svg>
</template>
<style scoped lang="scss">
.overlay {
	background-color: $dark-blue;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 9999999;
	pointer-events: none;
	width: 100%;
	height: 100%;

	path {
		fill: $red;
	}
}
</style>