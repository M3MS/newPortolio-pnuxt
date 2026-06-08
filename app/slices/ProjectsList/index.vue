<script setup lang="ts">
import type { Content } from "@prismicio/client";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

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
    .map((item) => item.project)
    .filter((project) =>
      primsic.isFilled.contentRelationship(project),
    ) as unknown as Content.ProjectDocument[];
});

const splits: SplitText[] = [];
let ctx: any = null;

onMounted(() => {
  ctx = gsap.context(() => {
    const workItems = gsap.utils.toArray<HTMLElement>(".work-items__item");

    workItems.forEach((item) => {
      const line = item.querySelector(".line");
      const links = Array.from(item.querySelectorAll("a"));
      const workSplit = SplitText.create(links, { type: "lines, words" });
      splits.push(workSplit);

      const workTl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
        },
      });

      workTl.to(line, {
        scaleX: 1.0,
        duration: 1.0,
      });

      workTl.from(
        workSplit.lines,
        {
          opacity: 0,
          y: 150,
          stagger: 0.1,
        },
        "-=0.5",
      );
    });
  });
});

onUnmounted(() => {
  splits.forEach((s) => s.revert());
  ctx?.revert();
});
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
          class="work-items__item"
        >
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
