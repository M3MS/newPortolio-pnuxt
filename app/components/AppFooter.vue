<script lang="ts" setup>
import { NuxtLink } from "#components";
import type { Content } from "@prismicio/client";

defineProps<{
  settings?: Content.SettingsDocument;
}>();
</script>

<template>
  <footer class="site-footer is-flex">
    <div class="site-footer__inner">
      <h2 class="lead is-bold text-center text-split">Let's have a chat!</h2>
      <NuxtLink
        class="title-md is-bold text-center contact text-split"
        href="mailto:contact@mehdy-elm.com"
        external
        >
        Contact
      </NuxtLink>
      <ul class="socials">
        <li v-for="link in settings?.data.footer_nav" :key="link.key">
          <PrismicLink :field="link" class="small" />
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  width: 100%;
  min-height: 50vh;
  mix-blend-mode: soft-light;
  background-color: $black;
  justify-content: center;
  align-items: center;
  padding: 5svh 0;

  &__inner {
    h2 {
      margin-bottom: 25px;
    }
  }

  .contact {
    display: flex;
    justify-content: space-between;
    gap: 1.6rem;
    position: relative;
    white-space: nowrap;
    line-height: 0.9;
    transition: all 0.3s ease;

    &:hover {
      -webkit-text-stroke: 2px $white;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
  }

  .socials {
    color: $white;
    display: flex;
    width: 100%;
    justify-content: center;
    margin-top: 3svh;
    list-style: none;

    a {
      padding: 0 2vw;
    }
  }
}
</style>
