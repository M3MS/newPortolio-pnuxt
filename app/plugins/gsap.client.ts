import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import { GSDevTools } from "gsap/GSDevTools"

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.ticker.lagSmoothing(0)
})
