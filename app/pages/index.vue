<script setup lang="ts">
import { components } from '~/slices'
import { Scene } from '../scenes/BlobSceneClass';
import gsap from 'gsap';

const prismic = usePrismic();

const { data: page } = await useAsyncData('index', () =>
  prismic.client.getByUID('page', 'home', {
    fetchLinks: [
      'project.company',
      'project.tech_stack',
    ],
  })
);

useSeoMeta({
    title: page.value?.data.meta_title,
    ogTitle: page.value?.data.meta_title,
    description: page.value?.data.meta_description,
    ogDescription: page.value?.data.meta_description,
    ogImage: computed(() => prismic.asImageSrc(page.value?.data.meta_image)),
});

const blob = ref(null);

onMounted(() => {

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
});
</script>

<template>
  <div>
    <div id="gl-stuff" ref="blob"></div>
    <SliceZone
      wrapper="main"
      :slices="page?.data.slices ?? []"
      :components="components"
      id="home"
    />
  </div>
</template>
