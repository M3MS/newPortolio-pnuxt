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