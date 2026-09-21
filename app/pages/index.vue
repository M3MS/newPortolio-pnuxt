<script setup lang="ts">
import { components } from "~/slices";
import { ref, watchEffect } from "vue";
import { Scene } from "~/scenes/BlobSceneClass";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import textEffect from "~/utils/textEffect";

const prismic = usePrismic();
const route = useRoute();
const { data: page } = await useAsyncData("index", () =>
  prismic.client.getByUID("page", (route.params.uid as string) ?? "home", {
    fetchLinks: ["project.company", "project.tech_stack"],
  }),
);

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => prismic.asImageSrc(page.value?.data.meta_image)),
});

const blob = ref(null);

const lerp = ref(0.1);

const autoRaf = ref(false);

const lenisRef = ref();

let sceneInstance: any = null;
let textEffectCleanup: (() => void) | null = null;
let ctx: any = null;

watchEffect((onInvalidate) => {
  if (!lenisRef.value?.lenis) return;

  lenisRef.value.lenis.on("scroll", ScrollTrigger.update);

  function update(time: number) {
    lenisRef.value?.lenis?.raf(time * 1000);
  }
  gsap.ticker.add(update);

  onInvalidate(() => {
    gsap.ticker.remove(update);
  });
});

onMounted(() => {
  if (!blob.value) return;

  sceneInstance = new Scene({ domElement: blob.value });
  const animMesh = sceneInstance.mesh;

  ctx = gsap.context(() => {
    gsap.to(".scroller, #gl-stuff", {
      autoAlpha: 1,
      duration: 2.0,
      ease: "power3inOut",
    });

    const cameraTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".work",
        start: "top 80%",
        endTrigger: ".about",
        end: "top 50%",
        scrub: 2,
      },
    });

    cameraTl
      //.to(sceneInstance.camera.position, { x: -3, y: 0, z: 4.5 })
      .to(sceneInstance.camera.position, { x: 0, y: 0.5, z: 8, duration: 2.5 })
      .to(animMesh.material.uniforms.uNoiseDensity, {
        value: 3.8,
        duration: 2.5,
      })
      .to(sceneInstance.camera.position, {
        x: 3.5,
        y: 1,
        z: 3.5,
        duration: 2.5,
      });
  });

  gsap.from(".about__text", {
    scrollTrigger: {
      trigger: ".about__text",
      start: "top 80%",
      end: "top 50%",
      scrub: 2,
    },
    autoAlpha: 0,
    duration: 2,
    ease: "power3inOut",
  });

  document.fonts.ready.then(() => {
    textEffectCleanup = textEffect();
    ScrollTrigger.refresh();
  });
});

onUnmounted(() => {
  textEffectCleanup?.();
  ctx?.revert();
  sceneInstance?.cleanup();
});
</script>

<template>
  <div>
    <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }">
      <div id="gl-stuff" ref="blob" />
      <SliceZone
        id="home"
        wrapper="main"
        :slices="page?.data.slices ?? []"
        :components="components"
      />
    </vue-lenis>
  </div>
</template>
