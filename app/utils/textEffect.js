import gsap from 'gsap'
import SplitText from 'gsap/SplitText'

export default function textEffect(scope) {
    const splits = []
    const ctx = gsap.context(() => {
        gsap.utils.toArray('.text-split').forEach((el) => {
            const split = new SplitText(el, { type: 'lines, words' })
            splits.push(split)

            gsap.from(split.words, {
                opacity: 0,
                y: 150,
                stagger: 0.05,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse',
                },
            })
        })
    }, scope)

    return () => {
        splits.forEach((s) => s.revert())
        ctx.revert()
    }
}
