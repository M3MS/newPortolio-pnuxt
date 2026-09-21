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
    const workSection = document.querySelector(".work");

    gsap.to(workSection, {
      backgroundColor: "#ffffff",
      duration: 1.0,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: workSection,
        start: "top 50%",
        markers: true,
      },
    });

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
      <h2 class="title-md is-bold text-split">
        <span class="title-sm">SELECTED</span>
        WORK
      </h2>
      <div class="work-items">
        <article
          v-for="projectItem in projectsList"
          :key="projectItem.id"
          class="work-items__item"
        >
          <PrismicLink :document="projectItem">
            <PrismicText :field="projectItem.data.company" wrapper="h4" class="is-bold" />
            <span>{{ projectItem.data.tech_stack }}</span>
          </PrismicLink>
          <span class="line"></span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">

.work {
    height: 120svh;
    color: $black;
    padding: 10vh 0;

    &__inner {
      padding: 0 2rem;
      h2 {
        span {
          display: block;
          font-size: 2svw;
          line-height: 1;
        }
      }
    }

    .work-items {
      max-width: 90vw;
      margin: 6rem auto;

      @media (min-width: 768px) {
        max-width: 60vw;
        position: relative;
      }

      &__item {
        position: relative;
        width: 100%;
        display: block;
        text-transform: uppercase;

        a {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5rem 0 2rem 1rem;
          overflow: hidden;
          color: $black;

          h4 {
            font-size: 6vw;
            line-height: 0.9;
            transition: all 0.3s ease-in-out;

            @media (min-width: 768px) {
              font-size: 2.5vw;
            }
          }

          &:hover {
            h4 {
              letter-spacing: 10px;
            }
          }
        }

        .line {
          width: 100%;
          height: 1px;
          background: $black;
          position: absolute;
          bottom: 0;
          transform: scaleX(0);
          transform-origin: left;
        }
      }
    }
  }
</style>