<script setup lang="ts">
import type { Content } from "@prismicio/client";

defineProps(
  getSliceComponentProps<Content.AboutSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="about"
  >
    <div class="about__inner">
      <h2 class="about__title title-lg is-bold text-split">ABOUT</h2>
      <PrismicImage :field="slice.primary.background" class="about__img" />
      <div class="is-flex justify-end">
        <PrismicRichText
          :field="slice.primary.about_text"
          wrapper="div"
          class="about__text text-split"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about {
    position: relative;
    overflow: hidden;

    &__inner {
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      justify-content: space-between;
      padding: 0 2rem;
      margin: 0 auto;
      width: 100%;
      min-height: 100vh;
    }

    &__title {
      display: block;
      width: 100%;
      flex: 0 0 100%;
      margin-top: 5svh;
    }

    &__text {
      width: 100%;
      padding: 2rem;
      margin-bottom: 2rem;
      color: #010101;
      background: #ffffff;
      border-radius: 2rem;
      font-size: 1.4rem;

      @media (min-width: 768px) {
        max-width: 500px;
        margin: 2vw 55px 2vw;
        padding: 50px;
        font-size: 25px;
      }
    }

    &__img {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      object-fit: cover;
      object-position: center;
    }
  }
</style>