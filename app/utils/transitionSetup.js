import gsap from 'gsap';
import Overlay from '~/components/Overlay.vue'
import { useTransition } from '../composables/transition';

const { toggleTransitionComplete } = useTransition();
const overlayRef = ref<InstanceType<typeof Overlay> | null>(null)

const duration = 0.6;

const transitionSetup = {
  name: 'page-transiton',
  mode: '',
  onBeforeEnter: (el) => {
    console.log('Before enter...')
  },
  onEnter: (el, done) => {
    const { overlayRef } = useOverlayRef()
    const overlay = overlayRef.value?.overlay
    const overlayPath = overlayRef.value?.overlayPath
    
    gsap.timeline({delay: 1})
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
        .to(overlay, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        })
  },
  onLeave: (el, done) => {
    toggleTransitionComplete(false);
    gsap
      .timeline({ paused: true, onComplete: done })
      .to(el, { duration: duration })
      .play();
  },
};

export default transitionSetup;