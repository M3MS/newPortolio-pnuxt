<script setup lang="ts">
import { components } from '~/slices'
import { VueLenis, useLenis } from 'lenis/vue'
import { Scene } from '../scenes/BlobSceneClass'
import gsap from 'gsap'
import SplitText from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

const prismic = usePrismic()

const { data: page } = await useAsyncData('index', () =>
  prismic.client.getByUID('page', 'home', {
    fetchLinks: [
      'project.company',
      'project.tech_stack',
    ],
  })
)

useSeoMeta({
    title: page.value?.data.meta_title,
    ogTitle: page.value?.data.meta_title,
    description: page.value?.data.meta_description,
    ogDescription: page.value?.data.meta_description,
    ogImage: computed(() => prismic.asImageSrc(page.value?.data.meta_image)),
})

const props = defineProps(['class'])

const blob = ref(null)

const lerp = ref(0.1)
const autoRaf = ref(true)

const lenis = useLenis(
  (lenis) => {
    console.log('root scroll', lenis.options.lerp, lenis.scroll)
  },
  0,
  'root'
)

const lenisRef = ref()

watch(
  lenis,
  (lenis) => {
    console.log('page', lenis)
  },
  { immediate: true }
)

onMounted(() => {

  let textSplit = new SplitText('.text-split', {type: "lines, words"});
  let wavyText = textSplit.words;

  if (!blob.value) return;
            
  const sceneInstance = new Scene({
      domElement: blob.value // Pass native DOM element
  });

  const animMesh = sceneInstance.mesh;

  let g1Tl = gsap.timeline({
      clearProps: true,
      scrollTrigger: {
          trigger: '.hello',
          start: "top 60%",
          scrub: 2
      }
  });

  g1Tl.to(animMesh.rotation, {
      x: 0.5,
      y: -1
  });

  g1Tl.to(sceneInstance.camera.position, {
      x: 3,
      z: 4.5
  }, '-= 1');


  let g2Tl = gsap.timeline({
      clearProps: true,
      scrollTrigger: {
          trigger: '.techno',
          start: "top 80%",
          scrub: 2
      }
  });
  
  g2Tl.to(animMesh.material.uniforms.uNoiseDensity, {
      value: 2.8
  }, '-= 1');

  g2Tl.to(sceneInstance.camera.position, {
      x: 7,
      y: -3,
      z: -2
  }, '-= 1');

  wavyText.forEach(word => {

    gsap.from(word, {
      opacity: 0,
      y: 150,
      stagger: 0.5,
      ease: "power3inOut",
      scrollTrigger: {
        trigger: word,
        start: "top 70%"
      }
    })
  });

});
</script>

<template>
  <vue-lenis ref="lenisRef" root :options="{ lerp, autoRaf }">
    <div id="gl-stuff" ref="blob"></div>
    <SliceZone
      wrapper="main"
      :slices="page?.data.slices ?? []"
      :components="components"
      id="home"
    />
  </vue-lenis>
</template>
