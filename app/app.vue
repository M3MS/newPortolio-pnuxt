<script lang="ts" setup>
import transitionSetup from '~/utils/transitionSetup'
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="transitionSetup" />
  </NuxtLayout>
</template>
