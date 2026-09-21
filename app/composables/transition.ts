import { reactive } from 'vue';

const transitionState = reactive({
  transitionComplete: false,
});

export const useTransition = () => {
  const toggleTransitionComplete = (value: boolean) => {
    transitionState.transitionComplete = value;
  };

  return {
    transitionState,
    toggleTransitionComplete,
  };
}
