<script setup lang="ts">
import type { Content } from "@prismicio/client";

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

</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    data-scroll-section 
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
              <span>{{ projectItem.data.tech_stack }}</span>
            </PrismicLink>
            <span class="line"></span>
        </article>
      </div>
    </div>
  </section>
</template>
