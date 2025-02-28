<script lang="ts" setup>
import { NuxtLink } from "#components";
import type { Content } from "@prismicio/client"

defineProps<{
  settings?: Content.SettingsDocument
}>()
</script>

<template>
  <footer class="site-footer">
    <div class="more__inner">
      <NuxtLink class="title-md is-bold text-center contact" href="mailto:contact@mehdy-elm.com" target="_blank">contact</NuxtLink>
      <ul class="socials">
        <li v-for="link in settings?.data.footer_nav" :key="link.key">
          <PrismicLink
            :field="link"
            class="small"
          />
        </li>
      </ul>
    </div>
  </footer>
</template>