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

<style scoped lang="scss">
.site-footer {
  mix-blend-mode: soft-light;
  background-color: $black;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  a.contact {
      display: block;
      position: relative;
      white-space: nowrap;
  }

  .socials {
      color: $white;
      display: flex;
      width: 100%;
      justify-content: center;
      margin-top: 2vh;
      list-style: none;

      a {
          padding: 0 2vw;
      }
  }
}
</style>