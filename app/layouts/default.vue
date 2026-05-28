<script lang="ts" setup>
import { useOverlayRef } from '~/composables/useOverlayRef'
import Overlay from '~/components/Overlay.vue'
import Cursor from '~/components/Cursor.vue'

const prismic = usePrismic()

const { setOverlayRef } = useOverlayRef()

const { data: settings } = await useAsyncData( () => prismic.client.getSingle('settings'))

useSeoMeta({
    title: settings.value?.data.site_title,
    ogTitle: settings.value?.data.site_title,
    description: settings.value?.data.meta_description,
    ogDescription: settings.value?.data.meta_description,
    ogImage: computed(() => prismic.asImageSrc(settings.value?.data.meta_image)),
})
</script>

<template>
    <div>
        <Cursor />
        <AppHeader :settings="settings" />
        <slot />
        <AppFooter :settings="settings" />
        <Overlay :ref="setOverlayRef" />
    </div>
</template>
