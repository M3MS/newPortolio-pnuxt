import { ref, readonly } from 'vue'

// Global reference to store the overlay component instance
const overlayRef = ref<any>(null)

export const useOverlayRef = () => {
  const setOverlayRef = (ref: any) => {
    overlayRef.value = ref
  }

  return {
    overlayRef: readonly(overlayRef),
    setOverlayRef
  }
}