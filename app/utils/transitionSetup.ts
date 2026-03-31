import gsap from 'gsap'
import { useOverlayRef } from '~/composables/useOverlayRef'
import { useTransition } from '~/composables/transition'

const transitionSetup = {
  name: 'page-transition',
  mode: 'out-in',

  onBeforeEnter: (el: Element) => {
    gsap.set(el, { opacity: 0 })
  },

  onEnter: (el: Element, done: () => void) => {
    const { toggleTransitionComplete } = useTransition()
    const { overlayRef } = useOverlayRef()
    const overlay = overlayRef.value?.overlay
    const overlayPath = overlayRef.value?.overlayPath

    if (!overlay || !overlayPath) {
      console.warn('Overlay not available for enter transition')
      gsap.set(el, { opacity: 1 })
      toggleTransitionComplete(true)
      return done()
    }

    // Reveal: overlay path shrinks away to uncover the new page
    gsap.timeline({
      onComplete() {
        toggleTransitionComplete(true)
        done()
      },
    })
    .set(el, { opacity: 1 })
    .set(overlayPath, {
      attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
    })
    .to(overlayPath, {
      duration: 0.3,
      ease: 'power2.in',
      attr: { d: 'M 0 100 V 50 Q 50 100 100 50 V 100 z' }
    })
    .to(overlayPath, {
      duration: 0.8,
      ease: 'power4',
      attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
    })
    .set(overlay, { autoAlpha: 0 })
  },

  onLeave: (el: Element, done: () => void) => {
    const { toggleTransitionComplete } = useTransition()
    const { overlayRef } = useOverlayRef()
    const overlay = overlayRef.value?.overlay
    const overlayPath = overlayRef.value?.overlayPath

    toggleTransitionComplete(false)

    if (!overlay || !overlayPath) {
      console.warn('Overlay not available for leave transition')
      return gsap.timeline({ onComplete: done })
        .to(el, { duration: 0.6, autoAlpha: 0 })
    }

    // Cover: overlay path grows to cover the old page
    gsap.timeline({ onComplete: done })
    .set(overlay, { autoAlpha: 1 })
    .set(overlayPath, {
      attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' }
    })
    .to(overlayPath, {
      duration: 0.8,
      ease: 'power4.in',
      attr: { d: 'M 0 0 V 50 Q 50 100 100 50 V 0 z' }
    })
    .to(overlayPath, {
      duration: 0.3,
      ease: 'power2',
      attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' },
    })
    .to(el, {
      duration: 0.3,
      opacity: 0,
    }, 0)
  },
};

export default transitionSetup;