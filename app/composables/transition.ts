import { reactive } from 'vue';

const transitionState = reactive({
  transitionComplete: false,
});

export const useTransition = () => {
  const toggleTransitionComplete = (value) => {
    transitionState.transitionComplete = value;
  };

  return {
    transitionState,
    toggleTransitionComplete,
  };
}
