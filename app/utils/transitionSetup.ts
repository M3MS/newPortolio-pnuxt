import gsap from 'gsap'
import { useOverlayRef } from '~/composables/useOverlayRef'
import { useTransition } from '~/composables/transition'

const duration = 0.6

const transitionSetup = {
  name: 'page-transiton',

  onBeforeEnter: (el: Element) => {
    gsap.set(el, { opacity: 0 })
  },

  onEnter: (el: Element, done: () => void) => {
    const { toggleTransitionComplete } = useTransition()
    const { overlayRef } = useOverlayRef()
    const overlay = overlayRef.value?.overlay
    const overlayPath = overlayRef.value?.overlayPath

    if (!overlayRef.value) {
      console.warn('Overlay ref not available')
      return done()
    }

    if (!overlay) {
      console.warn('Overlay element not available');
      return done();
    }

    if (!overlayPath) {
      console.warn('Overlay path not available');
      return done();
    }

    gsap.timeline({
      onComplete() {
        toggleTransitionComplete(true);
        done();
        console.log('Transition complete');
      },
    })
    .to(el, {
      opacity: 1,
    }, '-=0.4')
    .set(overlayPath, { 
        attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' }
    })
    .to(overlayPath, { 
        duration: 0.3,
        ease: 'power2.in',
        attr: { d: 'M 0 0 V 50 Q 50 0 100 50 V 0 z' }
    })
    .to(overlayPath, { 
        duration: 0.8,
        ease: 'power4',
        attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' }
    })
    .set(overlay, { autoAlpha: 0 })
  },

  onLeave: (el: Element, done: () => void) => {
    const { toggleTransitionComplete } = useTransition()
    const { overlayRef } = useOverlayRef()
    const overlay = overlayRef.value?.overlay
    const overlayPath = overlayRef.value?.overlayPath

    toggleTransitionComplete(false)

    if (!overlayRef.value || !overlay || !overlayPath) {
      console.warn('Overlay not available for leave transition')
      return gsap.timeline({ onComplete: done })
        .to(el, { duration, autoAlpha: 0 })
    }

    gsap.timeline({ 
      onComplete(){
        done();
        console.log('YOOO');
      }
    })
    .set(overlay, { autoAlpha: 1 })
    .set(overlayPath, {
      attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
    })
    .to(overlayPath, { 
      duration: 0.8,
      ease: 'power4.in',
      attr: { d: 'M 0 100 V 50 Q 50 0 100 50 V 100 z' }
    }, 0)
    .to(overlayPath, { 
      duration: 0.3,
      ease: 'power2',
      attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' },
    })
    .to(el, { 
      duration: 0.3,
      opacity: 0,
      ease: 'power2.in'
    }, '-=0.6')
  },
};

export default transitionSetup;