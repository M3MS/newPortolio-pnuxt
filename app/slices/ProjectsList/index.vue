<script setup lang="ts">
import type { Content } from "@prismicio/client"
import gsap from 'gsap'
import SplitText from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const primsic = usePrismic();
const props = defineProps(
  getSliceComponentProps<Content.ProjectsListSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ]),
);

const projectsList = computed(() => {
  return props.slice.primary.projects_items
    .map(item => item.project)
    .filter(project => primsic.isFilled.contentRelationship(project)) as unknown as Content.ProjectDocument[];
})

onMounted(() => {
  let workItem = gsap.utils.toArray(".work-items__item");

  workItem.forEach(item => {

    let line = item.querySelectorAll('.line');
    let client = item.querySelectorAll('a');
    let workSplit = new SplitText(client, {type: "lines, words"});
    let workText = workSplit.lines;

    let workTl = gsap.timeline({
      clearProps: true,
      stagger: 0.5,
      ease: "power3inOut",
      scrollTrigger: {
        trigger: item,
        start: "top 60%"
      }
    });

    workTl.to(line, {
      scaleX: 1.0,
      duration: 1.0
    })

    workTl.from(workText, {
      opacity: 0,
      y: 150
    }, '-= 0.5')
  });

})
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="work"
  >
    <div class="work__inner">
      <h3 class="title-lg is-bold text-split">WORK</h3>
      <div class="work-items">
        <article 
          v-for="projectItem in projectsList"
          :key="projectItem.id"
          class="work-items__item" >
            <PrismicLink :document="projectItem">
              <PrismicText :field="projectItem.data.company" wrapper="h4" />
              <span class="is-bold">{{ projectItem.data.tech_stack }}</span>
            </PrismicLink>
            <span class="line"></span>
        </article>
      </div>
    </div>
  </section>
</template>
