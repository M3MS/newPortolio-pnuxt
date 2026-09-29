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
      <div class="credits is-flex">
        <span>Copyright Mehdy El Marabti - 2026</span> | 
        <span>Made with ❤️‍🔥 using 
          <NuxtLink external href="https://nuxt.com/">Nuxt</NuxtLink>, 
          <NuxtLink external href="https://prismic.io/">Prismic</NuxtLink>, 
          <NuxtLink href="https://threejs.org/" external>Threejs</NuxtLink> 
          and <NuxtLink external href="https://gsap.com/">GSAP</NuxtLink>
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  position: relative;
  width: 100%;
  min-height: 50vh;
  mix-blend-mode: difference;
  background-color: $black;
  justify-content: center;
  align-items: center;
  padding: 5svh 0;
  color: $red;

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
      -webkit-text-stroke: 3px $green;
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

      &:hover {
        transform: translateY(15);
      }
    }
  }

  .credits {
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    max-width: 70svw;
    margin: auto;
    justify-content: center;
    align-items: baseline;
    gap: 1.5rem;
    padding: 1rem;
    text-align: center;

    @media (min-width: 768px) {
        padding: 3rem;
    }

    a {
        display: inline-block;
    }
  }
}
</style>
