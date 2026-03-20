<script lang="ts" setup>
import { NuxtLink } from "#components";
import type { Content } from "@prismicio/client"

defineProps<{
  settings?: Content.SettingsDocument
}>()
</script>

<template>
  <header class="site-header">
    <NuxtLink to="/" class="logo">
      El Marabti Mehdy - Creative Developer
    </NuxtLink>
  </header>
</template>

<style scoped lang="scss" >
.site-header {
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
  padding: 1rem;
  writing-mode: vertical-lr;
  mix-blend-mode: difference;

  @media (min-width: 768px) {
      padding: 3rem;
  }


	a {
	    display: inline-block;
	}

}
</style>