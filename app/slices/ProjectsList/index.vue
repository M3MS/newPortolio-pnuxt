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
        start: "top 50%"
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
    id="work"
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
            <h4 v-if="projectItem.data.case_study" class="is-bold">{{ projectItem.data.case_study }}</h4>
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
    min-height: 100svh;
    color: $black;
    padding: 10vh 0;

    @media (min-width: 768px) {
      position: relative;
      min-height: 100svh;
    }

    &__inner {
      padding: 0 2rem;

      h2 {
        line-height: 1;
        
        .line,
        .line > div {
          overflow: hidden;
        }

        span {
          display: block;
          font-size: 2rem;
          line-height: 1;
        }

        @media (min-width: 768px) {
          span {
            font-size: 2svw;
          }
        }
      }
    }

    .work-items {
      margin: 4rem auto;

      @media (min-width: 768px) {
        max-width: 60vw;
        position: relative;
        margin: 6rem auto;
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
          padding: 5rem 0 1rem 1rem;
          overflow: hidden;
          color: $black;

          @media (min-width: 768px) {
            padding: 5rem 0 2rem 1rem;
          }

          h4 {
            font-size: 6vw;
            line-height: 0.9;
            transition: all 0.3s ease-in-out;
            margin-bottom: 0.5rem;

            @media (min-width: 768px) {
              font-size: 2.5vw;
            }
          }

          span {
            font-size: 1.4rem;
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