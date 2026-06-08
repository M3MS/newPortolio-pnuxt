import gsap from "gsap";
import SplitText from "gsap/SplitText";

export default function textEffect(scope) {
  const splits = [];
  const ctx = gsap.context(() => {
    gsap.utils.toArray(".text-split").forEach((el) => {
      let split = SplitText.create(el, {
        type: "lines, words",
        linesClass: "line",
        smartWrap: true,
      });
      splits.push(split);

      gsap.from(split.words, {
        autoAlpha: 0,
        y: 150,
        stagger: 0.05,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }, scope);

  return () => {
    splits.forEach((s) => s.revert());
    ctx.revert();
  };
}
